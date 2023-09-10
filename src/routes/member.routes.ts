import express from 'express';
import * as memberController from '../controllers/member.controller';
import { verifyJWTMiddleware } from '../utils/jwt';
const router = express.Router();
router.post('/', verifyJWTMiddleware, memberController.addMember);
export default router;