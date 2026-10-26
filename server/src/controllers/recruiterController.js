const db = require("../config/db");

const getDashboardStats = async (req, res) => {
    try {
        const recruiter_id = req.user.id;

        const [stats] = await db.promise().execute(
            `SELECT COUNT(DISTINCT jobs.id) AS total_jobs,
                COUNT(DISTINCT CASE WHEN jobs.status = 'active' THEN jobs.id END) AS active_jobs,
                COUNT(applications.id) AS total_applications,
                COALESCE(SUM(CASE WHEN applications.status = 'applied' THEN 1 ELSE 0 END),0) AS pending_applications,
                COALESCE(SUM(CASE WHEN applications.status = 'shortlisted' THEN 1 ELSE 0 END), 0) AS shortlisted_candidates,
                COALESCE(SUM(CASE WHEN applications.status = 'selected' THEN 1 ELSE 0 END), 0) AS selected_candidates,
                COALESCE(SUM(CASE WHEN applications.status = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected_candidates
                FROM jobs
                LEFT JOIN applications ON jobs.id = applications.job_id
                WHERE jobs.recruiter_id = ?`,
            [recruiter_id]
        );

        return res.status(200).json({
            message: "Dashboard stats fetched successfully",
            dashboard: stats[0]
        });
    } catch (error) {
        console.error("Recruiter dashboard error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getRecentApplications = async (req, res) => {
    try {
        const recruiter_id = req.user.id;

        const [applications] = await db.promise().execute(
            `
            SELECT 
                applications.id,
                users.name AS candidate_name,
                users.email AS candidate_email,
                jobs.title AS job_title,
                jobs.company AS company_name,
                applications.status,
                applications.applied_at
            FROM applications
            INNER JOIN jobs ON applications.job_id = jobs.id
            INNER JOIN users ON applications.candidate_id = users.id
            WHERE jobs.recruiter_id = ?
            ORDER BY applications.applied_at DESC
            LIMIT 10
            `,
            [recruiter_id]
        );

        return res.status(200).json({
            message: "Recent applications fetched successfully",
            applications: applications
        });
    } catch (error) {
        console.error("Error fetching recent applications:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

const getJobApplicationsStats = async (req, res) => {
    try {
        const recruiter_id = req.user.id;

        const [jobs] = await db.promise().execute(
            `SELECT
                jobs.id AS job_id,
                jobs.title AS job_title,
                jobs.company AS company_name,
                
                COUNT(applications.id) AS total_applications,
                COALESCE(SUM(CASE WHEN applications.status = 'applied' THEN 1 ELSE 0 END), 0) AS pending_applications,
                COALESCE(SUM(CASE WHEN applications.status = 'shortlisted' THEN 1 ELSE 0 END), 0) AS shortlisted_candidates,
                COALESCE(SUM(CASE WHEN applications.status = 'interviewed' THEN 1 ELSE 0 END), 0) AS interviewed_candidates,
                COALESCE(SUM(CASE WHEN applications.status = 'selected' THEN 1 ELSE 0 END), 0) AS selected_candidates,
                COALESCE(SUM(CASE WHEN applications.status = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected_candidates
            FROM jobs
            LEFT JOIN applications ON jobs.id = applications.job_id
            WHERE jobs.recruiter_id = ?
            GROUP BY jobs.id, jobs.title, jobs.company`,
            [recruiter_id]
        );

        return res.status(200).json({
            message: "Job applications stats fetched successfully",
            total_jobs: jobs.length,
            jobs: jobs
        });
    } catch (error) {
        console.error("Error fetching job applications stats:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    getDashboardStats,
    getRecentApplications,
    getJobApplicationsStats
};
