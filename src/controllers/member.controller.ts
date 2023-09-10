import { Request, Response } from 'express';
import { getDatabase } from '../utils/db';
import { generateId } from '../utils/snowflake';
import Member from '../interfaces/Member';



export const addMember = async (req: Request, res: Response) => {
    // const { communityId, userId, roleId } = req.body;
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
    const { userId } = req.params;
    const db = getDatabase();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database connection error' });
    }
    const memberCollection = db.collection('member');
    const usersCollection = db.collection('users');
    const communitiesCollection = db.collection('communities');
    const checkIfMemberExists = await memberCollection.findOne({ id: userId });
    console.log(checkIfMemberExists);
    if (!checkIfMemberExists) {
        return res.status(409).json({ success: false, error: 'Member doesnt exists' });
    }
    const community = await communitiesCollection.findOne({ id: checkIfMemberExists.community });
    if (!community) {
        return res.status(404).json({ success: false, error: 'Community not found' });
    }
    if (checkIfMemberExists.id !== community.owner) {
        return res.status(401).json({ success: false, error: 'NOT_ALLOWED_ACCESS' });
    }
    const result = await memberCollection.deleteOne({ id: userId });
    if (!result.deletedCount) {
        return res.status(500).json({ success: false, error: "Something went wrong" });
    }
    res.status(200).json({ success: true, content: { data: result.deletedCount } });
}