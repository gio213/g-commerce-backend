import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { connectToDatabase } from "../config/database"
import User from "../models/user"


declare global {
    namespace Express {
        interface Request {
            userId: string

        }
    }
}
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies["auth_token"]

    if (!token) {
        return res.status(401).json({ message: "No token provided" })
    }

    try {
        await connectToDatabase()
        const user = await User.findOne({ _id: (jwt.verify(token, process.env.JWT_SECRET_KEY as string) as JwtPayload).userId })
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string)
        req.userId = (decoded as JwtPayload).userId
        next()
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Unauthorized" })

    }
}