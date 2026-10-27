import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserTie,
    faBriefcase,
    faUsers,
    faPlus,
    faArrowRightFromBracket,
    faEllipsisVertical,
    faPenToSquare,
    faTrash
} from '@fortawesome/free-solid-svg-icons';

import './RecruiterDashboard.css';

const API_URL = import.meta.env.VITE_API_URL;

function RecruiterDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [recentApplications, setRecentApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(true);
    const [applicationsError, setApplicationsError] = useState('');
    const [jobsLoading, setJobsLoading] = useState(true);
    const [jobsError, setJobsError] = useState('');
    const [openJobMenu, setOpenJobMenu] = useState(null);
    const [editingJob, setEditingJob] = useState(null);
    const [showJobForm, setShowJobForm] = useState(false);
    const [jobForm, setJobForm] = useState({
        title: '',
        company: '',
        location: '',
        job_type: '',
        salary_min: '',
        salary_max: '',
        skills: '',
        experience_required: '',
        description: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [jobMessage, setJobMessage] = useState('');
    const [applicantSearch, setApplicantSearch] = useState('');
    const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');

    useEffect(() => {
        const token = localStorage.getItem('smartats_token');
        const savedUser = localStorage.getItem('smartats_user');

        if (!token || !savedUser) {
            navigate('/', { replace: true });
            return;
        }

        try {
            const parsedUser = JSON.parse(savedUser);

            if (parsedUser.role !== 'recruiter') {
                navigate('/', { replace: true });
                return;
            }

            setUser(parsedUser);
        } catch {
            localStorage.removeItem('smartats_token');
            localStorage.removeItem('smartats_user');
            navigate('/', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        fetchMyJobs(),
            fetchDashboardStats(),
            fetchRecentApplications();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('smartats_token');
        localStorage.removeItem('smartats_user');
        navigate('/', { replace: true });
    };

    const fetchMyJobs = async () => {
        const token = localStorage.getItem('smartats_token');

        if (!token) {
            setJobsError('Session expired! Log in again.');
            setJobsLoading(false);
            return;
        }

        setJobsLoading(true);
        setJobsError('');

        try {
            const response = await fetch(
                `${API_URL}/api/jobs/my-jobs`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch jobs.');
            }

            setJobs(data.jobs || []);
        } catch (error) {
            setJobsError(error.message || 'Unable to load your jobs.');
        } finally {
            setJobsLoading(false);
        }
    };

    const handleJobInputChange = (e) => {
        const { name, value } = e.target;

        setJobForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchDashboardStats = async () => {
        const token = localStorage.getItem('smartats_token');

        if (!token) {
            setStatsLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/recruiter/dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to fetch dashboard statistics.'
                );
            }

            setDashboardStats(data.dashboard);
        } catch (error) {
            console.error('Dashboard stats error:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchRecentApplications = async () => {
        const token = localStorage.getItem('smartats_token');

        if (!token) {
            setApplicationsError('Session expired. Please log in again.');
            setApplicationsLoading(false);
            return;
        }

        setApplicationsLoading(true);
        setApplicationsError('');

        try {
            const response = await fetch(
                `${API_URL}/api/recruiter/recent-applications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to fetch recent applications.'
                );
            }

            setRecentApplications(data.applications || []);
        } catch (error) {
            console.error('Recent applications error:', error);
            setApplicationsError(
                error.message || 'Unable to load recent applications.'
            );
        } finally {
            setApplicationsLoading(false);
        }
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        setJobMessage('');

        const minSalary = Number(jobForm.salary_min);
        const maxSalary = Number(jobForm.salary_max);

        if (
            jobForm.salary_min === '' ||
            jobForm.salary_max === '' ||
            minSalary < 0 ||
            maxSalary < minSalary
        ) {
            setJobMessage('Please enter valid salary range');
            return;
        }
        const token = localStorage.getItem('smartats_token');

        if (!token) {
            setJobMessage('Session expired! Please log in again');
            return;
        }

        setSubmitting(true);

        try {
            const isEditing = Boolean(editingJob);
            const url = isEditing ?
                `${API_URL}/api/jobs/${editingJob.id}` : `${API_URL}/api/jobs`;

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...jobForm,
                    salary_min: minSalary,
                    salary_max: maxSalary
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || (isEditing ? 'Failed to update job.' : 'Failed to create the job.')
                );
            }

            setJobMessage(isEditing ? 'Job updated successfully 🎉' : 'Job created successfully 🎉');

            setJobForm({
                title: '',
                company: '',
                location: '',
                job_type: '',
                salary_min: '',
                salary_max: '',
                skills: '',
                experience_required: '',
                description: ''
            });

            setEditingJob(null);
            setShowJobForm(false);

            await fetchMyJobs();
        } catch (error) {
            console.error('Save job error:', error);
            setJobMessage(
                error.message || 'Unable to connect to the server.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteJob = async (job) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${job.title}"?`
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem('smartats_token');

            const response = await fetch(
                `${API_URL}/api/jobs/${job.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete job.');
            }

            setJobMessage('Job deleted successfully!');

            await fetchMyJobs();
        } catch (error) {
            console.error('Delete job error:', error);
            setJobMessage(error.message || 'Failed to delete job.');
        }
    };

    if (!user) {
        return null;
    }

    const filteredApplications = recentApplications.filter((application) => {
        const searchTerm = applicantSearch.toLowerCase().trim();

        const matchesSearch =
            (application.candidate_name || '').toLowerCase().includes(searchTerm) ||
            (application.candidate_email || '').toLowerCase().includes(searchTerm) ||
            (application.job_title || '').toLowerCase().includes(searchTerm);

        const matchesStatus =
            applicationStatusFilter === 'all' ||
            (application.status || 'applied').toLowerCase() === applicationStatusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <main className="recruiter-dashboard">
            <aside className="recruiter-sidebar">
                <div className="recruiter-brand">
                    <div className="recruiter-brand-icon">
                        <FontAwesomeIcon icon={faUserTie} />
                    </div>

                    <span>SmartATS</span>
                </div>

                <p className="recruiter-sidebar-label">WORKSPACE</p>

                <button className="recruiter-sidebar-link active" type="button">
                    <FontAwesomeIcon icon={faBriefcase} />
                    Dashboard
                </button>

                <div className="recruiter-sidebar-bottom">
                    <div className="recruiter-user">
                        <div className="recruiter-avatar">
                            {user.name?.charAt(0).toUpperCase() || 'R'}
                        </div>

                        <div>
                            <strong>{user.name}</strong>
                            <span>Recruiter</span>
                        </div>
                    </div>

                    <button
                        className="recruiter-logout"
                        type="button"
                        onClick={handleLogout}
                    >
                        <FontAwesomeIcon icon={faArrowRightFromBracket} />
                        Logout
                    </button>
                </div>
            </aside>

            <section className="recruiter-main">
                <header className="recruiter-topbar">
                    <div>
                        <span className="recruiter-eyebrow">
                            RECRUITER WORKSPACE
                        </span>

                        <h1>Dashboard</h1>
                    </div>

                    <div className="recruiter-profile">
                        <div className="recruiter-avatar">
                            {user.name?.charAt(0).toUpperCase() || 'R'}
                        </div>

                        <div>
                            <strong>{user.name}</strong>
                            <span>Recruiter Account</span>
                        </div>
                    </div>
                </header>

                <section className="recruiter-welcome">
                    <span>YOUR HIRING WORKSPACE</span>

                    <h2>Welcome back, {user.name?.split(' ')[0]}! 👋</h2>

                    <p>
                        Find exceptional talent and build your dream team
                        with SmartATS.
                    </p>

                    <button
                        className="recruiter-post-button"
                        type="button"
                        onClick={() => setShowJobForm(true)}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Post a Job
                    </button>
                </section>

                <section className="recruiter-stats">
                    <article className="recruiter-stat-card">
                        <div className="recruiter-stat-icon purple">
                            <FontAwesomeIcon icon={faBriefcase} />
                        </div>

                        <div>
                            <span>Total Jobs</span>
                            <h3>{jobsLoading ? '...' : jobs.length}</h3>
                            <p>Jobs you've posted</p>
                        </div>
                    </article>

                    <article className="recruiter-stat-card">
                        <div className="recruiter-stat-icon blue">
                            <FontAwesomeIcon icon={faUsers} />
                        </div>

                        <div>
                            <span>Total Applicants</span>

                            <h3>
                                {statsLoading
                                    ? '...'
                                    : dashboardStats?.total_applications ?? 0}
                            </h3>

                            <p>Applications received</p>
                        </div>
                    </article>

                    <article className="recruiter-stat-card">
                        <div className="recruiter-stat-icon pink">
                            <FontAwesomeIcon icon={faBriefcase} />
                        </div>

                        <div>
                            <span>Active Jobs</span>
                            <h3>
                                {jobsLoading
                                    ? '...'
                                    : jobs.filter(
                                        (job) => String(job.status).toLowerCase() === 'active'
                                    ).length}
                            </h3>
                            <p>Currently accepting applications</p>
                        </div>
                    </article>
                </section>

                {
                    showJobForm && (
                        <section className="recruiter-job-form-section" id="recruiter-job-form">
                            <div className="recruiter-job-form-header">
                                <div>
                                    <span className="recruiter-eyebrow">
                                        NEW OPPORTUNITY
                                    </span>
                                    <h2>Post a job</h2>
                                    <p>
                                        Fill the details to create a job for listing.
                                    </p>
                                </div>
                                <button type="button" onClick={() => setShowJobForm(false)}>
                                    Cancel
                                </button>
                            </div>
                            <form className="recruiter-job-form" onSubmit={handleJobSubmit}>
                                <label>
                                    Job Title
                                    <input type="text" name="title" value={jobForm.title} onChange={handleJobInputChange} placeholder="Frontend Developer" required />
                                </label>
                                <label>
                                    Company Name
                                    <input type="text" name="company" value={jobForm.company} onChange={handleJobInputChange} placeholder="Enter the company name" required />
                                </label>
                                <label>
                                    Location
                                    <input type="text" name="location" value={jobForm.location} onChange={handleJobInputChange} placeholder="e.g. Bhadrak / remote" />
                                </label>
                                <label>
                                    Job Type
                                    <select defaultValue="" name="job_type" value={jobForm.job_type} onChange={handleJobInputChange} required>
                                        <option value="" disabled> Select Job Type</option>
                                        <option value="Full-time">Full Time</option>
                                        <option value="Part-time">Part Time</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </label>
                                <div className="recruiter-salary-field">
                                    <label>
                                        Minimum Salary
                                        <input type="number" min="0" name="salary_min" value={jobForm.salary_min} onChange={handleJobInputChange} placeholder="e.g. 2 million USD" required />
                                    </label>
                                    <label>
                                        Maximum Salary
                                        <input type="number" min="0" name="salary_max" value={jobForm.salary_max} onChange={handleJobInputChange} placeholder="e.g. 4.5 trillion USD" required />
                                    </label>
                                </div>
                                <label>
                                    Required Skills
                                    <input type="text" name="skills" value={jobForm.skills} onChange={handleJobInputChange} placeholder="React, JavaScript, CSS" />
                                </label>
                                <label>
                                    Experience Required
                                    <input type="text" name="experience_required" value={jobForm.experience_required} onChange={handleJobInputChange} placeholder="Fresher or 1-2 year experienced" required />
                                </label>
                                <label>
                                    Job Description
                                    <textarea rows="5" name="description" value={jobForm.description} onChange={handleJobInputChange} placeholder="Enter the job description..." required />
                                </label>
                                {jobMessage && (
                                    <p role="status" aria-live="polite">
                                        {jobMessage}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    className="recruiter-post-button"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Posting Job...' : 'Publish Job'}
                                </button>
                            </form>
                        </section>
                    )}

                <section className="recruiter-applications-section">
                    <div className="recruiter-application-header">
                        <div>
                            <span className="recruiter-eyebrow">
                                CANDIDATE ACTIVITY
                            </span>
                            <h2>Recent Applicants</h2>
                            <p>Keep tracking of candidates applying to your jobs.</p>
                        </div>
                        <div className="recruiter-application-controls">

                            <select
                                className="recruiter-application-filter"
                                value={applicationStatusFilter}
                                onChange={(e) => setApplicationStatusFilter(e.target.value)}
                                aria-label="Filter applications by status"
                            >
                                <option value="all">All Applications</option>
                                <option value="applied">Applied</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="interviewed">Interviewed</option>
                                <option value="selected">Selected</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <input
                                type="search"
                                className="recruiter-applicant-search"
                                placeholder="Search name, email, or job..."
                                value={applicantSearch}
                                onChange={(e) => setApplicantSearch(e.target.value)}
                                aria-label="Search applicants"
                            />

                            <span className="recruiter-application-count">
                                {filteredApplications.length} applications
                            </span>

                        </div>
                    </div>
                    {applicationsLoading ? (
                        <p className="recruiter-applications-message">
                            Loading recent Applications....
                        </p>
                    ) : applicationsError ? (
                        <p className="recruiter-application-error" role="alert">
                            {applicationsError}
                        </p>
                    ) : recentApplications.length === 0 ? (
                        <div className="recruiter-applications empty">
                            <FontAwesomeIcon icon={faUsers} />
                            <h3>No applications yet</h3>
                            <p>
                                Applications by the candidates will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="recruiter-applications-table-wrapper">
                            <table className="recruiter-application-table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Applied for</th>
                                        <th>Applied Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map((application) => (
                                        <tr
                                            key={application.id}
                                            className="recruiter-application-row"
                                            onClick={() =>
                                                navigate(`/recruiter-dashboard/applications/${application.id}`)
                                            }
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>
                                                <div className="recruiter-candidate-info">
                                                    <div className="recruiter-candidate-avatar">
                                                        {application.candidate_name?.charAt(0).toUpperCase() || 'C'}
                                                    </div>
                                                    <div>
                                                        <strong>
                                                            {application.candidate_name || 'Unknown candidate'}
                                                        </strong>
                                                        <span>
                                                            {application.candidate_email || 'No email available'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="recruiter-applied-job">
                                                    <strong>
                                                        {application.job_title || 'Unknown Job'}
                                                    </strong>
                                                    <span>
                                                        {application.company_name || 'Company not specified'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {application.applied_at
                                                    ? new Date(application.applied_at).toLocaleDateString(
                                                        'en-IN',
                                                        {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        }
                                                    )
                                                    : 'Date unavailable'}
                                            </td>
                                            <td>
                                                <span
                                                    className={`recruiter-application-status ${String(application.status || 'applied')
                                                        .toLowerCase()
                                                        .replace(/\s+/g, '-')}`}
                                                >
                                                    {(application.status || 'applied')
                                                        .replace(/[_-]/g, ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="recruiter-jobs-section">
                    <div className="recruiter-jobs-header">
                        <div>
                            <span className="recruiter-eyebrow">
                                HIRING MANAGEMENT
                            </span>
                            <h2>Manage your jobs</h2>
                            <p>Your posted jobs and applicant management</p>
                        </div>
                        <span className="recruiter-jobs-count">
                            {jobs.length} jobs
                        </span>
                    </div>
                    {jobsLoading ? (
                        <p>Loading your jobs...</p>
                    ) : jobsError ? (
                        <p role="alert">{jobsError}</p>
                    ) : jobs.length === 0 ? (
                        <div className="recruiter-empty-jobs">
                            <FontAwesomeIcon icon={faBriefcase} />
                            <h3>No job posted yet</h3>
                            <p>Click "Post a job" to publish your 1st opportunity.</p>
                        </div>
                    ) : (
                        <div className="recruiter-job-list">
                            {jobs.map((job) => (
                                <article className="recruiter-job-card" key={job.id}>
                                    <div className="recruiter-job-card-top">
                                        <div className="recruiter-job-card-icon">
                                            <FontAwesomeIcon icon={faBriefcase} />
                                        </div>

                                        <div className="recruiter-job-card-actions">
                                            <span
                                                className={`recruiter-job-status ${String(job.status).toLowerCase() === 'active'
                                                    ? 'active'
                                                    : 'inactive'
                                                    }`}
                                            >
                                                {job.status || 'Unknown'}
                                            </span>

                                            <div className="recruiter-job-menu-wrapper">
                                                <button
                                                    type="button"
                                                    className="recruiter-job-menu-button"
                                                    aria-label="Job options"
                                                    aria-expanded={openJobMenu === job.id}
                                                    onClick={() =>
                                                        setOpenJobMenu(
                                                            openJobMenu === job.id ? null : job.id
                                                        )
                                                    }
                                                >
                                                    <FontAwesomeIcon icon={faEllipsisVertical} />
                                                </button>

                                                {openJobMenu === job.id && (
                                                    <div className="recruiter-job-menu">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingJob(job);
                                                                setJobForm({
                                                                    title: job.title || '',
                                                                    company: job.company || '',
                                                                    location: job.location || '',
                                                                    job_type: job.job_type || '',
                                                                    salary_min: job.salary_min ?? '',
                                                                    salary_max: job.salary_max ?? '',
                                                                    skills: job.skills || '',
                                                                    experience_required: job.experience_required || '',
                                                                    description: job.description || ''
                                                                });
                                                                setShowJobForm(true);
                                                                setOpenJobMenu(null);
                                                                setTimeout(() => {
                                                                    const form = document.getElementById('recruiter-job-form');
                                                                    if (form) {
                                                                        form.scrollIntoView({
                                                                            behavior: 'smooth',
                                                                            block: 'start'
                                                                        });
                                                                        form.classList.remove('edit-form-highlight');
                                                                        void form.offsetWidth;
                                                                        form.classList.add('edit-form-highlight');
                                                                        setTimeout(() => {
                                                                            form.classList.remove('edit-form-highlight');
                                                                        }, 1800);
                                                                    }
                                                                }, 100);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPenToSquare} />
                                                            Edit Job
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="delete"
                                                            onClick={() => {
                                                                setOpenJobMenu(null);
                                                                handleDeleteJob(job);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                            Delete Job
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <h3>{job.title}</h3>
                                    <p className="recruiter-job-company">
                                        {job.company}
                                    </p>
                                    <div className="recruiter-job-details">
                                        <span> 📍 {job.location || 'Location not specified'}</span>
                                        <span>💼 {job.job_type || 'Job type is not specified'}</span>
                                        <span>
                                            💰 {job.salary_min || '-'} - {job.salary_max || '-'}
                                        </span>
                                    </div>
                                    <div className="recruiter-job-card-footer">
                                        <span>
                                            Experience: {job.experience_required || 'Not specified'}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </main >
    );
}

export default RecruiterDashboard;