import express, { Request, Response } from "express"
import cors from "cors"
import "dotenv/config"
import userRoutes from "./routes/users"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth"
import categoryRoutes from "./routes/category"
import productRoutes from "./routes/product"
import { v2 as cloudinary } from 'cloudinary';
import cartRoutes from "./routes/cart"
import whishlistRoutes from "./routes/whishList"
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))


app.get("/health", (req: Request, res: Response) => {
    res.send({ message: "Health OK!" });
});
app.use("/api/users/", userRoutes)
app.use("/api/auth/", authRoutes)
app.use("/api/category/", categoryRoutes)
app.use("/api/product/", productRoutes)
app.use("/api/cart/", cartRoutes)
app.use("/api/wishlist/", whishlistRoutes)

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
