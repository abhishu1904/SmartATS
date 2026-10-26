const upload = require("../config/upload");

const express = require("express");

const router = express.Router();

const {
    createOrUpdateProfile,
    getMyProfile,
    uploadResume
} = require("../controllers/profileController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/authorizeRole");

router.post(
    "/",
    authenticateToken,
    authorizeRole("candidate"),
    createOrUpdateProfile
);

router.get(
    "/",
    authenticateToken,
    authorizeRole("candidate"),
    getMyProfile
);

router.post(
    "/resume",
    authenticateToken,
    authorizeRole("candidate"),
    upload.single("resume"),
    uploadResume
);

module.exports = router;