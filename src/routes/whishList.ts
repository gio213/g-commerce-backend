import { connectToDatabase } from "../config/database"
import { verifyToken } from "../middleware/auth"
import express, { Request, Response } from "express"
import { Product } from "../models/product"
import { Wishlist } from "../models/whishList"


const router = express.Router()


router.post("/add", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const { productId, userId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const wishlist = new Wishlist({
            userId,
            productId
        });
        await wishlist.save();
        res.status(201).json({ message: "Product added to wishlist" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

router.get("/wishlist-items", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const userId = req.userId as string;
        const wishlist = await Wishlist.find({ userId }).populate("productId");
        if (!wishlist || wishlist.length === 0) {
            return res.status(404).json({ message: "Wishlist is empty" });
        }

        res.json(wishlist)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
})

router.delete("/remove/:wishlistItemId", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const userId = req.userId as string;
        console.log(req.params)
        const { wishlistItemId } = req.params;

        const cartItem = await Wishlist.findOneAndDelete({ _id: wishlistItemId, userId: userId });
        if (!cartItem) {
            return res.status(404).json({ message: "wishlist item not found" });
        }
        res.json({ message: " item removed wishlist" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
})


export default router