const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
    "https://smartats.pages.dev",      // production
    "http://localhost:5173",
    "http://127.0.0.1:5173"
];

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (curl, mobile apps) and matching ones
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // allow any Cloudflare Pages preview deployment too
        if (/^https:\/\/[a-z0-9]+\.smartats\.pages\.dev$/.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

const jobRoutes = require("./routes/jobRoutes");
const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const profileRoutes = require("./routes/profileRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const candidateDashboardRoutes = require("./routes/candidateDashboardRoutes");


app.use("/uploads", express.static("uploads"));
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/candidate/dashboard", candidateDashboardRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/recruiter", recruiterRoutes);

app.get("/", (req, res) => {
    res.send("Smart Requirement & ATS backend is running!");
});

app.listen(PORT, () => {
    console.log(`SmartATS server is running on port ${PORT}`);
});