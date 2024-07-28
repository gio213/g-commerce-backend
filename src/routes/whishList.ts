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
        const wishlists = await Wishlist.find({ userId }).populate("productId");
        if (!wishlists || wishlists.length === 0) {
            return res.status(404).json({ message: "Wishlist is empty" });
        }
        const formattedWishListItems = wishlists.map((wishList) => {
            return {
                cartItemId: wishList._id,

                category: wishList.productId?.category,
                countInStock: wishList.productId?.countInStock,
                createdAt: wishList.productId?.createdAt,
                description: wishList.productId?.description,
                imagesUrls: wishList.productId?.imagesUrls,
                lastUpdated: wishList.productId?.lastUpdated,
                name: wishList.productId?.name,
                price: wishList.productId?.price,
                updatedAt: wishList.productId?.updatedAt,
                userId: wishList.productId?.userId,
                docId: wishList?._id,
                _id: wishList.productId?._id

            };
        });

        res.json(formattedWishListItems)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
})

router.delete("/remove/:wishlistItemId", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const userId = req.userId as string;
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


router.delete("/clear-wishlist", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const userId = req.userId as string;
        await Wishlist.deleteMany({ userId });
        res.json({ message: "Wishlist cleared" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
})


export default router