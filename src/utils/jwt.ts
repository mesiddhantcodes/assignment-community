import { JWT_SECRET } from "../config";
import User from "../interfaces/User";
import jwt from 'jsonwebtoken';

export const generateJWT = (user: User): string => {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
        },
        JWT_SECRET,
        {
            expiresIn: '1h',
        }
    );
}

export const verifyJWT = (token: string): User | null => {
    try {
        const user = jwt.verify(token, JWT_SECRET);
        return user as User;
    } catch (error) {
        return null;
    }
}

export const verifyJWTMiddleware = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const user = verifyJWT(token);

    if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    req.user = user;
    next();
}