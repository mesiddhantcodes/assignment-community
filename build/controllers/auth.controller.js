"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.signin = exports.signup = void 0;
const User_1 = require("../interfaces/User");
const db_1 = require("../utils/db");
const snowflake_1 = require("../utils/snowflake");
const jwt_1 = require("../utils/jwt");
const bcrypt_1 = require("../utils/bcrypt");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        const isUserValid = (0, User_1.validateUser)(user);
        if (isUserValid.length > 0) {
            return res.status(400).json({ success: false, error: isUserValid });
        }
        user.id = (0, snowflake_1.generateId)();
        const db = (0, db_1.getDatabase)();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const usersCollection = db.collection('users');
        const checkIfUserExists = yield usersCollection.findOne({ email: user.email });
        if (checkIfUserExists) {
            return res.status(409).json({ success: false, error: 'User already exists' });
        }
        user.password = yield (0, bcrypt_1.hashPassword)(user.password);
        user.created_at = new Date();
        const result = yield usersCollection.insertOne(user);
        const access_token = (0, jwt_1.generateJWT)(user);
        if (result.insertedId) {
            res.status(201).json({
                status: true,
                content: {
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        created_at: user.created_at
                    },
                    meta: {
                        access_token,
                    }
                }
            });
        }
        else {
            res.status(500).json({ success: false, error: "Something Went Wrong" });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Something Went Wrong" });
    }
});
exports.signup = signup;
// Signin controller
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    const db = (0, db_1.getDatabase)();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database connection error' });
    }
    const usersCollection = db.collection('users');
    const checkIfUserExists = yield usersCollection.findOne({ email: user.email });
    if (!checkIfUserExists) {
        return res.status(400).json({ success: false, error: 'User dose not exists' });
    }
    else {
        const access_token = (0, jwt_1.generateJWT)(user);
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: checkIfUserExists.id,
                    name: checkIfUserExists.name,
                    email: checkIfUserExists.email,
                    created_at: checkIfUserExists.created_at,
                },
                meta: {
                    access_token,
                }
            }
        });
    }
});
exports.signin = signin;
const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.user.email;
    const db = (0, db_1.getDatabase)();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database connection error' });
    }
    const usersCollection = db.collection('users');
    const user = yield usersCollection.findOne({ email });
    if (!user) {
        return res.status(400).json({ success: false, error: 'User dose not exists' });
    }
    else {
        res.status(200).json({
            "status": true,
            "content": {
                "data": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "created_at": user.created_at,
                }
            }
        });
    }
});
exports.me = me;
