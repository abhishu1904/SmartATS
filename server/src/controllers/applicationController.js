const db = require("../config/db");

const applyForJob = async (req, res) => {
    try {
        const { job_id, cover_letter } = req.body;

        const resume_url = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        const candidate_id = req.user.id;

        if (!job_id) {
            return res.status(400).json({
                message: "Job ID is required"
            });
        }

        const [job] = await db.promise().execute(
            "SELECT id FROM jobs WHERE id = ?",
            [job_id]
        );

        if (job.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        const [existingApplication] = await db.promise().execute(
            "SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?",
            [job_id, candidate_id]
        );

        if (existingApplication.length > 0) {
            return res.status(409).json({
                message: "You have already applied for this job"
            });
        }

        const [result] = await db.promise().execute(
            "INSERT INTO applications (job_id, candidate_id, resume_url, cover_letter) VALUES (?, ?, ?, ?)",
            [job_id, candidate_id, resume_url || null, cover_letter || null]
        );
        return res.status(201).json({
            message: "Application submitted successfully"
        });
    } catch (error) {
        console.error("Error applying for job:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const getApplicationsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const recruiter_id = req.user.id;

        // Verify that this job belongs to the logged-in recruiter
        const [jobs] = await db.promise().execute(
            "SELECT id FROM jobs WHERE id = ? AND recruiter_id = ?",
            [jobId, recruiter_id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                message: "Job not found or you do not own this job"
            });
        }

        // Fetch applications for this recruiter's job
        const [applications] = await db.promise().execute(
            `SELECT
                applications.id,
                applications.job_id,
                applications.candidate_id,
                applications.resume_url,
                applications.cover_letter,
                applications.status,
                applications.applied_at,
                users.name AS candidate_name,
                users.email AS candidate_email
            FROM applications
            JOIN users ON applications.candidate_id = users.id
            WHERE applications.job_id = ?`,
            [jobId]
        );

        return res.status(200).json({
            applications
        });

    } catch (error) {
        console.error(
            "Error fetching applications for job:",
            error.message
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = [
            "applied",
            "shortlisted",
            "interviewed",
            "selected",
            "rejected"
        ];

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid application status"
            });
        }

        const recruiter_id = req.user.id;

        // Check whether this application belongs to a job owned by this recruiter
        const [applications] = await db.promise().execute(
            `SELECT applications.id
            FROM applications
            JOIN jobs ON applications.job_id = jobs.id
            WHERE applications.id = ?
            AND jobs.recruiter_id = ?`,
            [id, recruiter_id]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                message: "Application not found or you do not own this job"
            });
        }

        // Update application status
        const [result] = await db.promise().execute(
            "UPDATE applications SET status = ? WHERE id = ?",
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        return res.status(200).json({
            message: "Application status updated successfully"
        });
    } catch (error) {
        console.error("Error updating application status:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

const getMyApplications = async (req, res) => {
    try {
        const candidate_id = req.user.id;

        const [applications] = await db.promise().execute(
            `SELECT
                applications.id,
                applications.job_id,
                jobs.title AS job_title,
                jobs.company,
                jobs.location,
                applications.resume_url,
                applications.cover_letter,
                applications.status,
                applications.applied_at
            FROM applications
            JOIN jobs ON applications.job_id = jobs.id
            WHERE applications.candidate_id = ?
            ORDER BY applications.applied_at DESC`,
            [candidate_id]
        );
        return res.status(200).json({
            applications
        });
    } catch (error) {
        console.error("Error fetching my applications:", error.message);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

const getApplicationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const recruiter_id = req.user.id;

        const [applications] = await db.promise().execute(
            `SELECT
                applications.id,
                applications.job_id,
                applications.candidate_id,
                applications.resume_url,
                applications.cover_letter,
                applications.status,
                applications.applied_at,
                users.name AS candidate_name,
                users.email AS candidate_email,
                jobs.title AS job_title,
                jobs.company,
                jobs.location,
                jobs.description,
                jobs.job_type,
                jobs.salary_min,
                jobs.salary_max,
                jobs.skills,
                jobs.experience_required
            FROM applications
            JOIN users
                ON applications.candidate_id = users.id
            JOIN jobs
                ON applications.job_id = jobs.id
            WHERE applications.id = ?
                AND jobs.recruiter_id = ?`,
            [id, recruiter_id]
        );

        if (applications.length === 0) {
            return res.status(404).json({
                message: "Application not found or you do not own this job"
            });
        }

        return res.status(200).json({
            application: applications[0]
        });

    } catch (error) {
        console.error("Error fetching application details:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    applyForJob,
    getApplicationsForJob,
    updateApplicationStatus,
    getMyApplications,
    getApplicationDetails
};