import mongoose from "mongoose";


export type categoryType = {
    _id: string;
    name: string;
    categoryName: string;

}




export type CreateProductReview = {
    userId: string;
    productId: string;
    starRating: number;
    comment: string;



}


export type CartItems = {
    _id: string;
    userId: string;
    name: string;
    description: string;
    price: number;
    countInStock: number;
    imagesUrls: string[];
    category: categoryType;
    lastUpdated: Date;
    productId?: string;
    createdAt?: string;
    updatedAt?: string;
    docId?: string;




}

export type ProductType = {
    _id: string;
    userId: string;
    name: string;
    description: string;
    price: number;
    countInStock: number;
    imagesUrls: string[];
    category: categoryType;
    lastUpdated: Date;
    productId?: CartItems;
    createdAt?: string;
    updatedAt?: string;




}


const productSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    imagesUrls: [{ type: String, required: true }],
    category: { type: String, required: true },
    lastUpdated: { type: Date, required: true }
}, { timestamps: true })

const Product = mongoose.model<ProductType & mongoose.Document>("Product", productSchema);


const categorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true }
}, { timestamps: true })

const Category = mongoose.model<categoryType>("Category", categorySchema)

export { Product, Category }