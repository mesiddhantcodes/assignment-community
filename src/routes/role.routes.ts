import express from 'express';
import { verifyJWTMiddleware } from '../utils/jwt';
import { createRole, getAllRoles } from '../controllers/role.controller';

const router = express.Router();

router.post("/", verifyJWTMiddleware, createRole)
router.get("/",verifyJWTMiddleware,getAllRoles)

export default router