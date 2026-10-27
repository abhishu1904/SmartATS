const express = require("express");

const router = express.Router();

const { getJobs, getMyJobs, getJobById, createJob, updateJob, deleteJob } = require("../controllers/jobController");

const authenticateToken = require("../middleware/authMiddleware");

const authorizeRole = require("../middleware/authorizeRole");

router.get("/", getJobs);
router.get(
    "/my-jobs",
    authenticateToken,
    authorizeRole("recruiter"),
    getMyJobs
);
router.get("/:id", getJobById);
router.post(
    "/",
    authenticateToken,
    authorizeRole("recruiter", "admin"),
    createJob
);
router.put(
    "/:id",
    authenticateToken,
    authorizeRole("recruiter", "admin"),
    updateJob
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("recruiter", "admin"),
    deleteJob
);
module.exports = router;