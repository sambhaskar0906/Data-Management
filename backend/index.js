import dotenv from "dotenv";
import connectDB from "./src/db/index.js"
import { app } from "./app.js"
dotenv.config({
    path: './.env'
})


app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hello Santo Creation! Your API is live 🚀"
    });
});


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`server is running  on ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("Server failed", err);
    })