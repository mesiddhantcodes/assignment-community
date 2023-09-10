import express from 'express';
import * as communityController from '../controllers/community.controller';
import { verifyJWTMiddleware } from '../utils/jwt';

const router = express.Router();
router.post('/', verifyJWTMiddleware, communityController.community);
router.get('/', verifyJWTMiddleware, communityController.getAllcommunity);
// router.get('/:id', verifyJWTMiddleware, communityController.getcommunityBySlug);
router.get('/:id/members', communityController.getAllCommunityMembers);
router.get('/me/owner',verifyJWTMiddleware,communityController.getOwnedCommunity);

export default router;