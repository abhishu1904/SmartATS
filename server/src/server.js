const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

const port = 5000;

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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});