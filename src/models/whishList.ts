import mongoose from "mongoose";
import { ProductType } from "./product";



const whishListSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
}, { timestamps: true })

const Wishlist = mongoose.model<ProductType & mongoose.Document>("WhishList", whishListSchema);

export { Wishlist }