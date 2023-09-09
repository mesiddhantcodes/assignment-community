"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwt_1 = require("../utils/jwt");
const role_controller_1 = require("../controllers/role.controller");
const router = express_1.default.Router();
router.post("/", jwt_1.verifyJWTMiddleware, role_controller_1.createRole);
router.get("/", jwt_1.verifyJWTMiddleware, role_controller_1.getAllRoles);
exports.default = router;
