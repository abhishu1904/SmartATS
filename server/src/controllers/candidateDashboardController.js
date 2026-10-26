const db = require("../config/db");

const getCandidateDashboard = async (req, res) => {
    try {
        const candidate_id = req.user.id;

        const [stats] = await db.promise().execute(
            `SELECT
                COUNT(*) AS total_applications,
                COALESCE(SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END), 0) AS pending_applications,
                COALESCE(SUM(CASE WHEN status= 'shortlisted' THEN 1 ELSE 0 END), 0) AS shortlisted_applications,
                COALESCE(SUM(CASE WHEN status = 'interviewed' THEN 1 ELSE 0 END), 0) AS interview_applications,
                COALESCE(SUM(CASE WHEN status = 'selected' THEN 1 ELSE 0 END), 0) AS selected_applications,
                COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected_applications
            FROM applications WHERE candidate_id = ?`,
            [candidate_id]
        );

        const [recentApplications] = await db.promise().execute(
            `SELECT
            applications.id AS application_id,
            jobs.id AS job_id,
                jobs.title AS job_title,
                jobs.company AS company_name,
                jobs.location,
                applications.status,
                applications.applied_at

            FROM applications

            INNER JOIN jobs
                ON applications.job_id = jobs.id

            WHERE applications.candidate_id = ?

            ORDER BY applications.applied_at DESC
            LIMIT 5`,
            [candidate_id]
        );

        return res.status(200).json({
            message: "Candidate dashboard fetched successfully",
            dashboard: stats[0],
            recent_applications: recentApplications
        });
    } catch (error) {
        console.error("Candidate dashboard error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    getCandidateDashboard
};