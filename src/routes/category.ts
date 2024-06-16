import { connectToDatabase } from "../config/database";
import { verifyToken } from "../middleware/auth";
import { Category } from "../models/product";
import express, { Request, Response } from "express";

const router = express.Router();



router.get('/categories', verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/create-category", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const categoryExists = await Category.findOne({ categoryName: req.body.categoryName });
        if (categoryExists) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const category = new Category({
            categoryName: req.body.categoryName,

        })

        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;