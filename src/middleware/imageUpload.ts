import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 5 * 1024 * 1024 // 5mb
    },
})

export const uploadImagesMiddleware = upload.array('images', 6)

export const handleImageUpload = (req: Request, res: Response, next: NextFunction) => {
    uploadImagesMiddleware(req, res, (err) => {
        if (err) {
            res.status(400).send({ message: "Error uploading images" })
        }
        next()
    })

}