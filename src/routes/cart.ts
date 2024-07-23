import { connectToDatabase } from "../config/database"
import { verifyToken } from "../middleware/auth"
import express, { Request, Response } from "express"
import { Cart } from "../models/cart"
import { Product, ProductType } from "../models/product"

const router = express.Router()

router.post("/add", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const { productId, userId } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const wishlist = new Cart({
            userId,
            productId
        });
        await wishlist.save();
        res.status(201).json({ message: "Product added to cart" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

router.get("/cart-items", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const userId = req.userId as string;
        const cartItems = await Cart.find({ userId }).populate("productId");
        if (!cartItems.length) {
            return res.status(404).json({ message: "No items in cart" });
        }

        const transformedCartItems = cartItems.map(item => {
            const { productId, ...rest } = item.toObject();
            return { ...rest, cartItem: productId };
        });

        res.json(transformedCartItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

router.delete("/remove/:cartItemId", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const userId = req.userId as string;
        const { cartItemId } = req.params;
        const cartItem = await Cart.findOneAndDelete({ _id: cartItemId, userId: userId });
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        res.json({ message: "Cart item removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
})


router.delete("/clear-cart", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const userId = req.userId as string;
        await Cart.deleteMany({ userId });
        res.json({ message: "Cart cleared" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }

})

export default router