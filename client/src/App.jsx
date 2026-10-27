import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import CandidateDashboard from './pages/candidateDashboard';
import RecruiterDashboard from './pages/recruiterDashboard';
import ApplicationDetails from "./pages/applicationDetails";
import Register from './pages/register';
import ViewProfile from './pages/ViewProfile';
import ResetPassword from './ResetPassword';
import CandidateProfile from "./CandidateProfile";

import './App.css';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function App() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      if (data.user.role !== role) {
        throw new Error(
          `This account is registered as a ${data.user.role}. Please select ${data.user.role} to continue.`
        );
      }

      localStorage.setItem('smartats_token', data.token);
      localStorage.setItem('smartats_user', JSON.stringify(data.user));

      setSuccess(`Welcome back, ${data.user.name}!`);

      if (data.user.role === 'candidate') {
        navigate('/candidate-dashboard');
      } else if (data.user.role === 'recruiter') {
        navigate('/recruiter-dashboard');
      }

      // Dashboard navigation will be implemented in the next step.
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
    <main className="login-page">
      <section className="login-container">
        <div className="login-left">
          <div className="brand">
            <div className="brand-icon">
              <FontAwesomeIcon icon={faUserTie} />
            </div>
            <span>SmartATS</span>
          </div>

          <div className="hero-content">
            <span className="eyebrow">SMARTER HIRING STARTS HERE</span>

            <h1>
              Find the right talent.
              <br />
              <span>Build the future.</span>
            </h1>

            <p>
              A smarter way to connect great talents with great
              opportunities. Manage recruitments, track applications, make
              better hiring decisions.
            </p>

            <div className="feature-list">
              <div className="feature">
                <span>ꪜ</span>
                Streamlined recruitment workflow
              </div>

              <div className="feature">
                <span>ꪜ</span>
                Intelligent application tracking
              </div>

              <div className="feature">
                <span>ꪜ</span>
                One platform for candidates and recruiters
              </div>
            </div>
          </div>

          <div className="left-footer">
            © 2026 SmartATS. All rights reserved.
          </div>
        </div>

        <div className="login-right">
          <div className="mobile-brand">
            <div className="brand-icon">
              <FontAwesomeIcon icon={faUserTie} />
            </div>
            <span>SmartATS</span>
          </div>

          <div className="form-wrapper">
            <div className="welcome-label">Welcome to SmartATS</div>

            <h2>Sign in to your account</h2>

            <p className="form-subtitle">
              Please enter your details to continue to SmartATS.
            </p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="role">I want to sign in as</label>

              <div className="role-selector">
                <button
                  type="button"
                  className={role === 'candidate' ? 'role active' : 'role'}
                  onClick={() => {
                    setRole('candidate');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Candidate
                </button>

                <button
                  type="button"
                  className={role === 'recruiter' ? 'role active' : 'role'}
                  onClick={() => {
                    setRole('recruiter');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Recruiter
                </button>
              </div>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <div className="password-label">
                <label htmlFor="password">Password</label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot Password?
                </button>
              </div>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter the password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {error && (
                <div className="login-message error" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="login-message success" role="status">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="sign-in-button"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in to SmartATS'}
                {!loading && <span>→</span>}
              </button>
            </form>

            <div className="register-prompt">
              New to SmartATS?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
              >
                Create an account
              </button>
            </div>

            <div className="security-note">
              <span>◆︎</span>
              Your precious information will stay protected.
            </div>
          </div>

          <div className="right-footer">
            <span>Privacy</span>
            <span>Help &amp; Support</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/candidate-dashboard"
          element={<CandidateDashboard />}
        />

        <Route
          path="/recruiter-dashboard"
          element={<RecruiterDashboard />}
        />

        <Route
          path="/recruiter-dashboard/applications/:applicationId"
          element={<ApplicationDetails />}
        />

        <Route
          path="/candidate-profile"
          element={<CandidateProfile />}
        />

        <Route
          path="/view-profile"
          element={<ViewProfile />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;