import { connectToDatabase } from "../config/database";
import { verifyToken } from "../middleware/auth";
import { Category, Product } from "../models/product";
import express, { Request, Response } from "express";

const router = express.Router();



router.get('/categories', async (req: Request, res: Response) => {
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
router.get("/search/:categoryId", async (req: Request, res: Response) => {
    try {
        await connectToDatabase();

        // Retrieve categoryName from the database with categoryId
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Retrieve products with the category name
        const products = await Product.find({ category: category.categoryName });
        if (!products.length) {
            return res.status(404).json({ message: "No products found for this category" });
        }

        // Return the products in the response
        return res.status(200).json(products);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


export default router;