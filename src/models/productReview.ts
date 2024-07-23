import mongoose from "mongoose";
import { CreateProductReview } from "./product";

const productReviewSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    starRating: { type: Number, required: true },
    comment: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, required: true },
}, { timestamps: true });


const ProductReview = mongoose.model<CreateProductReview & mongoose.Document>("ProductReviews", productReviewSchema);


export { ProductReview }

