import { Request, Response } from "express";
import Role from "../interfaces/Role";
import { generateId } from "../utils/snowflake";
import { getDatabase } from "../utils/db";

export const createRole = async (req: Request, res: Response) => {
    try {
        const role: Role = req.body;
        role.id = generateId();
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const rolesCollection = db.collection('roles');
        let checkIfRoleExists = await rolesCollection.findOne({ name: role.name });
        if (checkIfRoleExists) {
            return res.status(409).json({ success: false, error: 'Role already exists' });
        }
        role.created_at = new Date();
        role.updated_at = new Date();
        const result = await rolesCollection.insertOne(role);
        if (!result.insertedId) {
            return res.status(500).json({ success: false, error: "Something went wrong" });
        }
        res.status(201).json({
            "status": true,
            "content": {
                "data": {
                    "id": role.id,
                    "name": role.id,
                    "created_at": role.created_at,
                    "updated_at": role.updated_at
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Something went wrong" });
    }
}


export const getAllRoles = async (req: Request, res: Response) => {
    try {
        const role: Role = req.body;
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const pageSize = 10;
        const page = 1;
        // const skip = (page - 1) * pageSize;
        const rolesCollection = db.collection('roles');
        const result = await rolesCollection.find().toArray();
        if (!result) {
            return res.status(500).json({ success: false, error: "Something went wrong" });
        }
        const total = await rolesCollection.countDocuments();
        res.status(200).json({
            success: true, content: {
                meta: {
                    total,
                    pages: Math.ceil(total / pageSize),
                    page,
                },
                data: result.map((role) => {
                    return {
                        id: role.id,
                        name: role.name,
                        created_at: role.created_at,
                        updated_at: role.updated_at
                    }
                })
            }

        });
    } catch (error) {
        res.status(500).json({ success: false, error: "Something went wrong" });
    }
}