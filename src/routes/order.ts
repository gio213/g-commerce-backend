import express, { Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import Stripe from "stripe";
import { Order, OrderType } from '../models/order';
import { connectToDatabase } from '../config/database';
import { ProductType } from '../models/product';
import { Cart } from '../models/cart';
import { ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_API_KEY as string)


const router = express.Router();


router.post("/checkout/payment-intent", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const userId = req.userId as string;

        // Fetch cart items for the user and populate product details
        const cartItems = await Cart.find({ userId }).populate("productId");

        // Calculate total price
        const totalPrice = cartItems.reduce((total, item) => {
            const product = item.productId as ProductType;
            return total + product.price;
        }, 0);

        const productIds = cartItems.map(item => item.productId!._id);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalPrice * 100,
            currency: "eur",
            metadata: {
                productsId: JSON.stringify(productIds)
            }
        });

        if (!paymentIntent.client_secret) {
            return res.status(500).json({ message: "Error creating payment intent" });
        }

        const response = {
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret.toString(),
            totalCost: totalPrice
        };
        res.send(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/checkout", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const userId = req.userId as string;

        const paymentIntentId = req.body.paymentIntentId;

        if (!paymentIntentId) {
            return res.status(400).json({ message: "Payment intent ID is required" });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId as string);

        if (!paymentIntent) {
            return res.status(400).json({ message: "Payment intent not found" });
        }

        const cartItems = await Cart.find({ userId }).populate("productId");

        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({ message: `Payment not succeeded. Status: ${paymentIntent.status}` });
        }

        // Create order
        const newOrder: OrderType = {
            products: cartItems.map(item => item.productId as ProductType),
            userId: userId,
            totalPrice: paymentIntent.amount / 100,
            isPaid: true,
            paidAt: new Date(),
            isDelivered: false,
            deliveredAt: new Date(),
            createdAt: new Date(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode,
            country: req.body.country,
            email: req.body.email
        };

        await Order.create(newOrder);

        res.json({ message: "Order created successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/orders", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const userId = req.userId as string;

        const orders = await Order.aggregate([
            { $match: { userId: new ObjectId(userId) } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "products",
                    localField: "products",
                    foreignField: "_id",
                    as: "products"
                }
            }
        ]);

        if (!orders || orders.length === 0) {
            return res.status(400).json({ message: "No orders found" });
        }
        res.json(orders);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;