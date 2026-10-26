const express = require('express');
const router = express.Router();

const { getDashboardStats, getRecentApplications, getJobApplicationsStats } = require('../controllers/recruiterController');

const authenticateToken = require('../middleware/authMiddleware');

const authorizeRole = require('../middleware/authorizeRole');

router.get("/dashboard",
    authenticateToken,
    authorizeRole("recruiter"),
    getDashboardStats
);

// Get recent applications for the logged-in recruiter
router.get(
    "/recent-applications",
    authenticateToken,
    authorizeRole("recruiter"),
    getRecentApplications
);

// Get job-wise application statistics
router.get(
    "/job-statistics",
    authenticateToken,
    authorizeRole("recruiter"),
    getJobApplicationsStats
);

module.exports = router;