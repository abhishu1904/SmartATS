import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie } from "@fortawesome/free-solid-svg-icons";

import "./App.css";

const API_URL = "http://localhost:5000/api/auth";

function ResetPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    newPassword,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Password reset failed.");
            }

            setSuccess("Password reset successfully! Redirecting to login...");

            setTimeout(() => {
                navigate("/");
            }, 1800);

        } catch (err) {
            setError(
                err instanceof TypeError
                    ? "Unable to connect to the server. Please try again."
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="reset-password-page">
            <section className="reset-password-card">
                <div className="reset-password-content">
                    <div className="mobile-brand">
                        <div className="brand-icon">
                            <FontAwesomeIcon icon={faUserTie} />
                        </div>
                        <span>SmartATS</span>
                    </div>

                    <div className="form-wrapper">
                        <div className="welcome-label">
                            ACCOUNT RECOVERY
                        </div>

                        <h2>Reset your password</h2>

                        <p className="form-subtitle">
                            Enter your registered email and create a new password.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <label htmlFor="reset-email">
                                Email address
                            </label>

                            <input
                                id="reset-email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />

                            <label htmlFor="new-password">
                                New password
                            </label>

                            <div className="password-wrapper">
                                <input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    minLength={8}
                                    required
                                />

                                <button
                                    type="button"
                                    className="show-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <label htmlFor="confirm-password">
                                Confirm new password
                            </label>

                            <input
                                id="confirm-password"
                                type="password"
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                minLength={8}
                                required
                            />

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
                                {loading ? "Resetting password..." : "Reset Password"}
                                {!loading && <span>→</span>}
                            </button>
                        </form>

                        <div className="register-prompt">
                            Remember your password?{" "}
                            <Link to="/">Back to Sign in</Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default ResetPassword;