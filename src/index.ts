import express, { Request, Response } from "express"
import conrs from "cors"
import "dotenv/config"
import userRoutes from "./routes/users"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth"



const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(conrs({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.get("/health", (req: Request, res: Response) => {
    res.send({ message: "Health OK!" });
});
app.use("/api/users/", userRoutes)
app.use("/api/auth/", authRoutes)

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
