import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faUserTie,
    faBriefcase,
    faFileAlt,
    faPaperPlane,
    faLocationDot,
    faArrowRightFromBracket,
    faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';

import './candidateDashboard.css'


const API_URL = 'http://localhost:5000';

function CandidateDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [jobTypeFilter, setJobTypeFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [applying, setApplying] = useState(false);
    const [applicationMessage, setApplicationMessage] = useState('');
    const [applicationError, setApplicationError] = useState('');
    const [myApplications, setMyApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(true);
    const [applicationsError, setApplicationsError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('smartats_token');
        const savedUser = localStorage.getItem('smartats_user');

        if (!token || !savedUser) {
            navigate('/', { replace: true });
            return;
        }

        try {
            const parsedUser = JSON.parse(savedUser);

            if (parsedUser.role !== 'candidate') {
                navigate('/', { replace: true });
                return;
            }
            setUser(parsedUser);
        } catch {
            localStorage.removeItem('smartats_token');
            localStorage.removeItem('smartats_user');
            navigate('/', { replace: true });
            return;
        }

        const fetchMyApplications = async () => {
            const token = localStorage.getItem('smartats_token');

            try {
                const response = await fetch(`${API_URL}/api/applications/my`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Unable to load your applications.'
                    );
                }

                setMyApplications(
                    Array.isArray(data.applications) ? data.applications : []
                );

            } catch (err) {
                setApplicationsError(
                    err.message || 'Unable to load your applications.'
                );
            } finally {
                setApplicationsLoading(false);
            }
        };

        fetchMyApplications();

        const fetchJob = async () => {
            try {
                const response = await fetch(`${API_URL}/api/jobs`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Unable to load jobs.');
                }

                const jobsList = Array.isArray(data)
                    ? data
                    : Array.isArray(data.jobs)
                        ? data.jobs
                        : [];

                setJobs(jobsList);
            } catch (err) {
                setError(
                    'Unable to load jobs. Please check whether your backend is running.'
                );
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('smartats_token');
        localStorage.removeItem('smartats_user');
        navigate('/', { replace: true });
    };

    const handleApplyForJob = async () => {
        setApplicationMessage('');
        setApplicationError('');
        const token = localStorage.getItem('smartats_token');

        if (!token) {
            setApplicationError('Please log in to apply for job.');
            return;
        }

        if (!selectedJob?.id) {
            setApplicationError('Please select a valid job.');
            return;
        }

        setApplying(true);

        try {
            const response = await fetch(`${API_URL}/api/applications`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: (() => {
                    const formData = new FormData();
                    formData.append('job_id', selectedJob.id);
                    return formData;
                })()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to submit the application.'
                );
            }

            setApplicationMessage(
                data.message || 'Application submitted successfully'
            );
        } catch (error) {
            setApplicationError(error.message || 'Something went wrong! Please try again.');
        } finally {
            setApplying(false);
        }
    };

    if (!user) {
        return null;
    }

    const activeJobs = jobs.filter(
        (job) => !job.status || job.status === 'active'
    );

    const filteredJobs = activeJobs.filter((job) => {
        const search = searchTerm.trim().toLowerCase();
        const location = locationFilter.trim().toLowerCase();

        const matchesSearch =
            !search ||
            [job.title, job.company, job.skills, job.description]
                .some((value) => String(value || '').toLowerCase().includes(search));

        const matchesLocation =
            !location ||
            String(job.location || '').toLowerCase().includes(location);

        const matchesJobType =
            !jobTypeFilter ||
            String(job.job_type || '').toLowerCase() === jobTypeFilter.toLowerCase();

        return matchesSearch && matchesLocation && matchesJobType;
    });

    return (
        <main className="candidate-dashboard">
            <aside className="dashboard-sidebar">
                <div className="dashboard-brand">
                    <div className="dashboard-brand-icon">
                        <FontAwesomeIcon icon={faUserTie} />
                    </div>
                    <span>SmartATS</span>
                </div>
                <div className="sidebar-label">
                    WORKSPACE
                </div>
                <button className="sidebar-link active" type="button">
                    <FontAwesomeIcon icon={faBriefcase} />
                    Dashboard
                </button>
                <button className="sidebar-link" type="button" onClick={() =>
                    document.getElementById('available-jobs')?.scrollIntoView({ behavior: 'smooth' })
                }>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    Find Jobs
                </button>
                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="sidebar-user-info">
                            <strong>{user.name}</strong>
                            <span>Candidate</span>
                        </div>
                    </div>
                    <button className="logout-button" type="button" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faArrowRightFromBracket} />
                        Logout
                    </button>
                </div>
            </aside>
            <section className="dashboard-main">
                <header className="dashboard-topbar">
                    <div>
                        <span className="dashboard-eyebrow">
                            CANDIDATE WORKSPACE
                        </span>
                        <h1>
                            Dashboard
                        </h1>
                    </div>
                    <div className="topbar-profile">
                        <div className="user-avatar">
                            {user.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                            <strong>{user.name}</strong>
                            <span>Candidate Account</span>
                        </div>
                    </div>
                </header>
                <section className="dashboard-welcome">
                    <div>
                        <span className="welcome-tag">
                            YOUR CAREER JOURNEY
                        </span>
                        <h2>
                            Welcome back, {user.name?.split(' ')[0]}! 👋
                        </h2>
                        <p>
                            Discover opportunities, explore companies, and take the next step to the career.
                        </p>
                        <button className="explore-jobs-button" type="button" onClick={() =>
                            document.getElementById('available-jobs')?.scrollIntoView({ behavior: 'smooth' })
                        }>
                            Explore Jobs <FontAwesomeIcon icon={faArrowRightFromBracket} />
                        </button>
                    </div>
                    <div className="welcome-decoration">
                        <FontAwesomeIcon icon={faBriefcase} />
                    </div>
                </section>
                <section className="dashboard-stats">
                    <article className="stat-card">
                        <div className="stat-icon purple">
                            <FontAwesomeIcon icon={faBriefcase} />
                        </div>

                        <div className="stat-card-content">
                            <span>Available Jobs</span>

                            <h3>{loading ? "-" : activeJobs.length}</h3>

                            <p>Explore opportunities and find your next career move.</p>

                            <div className="stat-card-highlights">
                                <div className="stat-highlight-item">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                    <span>Explore Opportunities</span>
                                </div>

                                <div className="stat-highlight-item">
                                    <FontAwesomeIcon icon={faBriefcase} />
                                    <span>Latest Job Listings</span>
                                </div>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card">
                        <div className="stat-icon blue">
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </div>

                        <div className="stat-card-content">
                            <span>My Applications</span>

                            <h3>
                                {applicationsLoading ? "..." : myApplications.length}
                            </h3>

                            <p>Keep track of the opportunities you have applied for.</p>

                            <div className="stat-card-highlights">
                                <div className="stat-highlight-item blue-highlight">
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                    <span>Application History</span>
                                </div>

                                <div className="stat-highlight-item blue-highlight">
                                    <FontAwesomeIcon icon={faBriefcase} />
                                    <span>Track Your Progress</span>
                                </div>
                            </div>
                        </div>
                    </article>
                    <article className="stat-card profile-stat-card">
                        <div className="start-icon pink">
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>

                        <div className="profile-stat-content">
                            <span>My Profile</span>

                            <h3>Manage Profile</h3>

                            <p>
                                Keep your professional details updated and make your profile
                                stand out to recruiters.
                            </p>

                            <div className="profile-highlights">
                                <div className="profile-highlight-item">
                                    <FontAwesomeIcon icon={faUserTie} />
                                    <span>Personal Details</span>
                                </div>

                                <div className="profile-highlight-item">
                                    <FontAwesomeIcon icon={faFileAlt} />
                                    <span>Resume & Skills</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="job-details-button"
                                onClick={() => navigate("/view-profile")}
                            >
                                View Profile
                                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                            </button>
                        </div>
                    </article>
                </section>
                <section className="jobs-section" id="available-jobs">
                    {/* Job Search and Filters */}
                    <div className="job-search-filters">
                        <div className="job-search-input">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                            <input
                                type="text"
                                placeholder="Search by job title, company, or skills..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </div>

                        <div className="job-filter-input">
                            <FontAwesomeIcon icon={faLocationDot} />
                            <input
                                type="text"
                                placeholder="Filter by location..."
                                value={locationFilter}
                                onChange={(event) => setLocationFilter(event.target.value)}
                            />
                        </div>

                        <div className="job-filter-input">
                            <FontAwesomeIcon icon={faBriefcase} />
                            <select
                                value={jobTypeFilter}
                                onChange={(event) => setJobTypeFilter(event.target.value)}
                            >
                                <option value="">All Job Types</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            className="clear-job-filters"
                            onClick={() => {
                                setSearchTerm('');
                                setLocationFilter('');
                                setJobTypeFilter('');
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                    <div className="section-heading">
                        <div>
                            <span className="dashboard-eyebrow">
                                OPPORTUNITIES
                            </span>
                            <h2>Explore Latest Jobs</h2>
                            <p>Find your roles that matches your intrest and skills.</p>
                        </div>
                        <span className="jobs-count">
                            {loading ? 'Loading...' : `${activeJobs.length} jobs`}
                        </span>
                    </div>
                    {loading && (
                        <div className="jobs-message">Loading available jobs...</div>
                    )}
                    {!loading && error && (
                        <div className="jobs-message jobs-error">{error}</div>
                    )}
                    {!loading && !error && filteredJobs.length === 0 && (
                        <div className="jobs-message">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                            <h3>No matching jobs found</h3>
                            <p>Try changing your search or clearing the filters.</p>
                        </div>
                    )}
                    {!loading && !error && filteredJobs.length > 0 && (
                        <div className="jobs-grid">
                            {filteredJobs.map((job) => (
                                <article className="job-card" key={job.id}>
                                    <div className="job-card-top">
                                        <div className="company-avatar">
                                            {job.company?.charAt(0).toUpperCase() || 'C'}
                                        </div>
                                        <span className="job-status">Active</span>
                                    </div>
                                    <h3>{job.title}</h3>
                                    <p className="job-company">
                                        {job.company}
                                    </p>
                                    <div className="job-location">
                                        <FontAwesomeIcon icon={faLocationDot} />
                                        {job.location || 'Location is not specified'}
                                    </div>
                                    {job.job_type && (
                                        <span className="job-type">{job.job_type}</span>
                                    )}
                                    <p className="job-description">
                                        {job.description
                                            ? `${job.description.slice(0, 120)}${job.description.length > 120 ? '...' : ''
                                            }`
                                            : 'Explore this opportunity to learn more'}
                                    </p>
                                    <button className="job-details-button" type="button" onClick={() => setSelectedJob(job)}>
                                        View details <FontAwesomeIcon icon={faArrowRightFromBracket} />
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
                {/* My Applications Section */}
                <section className="applications-section" id="my-applications">
                    <div className="section-heading">
                        <div>
                            <span className="dashboard-eyebrow">
                                APPLICATION TRACKER
                            </span>
                            <h2>My Applications</h2>
                            <p>Track the progress of your job applications.</p>
                        </div>

                        <span className="jobs-count">
                            {applicationsLoading
                                ? 'Loading...'
                                : `${myApplications.length} applications`}
                        </span>
                    </div>

                    {applicationsLoading && (
                        <div className="jobs-message">
                            Loading your applications...
                        </div>
                    )}

                    {!applicationsLoading && applicationsError && (
                        <div className="jobs-message jobs-error">
                            {applicationsError}
                        </div>
                    )}

                    {!applicationsLoading &&
                        !applicationsError &&
                        myApplications.length === 0 && (
                            <div className="jobs-message">
                                <FontAwesomeIcon icon={faPaperPlane} />
                                <h3>No applications yet</h3>
                                <p>
                                    Explore available jobs and apply to start tracking your applications here.
                                </p>
                            </div>
                        )}

                    {!applicationsLoading &&
                        !applicationsError &&
                        myApplications.length > 0 && (
                            <div className="applications-table-wrapper">
                                <table className="applications-table">
                                    <thead>
                                        <tr>
                                            <th>Job Title</th>
                                            <th>Company</th>
                                            <th>Applied Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {myApplications.map((application) => (
                                            <tr key={application.id}>
                                                <td>
                                                    <strong>
                                                        {application.job_title || application.title || 'Job title unavailable'}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {application.company || 'Not specified'}
                                                </td>

                                                <td>
                                                    {application.applied_at
                                                        ? new Date(application.applied_at).toLocaleDateString('en-IN')
                                                        : application.created_at
                                                            ? new Date(application.created_at).toLocaleDateString('en-IN')
                                                            : 'Not available'}
                                                </td>

                                                <td>

                                                    <div className="application-progress">
                                                        {(() => {
                                                            const status = (application.status || 'Applied').toLowerCase();

                                                            const stages = [
                                                                'Applied',
                                                                'Reviewed',
                                                                'Interviewed',
                                                                'Shortlisted',
                                                                'Selected'
                                                            ];

                                                            const rejected = status === 'rejected';
                                                            const currentStage = stages.findIndex(
                                                                stage => stage.toLowerCase() === status
                                                            );

                                                            return (
                                                                <>
                                                                    <div className="progress-track">
                                                                        {stages.map((stage, index) => {
                                                                            const completed = !rejected && currentStage >= index;
                                                                            const active = !rejected && currentStage === index;

                                                                            return (
                                                                                <div
                                                                                    key={stage}
                                                                                    className={`progress-stage ${completed ? 'completed' : ''
                                                                                        } ${active ? 'active' : ''}`}
                                                                                    title={stage}
                                                                                >
                                                                                    <span className="progress-dot">
                                                                                        {completed ? '✓' : index + 1}
                                                                                    </span>

                                                                                    <span className="progress-label">
                                                                                        {stage}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    {rejected && (
                                                                        <div className="rejected-message">
                                                                            ✕ Application Rejected
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                </section>
                {/*Job details model.*/}
                {
                    selectedJob && (
                        <div className="job-modal-overlay" onClick={() => setSelectedJob(null)}>
                            <div className="job-modal" onClick={(event) => event.stopPropagation()}>
                                <button className="job-modal-close" type="button" onClick={() => setSelectedJob(null)} aria-label="Close job details">
                                    &times;
                                </button>
                                <span className="dashboard-eyebrow">
                                    JOB DETAILS
                                </span>
                                <h2>{selectedJob.title}</h2>
                                <p className="job-modal-company">
                                    {selectedJob.company || 'Company not specified'}
                                </p>
                                <div className="job-modal-info">
                                    <span>
                                        <FontAwesomeIcon icon={faLocationDot} />
                                        {' '}{selectedJob.location || 'Location is not specified'}
                                    </span>
                                    <span>
                                        <FontAwesomeIcon icon={faBriefcase} />
                                        {' '}{selectedJob.job_type || 'Employment type is not specified'}
                                    </span>
                                </div>
                                <div className="job-modal-section">
                                    <h3>Job description</h3>
                                    <p>
                                        {selectedJob.description || 'No job description has been provided'}
                                    </p>
                                </div>
                                <div className="job-modal-section">
                                    <h3>Salary</h3>
                                    <p>
                                        {selectedJob.salary_min != null || selectedJob.salary_max != null
                                            ? `${selectedJob.salary_min ?? 'Not specified'} - ${selectedJob.salary_max ?? 'Not specified'}`
                                            : 'Salary not disclosed'}
                                    </p>
                                </div>
                                <div className="job-modal-section">
                                    <h3>Required skills</h3>
                                    <p>
                                        {
                                            selectedJob.skills || 'skills not specified'
                                        }
                                    </p>
                                </div>
                                <button type="button" className="job-apply-button" onClick={(handleApplyForJob)} disabled={applying}>
                                    {applying ? 'Applying...' : 'Apply now'}
                                    <FontAwesomeIcon icon={faArrowRightFromBracket} />
                                </button>
                                {applicationMessage && (
                                    <p className="application-success">
                                        {applicationMessage}
                                    </p>
                                )}
                                {applicationError && (
                                    <p className="application-error">
                                        {applicationError}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                }
            </section>
        </main>
    );
}

export default CandidateDashboard;