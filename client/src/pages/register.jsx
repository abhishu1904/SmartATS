import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link } from "react-router-dom";
import "./register.css"

const API_URL = 'http://localhost:5000/api/auth';

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Candidate');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must contain at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                    role,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new error(
                    data.messsage || 'Registration failed! please try again later.'
                )
            }

            setSuccess('Account Created successfully! Redirecting to login page');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            setError(
                err instanceof TypeError
                    ? 'Unable to connect to the server. Make sure your backend is running.'
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="register-page">
            <section className="register-card">
                <Link to="/" className="register-brand" >
                    <span className="register-brand-icon">
                        <FontAwesomeIcon icon={faUserTie} />
                    </span>
                    <span>SmartATS</span>
                </Link>
                <div className="register-heading">
                    <span className="register-eyebrow">
                        YOUR NEXT CHAPTER STARTS HERE.
                    </span>
                    <h1>Create your account.</h1>
                    <p>Join SmartATS and discover smarter way to connect your talent with opportunities.</p>
                </div>
                <form onSubmit={handleSubmit} className="register-form">
                    <label htmlFor="register-name">Full Name</label>
                    <input id="register-name" type="text" placeholder="Enter your full name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
                    <label htmlFor="register-email">Email</label>
                    <input
                        id="register-email"
                        type="email"
                        placeholder="you@exam[le.com"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                    <label>I want to register as</label>
                    <div className="register-role-selector">
                        <button
                            type="butoon"
                            className={role === 'candidate' ? 'register-role active' : 'register-role'}
                            onClick={() => setRole('candidate')}
                        >
                            Candidate
                        </button>
                        <button
                            type="button"
                            className={role === 'recruiter' ? 'register-role active' : 'register-role'}
                            onClick={() => setRole('recruiter')}
                        >
                            Recruiter
                        </button>
                    </div>
                    <label htmlFor="register-password">Password</label>

                    <div className="register-password-wrapper">
                        <input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <label htmlFor="register-confirm-password">
                        Confirm Password
                    </label>

                    <div className="register-password-wrapper">
                        <input
                            id="register-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                        />

                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {error && (
                        <div className="register-message error" role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="register-message success" role="status">
                            {success}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="register-submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                        {!loading && <span>→</span>}
                    </button>
                </form>
                <div className="register-login-prompt">
                    Already have an account? <Link to="/">Sign in</Link>
                </div>
                <div className="register-security-note">
                    ◆ Your information stays protected.
                </div>
            </section>
        </main>
    )
}

export default Register;