'use strict';

require('dotenv').config();

import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as ejs from 'ejs';
import * as cors from 'cors';

import { Jwt } from './models/jwt';

const jwt = new Jwt();

import index from './routes/index';
import login from './routes/login';
import api from './routes/api';

const session = require('express-session');
const socketIo = require('socket.io');

const io = socketIo();

import Knex = require('knex');
import { MySqlConnectionConfig } from 'knex';

const app: express.Express = express();

app.io = io;

app.use((req, res, next) => {
  req.io = io;
  next();
})

io.on('connection', (socket: any) => {
  console.log('User connected!');

  socket.on('welcome', (data: any) => {
    // response
    console.log(data);
  });

  socket.on('adduser', () => {
    console.log('Add user!')
    // response
    io.emit('added-user', 'xxxxxx');
  });

});

//view engine setup

app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.renderFile);
app.set('view engine', 'html');

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname,'public','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

const connection: MySqlConnectionConfig = {
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}

const db = Knex({
  client: 'mysql',
  connection: connection,
  debug: true
});

app.use((req, res, next) => {
  // console.log('Middleware......')
  req.db = db;
  next();
});

app.use(session({
  secret: 'testsession0011122233',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

var auth = (req, res, next) => {
  if (req.session.logged) {
    next();
  } else {
    res.redirect('/login');
  }
}

var authApi = (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token){
    token = req.query.token;
  } else if (req.body && req.body.toke) {
    token = req.body.token;
  } else {
    token = req.body.token;
  }

  jwt.verify(token)
  .then((decoded: any) => {
    req.decoded = decoded;
    next();
  })
  .catch((error: any) => {
    return res.send({ok: false, error: 'No token!'});
  })
}

app.use('/api', authApi, api);
app.use('/login', login);
app.use('/', auth, index);

//catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err['status'] = 404;
  next(err);
});

//error handlers

//development error handler
//will print stacktrace
if (process.env.NODE_ENV === 'development') {
  app.use((err: Error, req, res, next) => {
    res.status(err['status'] || 500);
    res.send({
      title: 'error',
      message: err.message,
      error: err
    });
  });
}

//production error handler
// no stacktrace leaked to user
app.use((err: Error, req, res, next) => {
  res.status(err['status'] || 500);
  res.send({
    title: 'error',
    message: err.message,
    error: {}
  });
});

export default app;
