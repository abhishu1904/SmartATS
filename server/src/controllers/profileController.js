const db = require("../config/db");

const createOrUpdateProfile = async (req, res) => {
    try {
        const user_id = req.user.id;

        const {
            phone,
            skills,
            education,
            experience
        } = req.body;

        const [existingProfile] = await db.promise().query(
            "SELECT id FROM candidate_profiles WHERE user_id = ?",
            [user_id]
        );

        console.log("USER ID:", user_id);
        console.log("EXISTING PROFILE:", existingProfile);

        // Profile already exists → UPDATE
        if (existingProfile.length > 0) {

            await db.promise().execute(
                `UPDATE candidate_profiles SET
                    phone = ?,
                    skills = ?,
                    education = ?,
                    experience = ?
                WHERE user_id = ?`,
                [
                    phone || null,
                    skills || null,
                    education || null,
                    experience || null,
                    user_id
                ]
            );

            return res.status(200).json({
                message: "Profile updated successfully"
            });
        }

        // Profile doesn't exist → INSERT
        const [result] = await db.promise().execute(
            `INSERT INTO candidate_profiles
            (user_id, phone, skills, education, experience)
            VALUES (?, ?, ?, ?, ?)`,
            [
                user_id,
                phone || null,
                skills || null,
                education || null,
                experience || null
            ]
        );

        console.log("PROFILE INSERT RESULT:", result);

        return res.status(201).json({
            message: "Profile created successfully"
        });

    } catch (error) {
        console.error("Error creating or updating profile:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const user_id = req.user.id;

        const [profiles] = await db.promise().execute(
            `SELECT
                id,
                user_id,
                phone,
                skills,
                education,
                experience,
                resume_url,
                created_at,
                updated_at
            FROM candidate_profiles
            WHERE user_id = ?`,
            [user_id]
        );

        if (profiles.length === 0) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        return res.status(200).json({
            profile: profiles[0]
        });
    } catch (error) {
        console.error("Error fetching profile:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const uploadResume = async (req, res) => {
    try {
        const user_id = req.user.id;

        // Check whether a resume file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a PDF resume"
            });
        }

        const resume_url = `/uploads/${req.file.filename}`;

        // Create a profile if one doesn't exist,
        // or update the resume for an existing profile.
        await db.promise().execute(
            `INSERT INTO candidate_profiles (user_id, resume_url)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE resume_url = VALUES(resume_url)`,
            [user_id, resume_url]
        );

        return res.status(200).json({
            message: "Resume uploaded successfully!",
            resume_url
        });

    } catch (error) {
        console.error("Error uploading resume:", error);

        return res.status(500).json({
            message: "Failed to upload resume"
        });
    }
};

module.exports = {
    createOrUpdateProfile,
    getMyProfile,
    uploadResume
};
