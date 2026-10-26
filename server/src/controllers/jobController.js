const db = require("../config/db");

const getJobs = (req, res) => {
    const sql = "SELECT * FROM jobs ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching jobs:", err.message);
            return res.status(200).json({
                message: "failed to fetch jobs"
            });
        }
        res.status(200).json({
            message: "Jobs fetched successfully",
            jobs: results
        });
    });
};

const getMyJobs = (req, res) => {
    const recruiter_id = req.user.id;

    const sql = `
        SELECT *
        FROM jobs
        WHERE recruiter_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [recruiter_id], (err, results) => {
        if (err) {
            console.error("Error fetching recruiter jobs:", err.message);

            return res.status(500).json({
                message: "Failed to fetch your jobs"
            });
        }

        res.status(200).json({
            message: "Your jobs fetched successfully",
            jobs: results
        });
    });
};

//job creation

const createJob = (req, res) => {
    const {
        title,
        company,
        location,
        description,
        job_type,
        salary_min,
        salary_max,
        skills,
        experience_required
    } = req.body;

    const recruiter_id = req.user.id; // Assuming the recruiter is authenticated and their ID is available in req.user

    const sql = `
    INSERT INTO jobs
    (
    recruiter_id,
    title,
    company,
    location,
    description,
    job_type,
    salary_min,
    salary_max,
    skills,
    experience_required
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        recruiter_id,
        title,
        company,
        location,
        description,
        job_type,
        salary_min,
        salary_max,
        skills,
        experience_required
    ];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error in creating job:", err.message);
            return res.status(500).json({
                message: "Failed to create the job"
            });
        }

        res.status(201).json({
            message: "Job created successfully",
            job: {
                id: result.insertId,
                title,
                company,
                location,
                description,
                job_type,
                salary_min,
                salary_max,
                skills,
                experience_required
            }
        });
    });
};

const getJobById = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM jobs WHERE id=?";
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Errors in fetching jobs:", err.message);
            return res.status(500).json({
                message: "failed to fetch the job"
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                message: "no jobs found"
            });
        }
        res.status(200).json({
            message: "Job fetched successfully",
            job: results[0]
        });
    });
};

const updateJob = (req, res) => {

    const { id } = req.params;

    const recruiter_id = req.user.id;

    const {
        title,
        company,
        location,
        description,
        job_type,
        salary_min,
        salary_max,
        skills,
        experience_required
    } = req.body;

    // Make sure all values are simple values
    const values = [
        String(title),
        String(company),
        location ? String(location) : null,
        String(description),
        String(job_type),
        Number(salary_min),
        Number(salary_max),
        String(skills),
        String(experience_required),
        Number(id),
        recruiter_id
    ];

    const sql = `
        UPDATE jobs
        SET
            title = ?,
            company = ?,
            location = ?,
            description = ?,
            job_type = ?,
            salary_min = ?,
            salary_max = ?,
            skills = ?,
            experience_required = ?
        WHERE id = ? AND recruiter_id = ?
    `;

    console.log("UPDATE VALUES:", values);

    db.execute(sql, values, (err, result) => {

        if (err) {
            console.error("UPDATE ERROR:", err.message);

            return res.status(500).json({
                message: "Failed to update job",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.status(200).json({
            message: "Job updated successfully"
        });
    });
};

const deleteJob = (req, res) => {
    const { id } = req.params;
    const recruiter_id = req.user.id;

    const sql = `
        DELETE FROM jobs
        WHERE id = ? AND recruiter_id = ?
    `;

    db.execute(
        sql,
        [Number(id), recruiter_id],
        (err, result) => {
            if (err) {
                console.error("Error in deleting the job:", err.message);

                return res.status(500).json({
                    message: "Failed to delete the job"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Job not found or you do not own this job"
                });
            }

            res.status(200).json({
                message: "Job deleted successfully"
            });
        }
    );
};

module.exports = {
    getJobs,
    getMyJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob
};
