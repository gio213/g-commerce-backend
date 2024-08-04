import { connectToDatabase } from "../config/database"
import { verifyToken } from "../middleware/auth"
import express, { Request, Response } from "express"
import { Category, Product } from "../models/product"
import { body } from "express-validator"
import { ProductType } from "../models/product"
import multer from "multer"
import cloudinary from "cloudinary"
import { ProductReview } from "../models/productReview"
import User from "../models/user"



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


router.get("/all", async (req: Request, res: Response) => {
    await connectToDatabase();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const skip = (page - 1) * limit;

    try {
        const products = await Product.find().skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments();

        if (!products.length) {
            return res.status(404).json({ message: "No products found" });
        }

        res.json({
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            totalProducts: totalProducts
        });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.error(error);
    }
});

router.get("/products-paginated", async (req: Request, res: Response) => {
    await connectToDatabase();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const skip = (page - 1) * limit;

    try {
        const products = await Product.find().skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments();

        if (!products.length) {
            return res.status(404).json({ message: "No products found" });
        }

        res.json({
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            totalProducts: totalProducts
        });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.error(error);
    }
});


router.get("/detail/:productId", async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const productDetail = await Product.findById(req.params.productId);
        const reviews = await ProductReview.find({ productId: req.params.productId });

        if (!productDetail) {
            return res.status(404).json({ message: "Product not found" });
        }
        const simmilarProducts = await Product.find({ category: productDetail.category, _id: { $ne: productDetail._id } }).limit(5);

        res.json({
            productDetail,
            simmilarProducts,
            reviews,

        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

router.get("/reviews-paginated/:productId", async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 4;
    const skip = (page - 1) * limit;
    try {
        await connectToDatabase();
        const totalReviewsCount = await ProductReview.countDocuments({ productId: req.params.productId });
        const reviews = await ProductReview.find({ productId: req.params.productId }).skip(skip).limit(limit);

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found" })
        }

        res.json({
            reviews,
            totalRewiews: totalReviewsCount,
            totalReviewsPages: Math.ceil(totalReviewsCount / limit),
            currentRewiesPage: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});




router.put("/update/:productId", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();

        const updateDProduct: ProductType = req.body;
        updateDProduct.lastUpdated = new Date();

        const product = await Product.findOneAndUpdate(
            { _id: req.params.productId, userId: req.userId },
            { $set: updateDProduct },
            { new: true }
        );


        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }


        res.status(200).json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

router.post("/create-review/:productId", verifyToken, async (req: Request, res: Response) => {
    try {
        await connectToDatabase();
        const userId = req.userId;
        const productId = req.params.productId;
        const comment = req.body.comment;
        const starRating = req.body.starRating;

        if (!userId || !productId || !starRating || !comment) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Fetch user details from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const savedReview = await ProductReview.create({
            userId,
            productId,
            starRating,
            comment,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        });

        // Populate the user field
        const populatedReview = await ProductReview.findById(savedReview._id).populate("_id", " email");

        res.status(201).json({ message: "Review created successfully", review: populatedReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});



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