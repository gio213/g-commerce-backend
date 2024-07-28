import mongoose from "mongoose";
import { ProductType } from "./product";

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
}, { timestamps: true });

const Cart = mongoose.model<ProductType & mongoose.Document>("Cart", cartSchema);

export { Cart };