const express = require("express");

const router = express.Router();

const {
    applyForJob,
    getApplicationsForJob,
    updateApplicationStatus,
    getMyApplications,
    getApplicationDetails
} = require("../controllers/applicationController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/authorizeRole");

const upload = require("../config/upload");

router.post(
    "/",
    authenticateToken,
    authorizeRole("candidate"),
    upload.single("resume"),
    applyForJob
);

router.get(
    "/job/:jobId",
    authenticateToken,
    authorizeRole("recruiter", "admin"),
    getApplicationsForJob
);

router.put(
    "/:id/status",
    authenticateToken,
    authorizeRole("recruiter", "admin"),
    updateApplicationStatus
);

router.get(
    "/my",
    authenticateToken,
    authorizeRole("candidate"),
    getMyApplications
);

router.get(
    "/:id",
    authenticateToken,
    authorizeRole("recruiter", "admin"),
    getApplicationDetails
);

module.exports = router;