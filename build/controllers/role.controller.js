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
exports.getAllRoles = exports.createRole = void 0;
const snowflake_1 = require("../utils/snowflake");
const db_1 = require("../utils/db");
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = req.body;
        role.id = (0, snowflake_1.generateId)();
        const db = (0, db_1.getDatabase)();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const rolesCollection = db.collection('roles');
        let checkIfRoleExists = yield rolesCollection.findOne({ name: role.name });
        if (checkIfRoleExists) {
            return res.status(409).json({ success: false, error: 'Role already exists' });
        }
        role.created_at = new Date();
        role.updated_at = new Date();
        const result = yield rolesCollection.insertOne(role);
        if (!result.insertedId) {
            return res.status(500).json({ success: false, error: "Something went wrong" });
        }
        res.status(201).json({
            "status": true,
            "content": {
                "data": {
                    "id": role.id,
                    "name": role.id,
                    "created_at": role.created_at,
                    "updated_at": role.updated_at
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Something went wrong" });
    }
});
exports.createRole = createRole;
const getAllRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role = req.body;
        const db = (0, db_1.getDatabase)();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const pageSize = 10;
        const page = 1;
        // const skip = (page - 1) * pageSize;
        const rolesCollection = db.collection('roles');
        const result = yield rolesCollection.find().toArray();
        if (!result) {
            return res.status(500).json({ success: false, error: "Something went wrong" });
        }
        const total = yield rolesCollection.countDocuments();
        res.status(200).json({
            success: true, content: {
                meta: {
                    total,
                    pages: Math.ceil(total / pageSize),
                    page,
                },
                data: result.map((role) => {
                    return {
                        id: role.id,
                        name: role.name,
                        created_at: role.created_at,
                        updated_at: role.updated_at
                    };
                })
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Something went wrong" });
    }
});
exports.getAllRoles = getAllRoles;
