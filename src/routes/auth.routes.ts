import express from 'express';
import * as authController from '../controllers/auth.controller';
import { verifyJWTMiddleware } from '../utils/jwt';
const router = express.Router();
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.get('/me',verifyJWTMiddleware ,authController.me);
export default router;
