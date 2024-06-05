import express, { Response, Request } from "express"
import { verifyToken } from "../middleware/auth"
import { check, validationResult } from "express-validator"
import { connectToDatabase } from "../config/database"
import User from "../models/user"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


const router = express.Router()
const isProduction = process.env.NODE_ENV === "production"


router.post("/login", [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isLength({ min: 6 })
], async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
        await connectToDatabase()

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY as string, { expiresIn: "1d" })


        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: isProduction ? "none" : "lax"
        })
        res.status(200).send({ message: "Login successful" })

    } catch (error) {
        console.error(error);
    }
})


router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
    res.status(200).send({ userId: req.userId })
})


export default router