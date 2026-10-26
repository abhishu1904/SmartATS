const express = require('express');

const router = express.Router();

const {
    getCandidateDashboard
} = require("../controllers/candidateDashboardController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/authorizeRole");

router.get(
    "/",
    authenticateToken,
    authorizeRole("candidate"),
    getCandidateDashboard
);

module.exports = router;