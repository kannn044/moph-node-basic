"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const user_1 = require("./../models/user");
const userModel = new user_1.UserModel();
const userTypeModel = new user_1.UserTypeModel();
router.get('/users', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let rs = yield userModel.getUsers(req.db);
        res.send({ ok: true, rows: rs });
    }
    catch (error) {
        res.send({ ok: false, error: error.message });
    }
}));
router.get('/users/:userId', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let userId = req.params.userId;
    try {
        let rs = yield userModel.getDetail(req.db, userId);
        res.send({ ok: true, rows: rs[0] });
    }
    catch (error) {
        res.send({ ok: false, error: error.message });
    }
}));
router.get('/users/maps/:userId', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let userId = req.params.userId;
    try {
        let rs = yield userModel.getLatLng(req.db, userId);
        if (rs.length) {
            res.send({ ok: true, lat: rs[0].lat, lng: rs[0].lng });
        }
        else {
            res.send({ ok: false });
        }
    }
    catch (error) {
        res.send({ ok: false, error: error.message });
    }
}));
router.put('/users/maps/:userId', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let userId = req.params.userId;
    let lat = req.body.lat;
    let lng = req.body.lng;
    try {
        let rs = yield userModel.updateLatLng(req.db, userId, lat, lng);
        res.send({ ok: true });
    }
    catch (error) {
        res.send({ ok: false, error: error.message });
    }
}));
router.get('/user-types', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let rs = yield userModel.getUserTypeList(req.db);
        res.send({ ok: true, rows: rs });
    }
    catch (error) {
        res.send({ ok: false, error: error.message });
    }
}));
router.get('/types', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let rs = yield userTypeModel.getUserTypeList(req.db);
        res.send({ ok: true, rows: rs });
    }
    catch (error) {
        res.send({ ok: false, error: error.message });
    }
}));
router.post('/users', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let username = req.body.username;
    let password = req.body.password;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let isActive = req.body.isActive;
    let userTypeId = req.body.userType;
    if (username && password && firstName && lastName) {
        let encPassword = crypto.createHash('md5').update(password).digest('hex');
        let user = {
            username: username,
            password: encPassword,
            first_name: firstName,
            last_name: lastName,
            is_active: isActive,
            user_type_id: userTypeId
        };
        req.io.emit('added-user', firstName);
        req.io.emit('change-graph');
        yield userModel.saveUser(req.db, user);
        res.send({ ok: true });
    }
    else {
        res.send({ ok: false, error: 'ข้อมูลไม่ครบถ้วน' });
    }
}));
router.put('/users/:userId', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let userId = req.params.userId;
    let password = req.body.password;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let isActive = req.body.isActive;
    let userTypeId = req.body.userType;
    if (userId && firstName && lastName) {
        let user = {
            first_name: firstName,
            last_name: lastName,
            is_active: isActive,
            user_type_id: userTypeId
        };
        if (password) {
            let encPassword = crypto.createHash('md5').update(password).digest('hex');
            user.password = encPassword;
        }
        yield userModel.updateUser(req.db, userId, user);
        res.send({ ok: true });
    }
    else {
        res.send({ ok: false, error: 'ข้อมูลไม่ครบถ้วน' });
    }
}));
router.delete('/users/:userId', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let userId = req.params.userId;
        req.io.emit('removed-user');
        req.io.emit('change-graph');
        yield userModel.removeUser(req.db, userId);
        res.send({ ok: true });
    }
    catch (error) {
        res.send({ ok: false, error: error.message });
    }
}));
exports.default = router;
//# sourceMappingURL=api.js.map