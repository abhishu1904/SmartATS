import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserTie,
    faArrowLeft,
    faPenToSquare,
    faEnvelope,
    faPhone,
    faCode,
    faGraduationCap,
    faBriefcase
} from "@fortawesome/free-solid-svg-icons";

import "./viewProfile.css";

const API_URL = "http://localhost:5000/api/profile";

function ViewProfile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeMessage, setResumeMessage] = useState("");
    const [uploadingResume, setUploadingResume] = useState(false);

    const handleResumeUpload = async (e) => {
        e.preventDefault();

        if (!resumeFile) {
            setResumeMessage("Please select a PDF resume first.");
            return;
        }

        if (resumeFile.type !== "application/pdf") {
            setResumeMessage("Only PDF files are allowed.");
            return;
        }

        if (resumeFile.size > 5 * 1024 * 1024) {
            setResumeMessage("PDF size must be less than 5 MB.");
            return;
        }

        const formData = new FormData();
        formData.append("resume", resumeFile);

        try {
            setUploadingResume(true);
            setResumeMessage("");

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

            setProfile((previousProfile) => ({
                ...(previousProfile || {}),
                resume_url: data.resume_url
            }));

            setResumeFile(null);
            setResumeMessage("Resume uploaded successfully! 🎉");

            e.target.reset();

        } catch (err) {
            setResumeMessage(err.message || "Unable to upload resume.");
        } finally {
            setUploadingResume(false);
        }
    };

    const token = localStorage.getItem("smartats_token");
    const user = JSON.parse(
        localStorage.getItem("smartats_user") || "null"
    );

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token || !user || user.role !== "candidate") {
                navigate("/");
                return;
            }

            try {
                const response = await fetch(API_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 404) {
                        setProfile(null);
                        return;
                    }

                    throw new Error(
                        data.message || "Failed to load profile."
                    );
                }

                setProfile(data.profile || null);
            } catch (err) {
                setError(err.message || "Unable to load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token, navigate]);

    if (loading) {
        return (
            <div className="view-profile-loading">
                Loading your profile...
            </div>
        );
    }

    if (error) {
        return (
            <main className="view-profile-page">
                <section className="view-profile-card">
                    <p className="view-profile-error">{error}</p>

                    <button
                        type="button"
                        onClick={() => navigate("/candidate-dashboard")}
                    >
                        Back to Dashboard
                    </button>
                </section>
            </main>
        );
    }

    const profileFields = [
        {
            label: "Phone Number",
            value: profile?.phone,
            icon: faPhone
        },
        {
            label: "Skills",
            value: profile?.skills,
            icon: faCode
        },
        {
            label: "Education",
            value: profile?.education,
            icon: faGraduationCap
        },
        {
            label: "Experience",
            value: profile?.experience,
            icon: faBriefcase
        }
    ];

    return (
        <main className="view-profile-page">
            <section className="view-profile-card">

                <div className="view-profile-actions">
                    <button
                        type="button"
                        className="view-profile-back"
                        onClick={() => navigate("/candidate-dashboard")}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Dashboard
                    </button>

                    <button
                        type="button"
                        className="view-profile-edit"
                        onClick={() => navigate("/candidate-profile")}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} />
                        Edit Profile
                    </button>
                </div>

                <header className="view-profile-header">
                    <div className="view-profile-avatar">
                        <FontAwesomeIcon icon={faUserTie} />
                    </div>

                    <div className="view-profile-identity">
                        <span className="view-profile-eyebrow">
                            CANDIDATE PROFILE
                        </span>

                        <h1>{user?.name || "Candidate"}</h1>

                        <p className="view-profile-email">
                            <FontAwesomeIcon icon={faEnvelope} />
                            {user?.email || "Email not available"}
                        </p>
                    </div>
                </header>

                <div className="view-profile-divider" />
                <div className="view-profile-section-heading">
                    <h2>Professional Information</h2>
                    <p>Your saved career and education details.</p>
                </div>

                {!profile ? (
                    <div className="view-profile-empty">
                        <FontAwesomeIcon icon={faUserTie} />

                        <h3>Your profile isn't complete yet</h3>

                        <p>
                            Add your skills, education, phone number and
                            experience to build your professional profile.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/candidate-profile")}
                        >
                            Complete Your Profile
                        </button>
                    </div>
                ) : (
                    <div className="view-profile-details">
                        {profileFields.map((field) => (
                            <article
                                className="view-profile-detail"
                                key={field.label}
                            >
                                <div className="view-profile-detail-icon">
                                    <FontAwesomeIcon icon={field.icon} />
                                </div>

                                <div className="view-profile-detail-content">
                                    <h3>{field.label}</h3>

                                    <p>
                                        {field.value?.trim()
                                            ? field.value
                                            : "Not provided yet"}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

            </section>
        </main>
    );
}

export default ViewProfile;