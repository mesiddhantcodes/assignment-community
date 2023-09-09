import { Request, Response } from 'express';
import { getDatabase } from '../utils/db';
import Community from '../interfaces/Community';
import { generateUniqueSlug } from '../utils/slug';
// import { getUserIdByName } from '../utils/authenticateJwt';
export const community = async (req: Request, res: Response) => {
    try {
        const community: Community = req.body;
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
        /* const communities = await communitiesCollection.find().skip(skip).limit(pageSize).toArray(); */
        //aggregate the data to fetch the owner name
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