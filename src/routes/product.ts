import { connectToDatabase } from "../config/database"
import { verifyToken } from "../middleware/auth"
import express, { Request, Response } from "express"
import { Product } from "../models/product"
import { body } from "express-validator"
import { ProductType } from "../models/product"
import multer from "multer"
import cloudinary from "cloudinary"



const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 5 * 1024 * 1024 // 5mb
    },
})



router.post("/create", verifyToken, [
    body("name").isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
    body("description").isLength({ min: 3 }).withMessage("Description must be at least 3 characters long"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("countInStock").isNumeric().withMessage("Count in stock must be a number"),
    body("imageUrl").isURL().withMessage("Image URL is invalid"),
    body("category").isMongoId().withMessage("Category is invalid")
], upload.array("imageFiles", 6), async (req: Request, res: Response) => {
    try {

        await connectToDatabase()
        const existProduct = await Product.findOne({
            name
                : req.body.name
        })
        if (existProduct) {
            return res.status(400).json({ message: "Product with this name  already exists" })
        }
        const imageFiles = req.files as Express.Multer.File[]
        const newProduct: ProductType = req.body
        if (!imageFiles || imageFiles.length === 0) {
            return res.status(400).json({ message: "Please upload at least one image" })
        }
        const imageUrls = await uploadImages(imageFiles)
        newProduct.imagesUrls = imageUrls
        newProduct.lastUpdated = new Date()
        newProduct.userId = req.body.userId

        const product = new Product(newProduct)

        await product.save()
        return res.status(201).json({ message: "Product created successfully" })

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})


router.get("/all", verifyToken, async (req: Request, res: Response) => {
    await connectToDatabase()
    const products = await Product.find()
    if (!products) {
        return res.status(404).json({ message: "No products found" })
    }
    res.json(products)
})


async function uploadImages(imageFiles: Express.Multer.File[]) {

    const uploadPromises = imageFiles.map(async (image) => {
        const b64 = Buffer.from(image.buffer).toString("base64")
        let dataURI = "data:" + image.mimetype + ";base64," + b64
        const res = await cloudinary.v2.uploader.upload(dataURI, { folder: "G-commerce" })

        return res.url
    })

    const imageUrls = await Promise.all(uploadPromises)
    return imageUrls
}

export default router