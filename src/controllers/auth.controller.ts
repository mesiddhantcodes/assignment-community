import { Request, Response } from 'express';
import User, { validateUser } from '../interfaces/User';
import { getDatabase } from '../utils/db';
import { generateId } from '../utils/snowflake';
import { generateJWT } from '../utils/jwt';
import { hashPassword } from '../utils/bcrypt';
export const signup = async (req: Request, res: Response) => {
    try {
        const user: User = req.body;
        const isUserValid = validateUser(user);
        if (isUserValid.length > 0) {
            return res.status(400).json({ success: false, error: isUserValid });
        }
        user.id = generateId();
        const db = getDatabase();
        if (!db) {
            return res.status(500).json({ success: false, error: 'Database connection error' });
        }
        const usersCollection = db.collection('users');
        const checkIfUserExists = await usersCollection.findOne({ email: user.email });
        if (checkIfUserExists) {
            return res.status(409).json({ success: false, error: 'User already exists' });
        }
        user.password = await hashPassword(user.password);
        user.created_at = new Date();
        const result = await usersCollection.insertOne(user);
        const access_token = generateJWT(user);
        if (result.insertedId) {
            res.status(201).json({
                status: true,
                content: {
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        created_at: user.created_at
                    },
                    meta: {
                        access_token,
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

// Signin controller
export const signin = async (req: Request, res: Response) => {
    const user: User = req.body;
    const db = getDatabase();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database connection error' });
    }
    const usersCollection = db.collection('users');
    const checkIfUserExists = await usersCollection.findOne({ email: user.email });
    if (!checkIfUserExists) {
        return res.status(400).json({ success: false, error: 'User dose not exists' });
    } else {
        const access_token = generateJWT(user);
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: checkIfUserExists.id,
                    name: checkIfUserExists.name,
                    email: checkIfUserExists.email,
                    created_at: checkIfUserExists.created_at,
                   
                },
                meta: {
                    access_token,
                }
            }
        });
    }

};



export const me = async (req: Request, res: Response) => {
    const email = req.user.email;
    const db = getDatabase();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database connection error' });
    }
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });
    if (!user) {
        return res.status(400).json({ success: false, error: 'User dose not exists' });
    } else {
        res.status(200).json(
            {
                "status": true,
                "content": {
                    "data": {
                        "id": user.id,
                        "name": user.name,
                        "email": user.email,
                        "created_at": user.created_at,
                    }
                }
            }
        );
    }
};
