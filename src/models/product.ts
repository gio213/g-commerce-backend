import mongoose from "mongoose";


export type categoryType = {
    _id: string;
    name: string;

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