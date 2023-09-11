import { Request, Response } from 'express';
import { getDatabase } from '../utils/db';
import Community, { validateCommunity } from '../interfaces/Community';
import { generateUniqueSlug } from '../utils/slug';
import { generateId } from '../utils/snowflake';
import { compareSync } from 'bcrypt';
export const community = async (req: Request, res: Response) => {
    try {
        const community: Community = req.body;
        const errors = validateCommunity(community);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, error: errors });
        }
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const communitiesCollection = db.collection('communities');
        const usersCollection = db.collection('users');
        const checkIfCommunityExists = await communitiesCollection.findOne({ name: community.name });
        if (checkIfCommunityExists) {
            return res.status(409).json({ success: false, error: 'Community already exists' });
        }
        community.slug = await generateUniqueSlug(db, community.name);
        community.created_at = new Date();
        community.updated_at = new Date();
        const owner = await usersCollection.findOne({ email: req.user.email });
        if (!owner) {
            return res.status(409).json({ success: false, error: 'Owner does not exists' });
        }
        community.id = generateId();
        community.owner = owner.id;
        const result = await communitiesCollection.insertOne(community);
        if (result.insertedId) {
            res.status(201).json(
                {
                    status: true,
                    content:
                    {
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
        } else {
            res.status(500).json({ success: false, error: "Something Went Wrong" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: "Something Went Wrong" });
    }
};

export const getAllcommunity = async (req: Request, res: Response) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const communitiesCollection = db.collection('communities');
        const pageSize = 10;
        const page = 1;
        const skip = (page - 1) * pageSize;
        const total = await communitiesCollection.countDocuments();
        const communities = await communitiesCollection.aggregate([
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
}

export const getAllCommunityMembers = async (req: Request, res: Response) => {
    try {
        const { communityId } = req.params;
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const communitiesCollection = db.collection('communities');
        const membersCollection = db.collection('member');
        const memberCommunity = await membersCollection.find({ community: communityId });
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
        const total = await communitiesCollection.countDocuments();
        const members = await membersCollection.aggregate([
            {
                $lookup: {
                    from: 'users', // Adjust to your actual collection name
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
}
export const getOwnedCommunity = async (req: Request, res: Response) => {
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const communitiesCollection = db.collection('communities');
        const usersCollection = db.collection('users');
        const checkIfOwnerExists = await usersCollection.findOne({ email: req.user.email });

        if (!checkIfOwnerExists) {
            return res.status(409).json({ success: false, error: 'Owner does not exists' })
        }
        const pageSize = 10;
        const page = 1;
        const skip = (page - 1) * pageSize;
        const total = await communitiesCollection.countDocuments();
        const communities = await communitiesCollection.aggregate([
            {
                $match: { owner: checkIfOwnerExists.id }
            },
            {
                $lookup: {
                    from: 'users', // Adjust to your actual collection name
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
}

export const getJoinedCommunity = async (req: Request, res: Response) => {
    // const memberId=req.user.id;
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const usersCollection = db.collection('users');
        const signedInUser = await usersCollection.findOne({ email: req.user.email });
        if (!signedInUser) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const userId = signedInUser.id;
        const memberCollection = db.collection('member');
        const communitiesCollection = db.collection('communities');
        const userMember = await memberCollection.find({ user: userId }).toArray();
        if (!userMember) {
            return res.status(404).json({ success: false, error: 'Member not found' });
        }
        const pageSize = 10;
        const page = 1;
        const skip = (page - 1) * pageSize;
        const total = await memberCollection.countDocuments();
        const communities = await communitiesCollection.aggregate([
            {
                $match: { id: { $in: userMember.map((member: any) => member.community) } }
            },
            {
                $lookup: {

                    from: 'users', // Adjust to your actual collection name
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


}