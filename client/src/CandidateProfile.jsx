import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserTie,
    faArrowLeft,
    faSave
} from "@fortawesome/free-solid-svg-icons";

import "./candidateProfile.css"

const API_URL = `${import.meta.env.VITE_API_URL}/api/profile`;

function CandidateProfile() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone: "",
        skills: "",
        education: "",
        experience: ""
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeMessage, setResumeMessage] = useState("");
    const [uploadingResume, setUploadingResume] = useState(false);
    const [resumeUrl, setResumeUrl] = useState("");

    const token = localStorage.getItem("smartats_token");
    const user = JSON.parse(localStorage.getItem("smartats_user") || "null");

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await fetch(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 404) {
                    // Profile doesn't exist yet; allow the user to create one.
                    setLoading(false);
                    return;
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load profile.");
                }

                if (data.profile) {
                    setFormData({
                        phone: data.profile.phone || "",
                        skills: data.profile.skills || "",
                        education: data.profile.education || "",
                        experience: data.profile.experience || ""
                    });
                    setResumeUrl(data.profile.resume_url || "");
                }
            } catch (err) {
                setError(err.message || "Unable to load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token, navigate]);

    const isEditing = true;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleResumeUpload = async (event) => {
        event.preventDefault();

        setResumeMessage("");
        setError("");

        if (!resumeFile) {
            setResumeMessage("Please select a PDF resume first.");
            return;
        }

        if (resumeFile.type !== "application/pdf") {
            setResumeMessage("Only PDF files are allowed.");
            return;
        }

        if (resumeFile.size > 5 * 1024 * 1024) {
            setResumeMessage("Resume must be 5 MB or smaller.");
            return;
        }

        const formData = new FormData();
        formData.append("resume", resumeFile);

        try {
            setUploadingResume(true);

            const response = await fetch(`${API_URL}/resume`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Resume upload failed.");
            }

            setResumeUrl(data.resume_url || "");
            setResumeFile(null);
            setResumeMessage("Resume uploaded successfully! 🎉");
        } catch (err) {
            setResumeMessage(err.message || "Unable to upload resume.");
        } finally {
            setUploadingResume(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save profile.");
            }

            setMessage(data.message || "Profile saved successfully!");

            setTimeout(() => {
                navigate("/view-profile");
            }, 1000);
        } catch (err) {
            setError(err.message || "Unable to save profile.");
        }
    };

    if (loading) {
        return <div className="profile-loading">Loading your profile...</div>;
    }

    return (
        <main className="candidate-profile-page">
            <section className="candidate-profile-card">
                <button
                    type="button"
                    className="profile-back-button"
                    onClick={() => navigate("/candidate-dashboard")}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back to Dashboard
                </button>

                <div className="profile-heading">
                    <div className="profile-heading-icon">
                        <FontAwesomeIcon icon={faUserTie} />
                    </div>

                    <div className="profile-heading-info">
                        <h1>Manage Your Profile</h1>
                        <p>Keep your professional information updated for recruiters.</p>

                        {user && (
                            <div className="profile-user-details">
                                <span className="profile-user-name">{user.name}</span>
                                <span className="profile-user-email">{user.email}</span>
                            </div>
                        )}
                    </div>
                </div>

                {message && (
                    <div className="profile-success-message">{message}</div>
                )}

                {error && (
                    <div className="profile-error-message">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="candidate-profile-form">
                    <div className="profile-form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div className="profile-form-group">
                        <label htmlFor="skills">Skills</label>
                        <textarea
                            id="skills"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="e.g. React, Node.js, MySQL"
                            rows="3"
                        />
                    </div>

                    <div className="profile-form-group">
                        <label htmlFor="education">Education</label>
                        <textarea
                            id="education"
                            name="education"
                            value={formData.education}
                            onChange={handleChange}
                            placeholder="Enter your educational background"
                            rows="3"
                        />
                    </div>

                    <div className="profile-form-group">
                        <label htmlFor="experience">Experience</label>
                        <textarea
                            id="experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="Describe your work or project experience"
                            rows="4"
                        />
                    </div>

                    {/* Resume Upload Section */}
                    <div className="profile-form-group resume-upload-group">
                        <label htmlFor="resume">Upload Your Resume (PDF)</label>

                        <p>
                            Upload your latest resume to help recruiters understand your profile.
                            Maximum file size: 5 MB.
                        </p>

                        <input
                            id="resume"
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(event) => {
                                setResumeFile(event.target.files?.[0] || null);
                                setResumeMessage("");
                            }}
                        />

                        <button
                            type="button"
                            className="profile-save-button"
                            onClick={handleResumeUpload}
                            disabled={uploadingResume || !resumeFile}
                        >
                            <FontAwesomeIcon icon={faSave} />
                            {uploadingResume
                                ? "Uploading Resume..."
                                : resumeUrl
                                    ? "Replace Resume"
                                    : "Upload Resume"}
                        </button>

                        {resumeMessage && (
                            <p role="status" aria-live="polite">
                                {resumeMessage}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="profile-save-button"
                    >
                        <FontAwesomeIcon icon={faSave} />
                        Save Changes
                    </button>
                </form>
            </section>
        </main>
    );
}

export default CandidateProfile;