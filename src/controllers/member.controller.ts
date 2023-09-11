import { Request, Response } from 'express';
import { getDatabase } from '../utils/db';
import { generateId } from '../utils/snowflake';
import Member from '../interfaces/Member';

export const addMember = async (req: Request, res: Response) => {
    const member: Member = req.body;
    const db = getDatabase();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database connection error' });
    }
    const memberCollection = db.collection('member');
    const communitiesCollection = db.collection('communities');
    const usersCollection = db.collection('users');
    const checkIfMemberExists = await usersCollection.findOne({ email: req.user.email });
    if (!checkIfMemberExists) {
        return res.status(409).json({ success: false, error: 'Member already exists' });
    }
    const community = await communitiesCollection.findOne({ id: member.community });
    if (!community) {
        return res.status(404).json({ success: false, error: 'Community not found' });
    }
    console.log(checkIfMemberExists.id, community.owner)
    if (checkIfMemberExists.id !== community.owner) {
        return res.status(401).json({ success: false, error: 'NOT_ALLOWED_ACCESS' });
    }
    member.id = generateId();
    const result = await memberCollection.insertOne({
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
}

export const removeMember = async (req: Request, res: Response) => {
    const userId = req.params;
    try {
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const memberCollection = db.collection('member');
        console.log(userId.id);
        const memberDetails = await memberCollection.findOne({ id: userId.id });
        // console.log(memberDetails);
        if (!memberDetails) {
            return res.status(404).json({ success: false, error: 'Member not found' });
        }
        const result = await memberCollection.aggregate([
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
        console.log(result)
        if (result.length === 0) {
            return res.status(404).json({ success: false, error: 'Member not found' });
        }
        const memberData = result[0];
        // console.log(memberData)
        const { ownerId, userId: memberId, role: role } = memberData;
        console.log(ownerId, memberId)
        const requestorUserId = req.user.id;

        if (requestorUserId !== ownerId.id) {
            return res.status(401).json({ success: false, error: 'NOT_ALLOWED_ACCESS' });
        }
        const deleteResult = await memberCollection.deleteOne({ id: userId.id });

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ success: false, error: 'Member not found' });
        }
        res.status(200).json({ success: true });

    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Something went wrong' });
    }
}