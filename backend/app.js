import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";


// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ✅ Allowed Origins List
const allowedOrigins = [
    "https://santocreation.co",
    "https://www.santocreation.co",
    "http://localhost:5173",
    "https://new-data-management.vercel.app",
    "https://cacooperative.org",
    "https://www.cacooperative.org"
];

// ✅ CORS Setup
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true); // Allow server-to-server or Postman
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log("❌ CORS blocked for origin:", origin);
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// ✅ Body Parser
app.use(
    express.json({
        limit: "10mb",
    })
);
app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

// ✅ Static Files (for uploaded files)
app.use("/upload", express.static(path.join(__dirname, "upload")));

// ✅ Cookie Parser
app.use(cookieParser());

// ✅ Import Routers
import memberRouter from "./src/router/member.router.js";
import bulkMailRouter from "./src/router/bulkMail.router.js";
import noticeRouter from "./src/router/notice.router.js";
import authRoutes from "./src/router/auth.router.js";
import loanRouter from "./src/router/loan.router.js";
import whatsappNoticeRoute from "./src/router/whatsappNotice.route.js";

// ✅ API Routes
app.use("/api/v1/members", memberRouter);
app.use("/api/v1/bulk", bulkMailRouter);
app.use("/api/v1/notice", noticeRouter);
app.use("/api/v1", authRoutes);
app.use("/api/v1/loans", loanRouter);
app.use("/api/v1/notice", whatsappNoticeRoute);


// ✅ Default Route
app.get("/", (req, res) => {
    res.send("Hello Ca-cooperative Society! Your API is live 🚀");
});

// ✅ Export app
export { app };
