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
exports.removeMember = exports.addMember = void 0;
const db_1 = require("../utils/db");
const snowflake_1 = require("../utils/snowflake");
const addMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { communityId, userId, roleId } = req.body;
    const member = req.body;
    const db = (0, db_1.getDatabase)();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database connection error' });
    }
    const memberCollection = db.collection('member');
    const communitiesCollection = db.collection('communities');
    const usersCollection = db.collection('users');
    const checkIfMemberExists = yield usersCollection.findOne({ email: req.user.email });
    if (!checkIfMemberExists) {
        return res.status(409).json({ success: false, error: 'Member already exists' });
    }
    const community = yield communitiesCollection.findOne({ id: member.community });
    if (!community) {
        return res.status(404).json({ success: false, error: 'Community not found' });
    }
    console.log(checkIfMemberExists.id, community.owner);
    if (checkIfMemberExists.id !== community.owner) {
        return res.status(401).json({ success: false, error: 'NOT_ALLOWED_ACCESS' });
    }
    member.id = (0, snowflake_1.generateId)();
    const result = yield memberCollection.insertOne({
        id: member.id,
        community: member.community,
        user: member.user,
        role: member.role,
        created_at: new Date(),
    });
    if (!result.insertedId) {
        return res.status(500).json({ success: false, error: "Something went wrong" });
    }
    res.status(201).json({
        status: true,
        content: {
            data: {
                id: member.id,
                community: member.community,
                user: member.user,
                role: member.role,
                created_at: new Date(),
            }
        }
    });
});
exports.addMember = addMember;
const removeMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params;
    try {
        const db = (0, db_1.getDatabase)();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const memberCollection = db.collection('member');
        const usersCollection = db.collection('users');
        const communitiesCollection = db.collection('communities');
        console.log(userId.id);
        const memberDetails = yield memberCollection.findOne({ id: userId.id });
        console.log(memberDetails);
        if (!memberDetails) {
            return res.status(404).json({ success: false, error: 'Member not found' });
        }
        const result = yield memberCollection.aggregate([
            {
                $match: { community: memberDetails.community },
            },
            {
                $lookup: {
                    from: 'communities',
                    localField: 'community',
                    foreignField: 'id',
                    as: 'community',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: 'id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: 'id',
                    as: 'role',
                }
            },
            {
                $unwind: '$role',
            },
            {
                $unwind: '$community',
            },
            {
                $unwind: '$user',
            },
            {
                $project: {
                    _id: 0,
                    communityId: '$community.id',
                    ownerId: '$community.owner',
                    userId: '$user.id',
                    role: '$role.name',
                },
            },
        ]).toArray();
        console.log(result);
        if (result.length === 0) {
            return res.status(404).json({ success: false, error: 'Member not found' });
        }
        const memberData = result[0];
        // console.log(memberData)
        const { ownerId, userId: memberId, role: role } = memberData;
        console.log(ownerId, memberId);
        // Check if the requestor is the owner
        const requestorUserId = req.user.id;
        if (requestorUserId !== ownerId.id) {
            return res.status(401).json({ success: false, error: 'NOT_ALLOWED_ACCESS' });
        }
        // Delete the member
        const deleteResult = yield memberCollection.deleteOne({ id: userId.id });
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ success: false, error: 'Member not found' });
        }
        res.status(200).json({ success: true, content: { data: deleteResult.deletedCount } });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Something went wrong' });
    }
});
exports.removeMember = removeMember;
