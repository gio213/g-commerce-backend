import express, { Response, Request } from 'express';
import User from '../models/user';
import { check, validationResult } from 'express-validator';
import { connectToDatabase } from '../config/database';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/auth';
const router = express.Router();

const isPorduction = process.env.NODE_ENV === 'production';


// api/users/register

router.post("/register", [
    check("email", "Email is required").isEmail(),
    check("password", "Password 6 or more characters are requred").isLength({ min: 6 }),
    check("confirmPassword", "Password 6 or more characters are requred").isLength({ min: 6 }),
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),

], async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {

        await connectToDatabase();

        let user = await User.findOne({ email: req.body.email });


        if (user) {
            return res.status(400).json({ errors: [{ message: "User already exists" }] });
        }

        user = new User(req.body);

        await user.save();

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY as string, {
            expiresIn: "1d"
        })
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        })
        return res.status(200).send({ message: "User registered ok" })
    } catch (error) {
        console.error(error);
    }
})


router.get("/me", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const currentUser = await User.findOne({ _id: req.userId }).select("-password");
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.send(currentUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting user" });
    }
});

router.put("/update/:userId", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const currentUser = await User.findOne({ _id: req.userId });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        currentUser.firstName = req.body.firstName;
        currentUser.lastName = req.body.lastName;
        currentUser.email = req.body.email;
        currentUser.password = req.body.newPassword;
        await currentUser.save();
        res.status(200).json({ message: "User updated}" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user" });
    }
})

export default router;