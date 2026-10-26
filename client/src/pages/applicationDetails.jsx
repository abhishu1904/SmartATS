import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./applicationDetails.css";

const API_URL = "http://localhost:5000/api/applications";

function ApplicationDetails() {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const updateApplicationStatus = async (newStatus) => {
        try {
            const token = localStorage.getItem("smartats_token");

            if (!token) {
                navigate("/");
                return;
            }

            const response = await fetch(
                `${API_URL}/${applicationId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update application status"
                );
            }

            setApplication((previous) => ({
                ...previous,
                status: newStatus
            }));

            alert(`Application status updated to ${newStatus}!`);

        } catch (err) {
            alert(err.message || "Something went wrong");
        }
    };

    useEffect(() => {
        const fetchApplicationDetails = async () => {
            try {
                const token = localStorage.getItem("smartats_token");

                if (!token) {
                    navigate("/");
                    return;
                }
                const response = await fetch(
                    `${API_URL}/${applicationId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                const data = await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load application details"
                    );
                }

                setApplication(data.application);
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };
        fetchApplicationDetails();

    }, [applicationId, navigate]);

    if (loading) {
        return <div className="application-details-loading">Loading application details...</div>
    }

    if (error) {
        return (
            <div className="application-details-error">
                <h2>
                    Unable to load the application
                </h2>
                <p>{error}</p>
                <button onClick={() => navigate("/recruiter-dashboard")}>Back to dashboard</button>
            </div>
        );
    }

    if (!application) {
        return null;
    }

    const candidateInitial = application.candidate_name ? application.candidate_name.charAt(0).toUpperCase() : "?";

    return (
        <div className="application-details-page">
            <button className="application-back-button" onClick={() => navigate("/recruiter-dashboard")}>
                ⮜ Back to Dashboard
            </button>
            <header className="application-details-header">
                <div className="application-candidate-avatar">
                    {candidateInitial}
                </div>

                <div>
                    <p className="application-eyebrow">CANDIDATE APPLICATION</p>

                    <h1>{application.candidate_name || "Candidate"}</h1>

                    <p className="application-candidate-email">
                        {application.candidate_email || "Email not available"}
                    </p>
                </div>
                <span className={`application-details-status ${String(application.status || "applied").toLowerCase()}`}>
                    {application.status || "Applied"}
                </span>
            </header>
            <section className="application-details-card application-actions-card">
                <div className="application-actions-heading">
                    <div>
                        <h2>Manage Application</h2>
                        <p>Update the candidate's recruitment status.</p>
                    </div>
                </div>

                <div className="application-status-actions">
                    <button
                        className="status-action-btn shortlist-btn"
                        onClick={() => updateApplicationStatus("shortlisted")}
                        disabled={application.status === "shortlisted"}
                    >
                        ✓ Shortlist
                    </button>

                    <button
                        className="status-action-btn interview-btn"
                        onClick={() => updateApplicationStatus("interviewed")}
                        disabled={application.status === "interviewed"}
                    >
                        ◷ Interview
                    </button>

                    <button
                        className="status-action-btn hire-btn"
                        onClick={() => updateApplicationStatus("selected")}
                        disabled={application.status === "selected"}
                    >
                        ★ Hire Candidate
                    </button>

                    <button
                        className="status-action-btn reject-btn"
                        onClick={() => updateApplicationStatus("rejected")}
                        disabled={application.status === "rejected"}
                    >
                        ✕ Reject
                    </button>
                </div>
            </section>
            <div className="application-details-grid">
                <section className="application-details-card job-information-card">
                    <div className="job-information-heading">
                        <div className="job-information-icon">✦</div>

                        <div>
                            <h2>Job Information</h2>
                            <p>Details about this opportunity</p>
                        </div>
                    </div>

                    <div className="job-primary-details">
                        <span className="job-detail-label">POSITION</span>
                        <h3>{application.job_title || "Job title not available"}</h3>

                        <div className="job-company-location">
                            <div className="job-company-item">
                                <span className="job-mini-icon">▦</span>
                                <div>
                                    <span>COMPANY</span>
                                    <strong>{application.company || "Not available"}</strong>
                                </div>
                            </div>

                            <div className="job-company-item">
                                <span className="job-mini-icon">⌖</span>
                                <div>
                                    <span>LOCATION</span>
                                    <strong>{application.location || "Not specified"}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="job-extra-details">
                        <div className="job-extra-item">
                            <span>Job Type</span>
                            <strong>{application.job_type || "Not specified"}</strong>
                        </div>

                        <div className="job-extra-item">
                            <span>Experience Required</span>
                            <strong>
                                {application.experience_required || "Not specified"}
                            </strong>
                        </div>

                        <div className="job-extra-item">
                            <span>Applied On</span>
                            <strong>
                                {application.applied_at
                                    ? new Date(application.applied_at).toLocaleDateString()
                                    : "Not available"}
                            </strong>
                        </div>
                    </div>
                </section>
                <section className="application-details-card">
                    <h2>Skills & Requirements</h2>

                    <p className="application-description">
                        {application.description || "No job description available."}
                    </p>

                    <div className="application-detail-item">
                        <span>Required Skills</span>
                        <strong>
                            {Array.isArray(application.skills)
                                ? application.skills.join(", ")
                                : application.skills || "Not specified"}
                        </strong>
                    </div>

                    <div className="application-detail-item">
                        <span>Salary Range</span>
                        <strong>
                            {application.salary_min != null || application.salary_max != null
                                ? `${application.salary_min ?? "—"} – ${application.salary_max ?? "—"}`
                                : "Not specified"}
                        </strong>
                    </div>
                </section>

                <section className="application-details-card">
                    <h2>Cover Letter</h2>

                    <p className="application-description application-cover-letter">
                        {application.cover_letter || "No cover letter provided."}
                    </p>
                </section>

                <section className="application-details-card">
                    <h2>Resume</h2>

                    {application.resume_url ? (
                        <a
                            className="application-resume-button"
                            href={`http://localhost:5000${application.resume_url}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View Resume ↗
                        </a>
                    ) : (
                        <p className="application-description">
                            No resume uploaded.
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default ApplicationDetails;