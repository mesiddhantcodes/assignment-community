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
exports.getAllcommunity = exports.community = void 0;
const db_1 = require("../utils/db");
const slug_1 = require("../utils/slug");
// import { getUserIdByName } from '../utils/authenticateJwt';
const community = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const community = req.body;
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
        /* const communities = await communitiesCollection.find().skip(skip).limit(pageSize).toArray(); */
        //aggregate the data to fetch the owner name
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
