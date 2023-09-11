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
exports.getJoinedCommunity = exports.getOwnedCommunity = exports.getAllCommunityMembers = exports.getAllcommunity = exports.community = void 0;
const db_1 = require("../utils/db");
const Community_1 = require("../interfaces/Community");
const slug_1 = require("../utils/slug");
const snowflake_1 = require("../utils/snowflake");
const community = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const community = req.body;
        const errors = (0, Community_1.validateCommunity)(community);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, error: errors });
        }
        const db = (0, db_1.getDatabase)();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const communitiesCollection = db.collection('communities');
        const usersCollection = db.collection('users');
        const checkIfCommunityExists = yield communitiesCollection.findOne({ name: community.name });
        if (checkIfCommunityExists) {
            return res.status(409).json({ success: false, error: 'Community already exists' });
        }
        community.slug = yield (0, slug_1.generateUniqueSlug)(db, community.name);
        community.created_at = new Date();
        community.updated_at = new Date();
        const owner = yield usersCollection.findOne({ email: req.user.email });
        if (!owner) {
            return res.status(409).json({ success: false, error: 'Owner does not exists' });
        }
        community.id = (0, snowflake_1.generateId)();
        community.owner = owner.id;
        const result = yield communitiesCollection.insertOne(community);
        if (result.insertedId) {
            res.status(201).json({
                status: true,
                content: {
                    data: {
                        id: community.id,
                        name: community.name,
                        slug: community.slug,
                        owner: community.owner,
                        created_at: community.created_at,
                        updated_at: community.updated_at
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
exports.community = community;
const getAllcommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = (0, db_1.getDatabase)();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const communitiesCollection = db.collection('communities');
        const pageSize = 10;
        const page = 1;
        const skip = (page - 1) * pageSize;
        const total = yield communitiesCollection.countDocuments();
        const communities = yield communitiesCollection.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: 'id',
                    as: 'owner'
                }
            },
            {
                $unwind: '$owner'
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    slug: 1,
                    created_at: 1,
                    updated_at: 1,
                    owner: {
                        name: '$owner.name',
                        email: '$owner.email',
                    }
                }
            }
        ]).skip(skip).limit(pageSize).toArray();
        res.status(200).json({
            success: true, content: {
                meta: {
                    total,
                    page,
                    pages: Math.ceil(total / pageSize)
                }
            },
            data: communities
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Something went wrong" });
    }
});
exports.getAllcommunity = getAllcommunity;
const getAllCommunityMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { communityId } = req.params;
        const db = (0, db_1.getDatabase)();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const communitiesCollection = db.collection('communities');
        const membersCollection = db.collection('member');
        const memberCommunity = yield membersCollection.find({ community: communityId });
        // console.log(collection);
        if (!memberCommunity) {
            return res.status(404).json({
                success: false,
                error: 'Member not found in community'
            });
        }
        const pageSize = 10;
        const page = 1;
        const skip = (page - 1) * pageSize;
        const total = yield communitiesCollection.countDocuments();
        const members = yield membersCollection.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: 'id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: 'id',
                    as: 'role'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $unwind: '$role'
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    community: 1,
                    user: {
                        id: '$user.id',
                        name: '$user.name'
                    },
                    role: {
                        id: '$role.id',
                        name: '$role.name'
                    },
                    created_at: 1,
                }
            }
        ]).skip(skip).limit(pageSize).toArray();
        res.status(200).json({
            success: true, content: {
                meta: {
                    total,
                    page,
                    pages: Math.ceil(total / pageSize)
                }
            },
            data: members
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Something went wrong" });
    }
});
exports.getAllCommunityMembers = getAllCommunityMembers;
const getOwnedCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = (0, db_1.getDatabase)();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const communitiesCollection = db.collection('communities');
        const usersCollection = db.collection('users');
        const checkIfOwnerExists = yield usersCollection.findOne({ email: req.user.email });
        if (!checkIfOwnerExists) {
            return res.status(409).json({ success: false, error: 'Owner does not exists' });
        }
        const pageSize = 10;
        const page = 1;
        const skip = (page - 1) * pageSize;
        const total = yield communitiesCollection.countDocuments();
        const communities = yield communitiesCollection.aggregate([
            {
                $match: { owner: checkIfOwnerExists.id }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: 'id',
                    as: 'owner'
                }
            },
            {
                $unwind: '$owner'
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    slug: 1,
                    created_at: 1,
                    updated_at: 1,
                }
            }
        ]).skip(skip).limit(pageSize).toArray();
        res.status(200).json({
            success: true, content: {
                meta: {
                    total,
                    page,
                    pages: Math.ceil(total / pageSize)
                }
            },
            data: communities
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Something went wrong" });
    }
});
exports.getOwnedCommunity = getOwnedCommunity;
const getJoinedCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const memberId=req.user.id;
    try {
        const db = (0, db_1.getDatabase)();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const usersCollection = db.collection('users');
        const signedInUser = yield usersCollection.findOne({ email: req.user.email });
        if (!signedInUser) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const userId = signedInUser.id;
        const memberCollection = db.collection('member');
        const communitiesCollection = db.collection('communities');
        const userMember = yield memberCollection.find({ user: userId }).toArray();
        if (!userMember) {
            return res.status(404).json({ success: false, error: 'Member not found' });
        }
        const pageSize = 10;
        const page = 1;
        const skip = (page - 1) * pageSize;
        const total = yield memberCollection.countDocuments();
        const communities = yield communitiesCollection.aggregate([
            {
                $match: { id: { $in: userMember.map((member) => member.community) } }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: 'id',
                    as: 'owner'
                }
            },
            {
                $unwind: '$owner'
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    slug: 1,
                    owner: {
                        id: '$owner.id',
                        name: '$owner.name',
                    },
                    created_at: 1,
                    updated_at: 1,
                }
            }
        ]).skip(skip).limit(pageSize).toArray();
        res.status(200).json({
            success: true, content: {
                meta: {
                    total,
                    page,
                    pages: Math.ceil(total / pageSize)
                },
                data: communities
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Something went wrong" });
    }
});
exports.getJoinedCommunity = getJoinedCommunity;
