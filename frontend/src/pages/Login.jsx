import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../api/axiosInstance';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.redirectTo || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('token', response.data.token);
        if (onLoginSuccess) {
          onLoginSuccess(response.data.user);
        }
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-split">
        {/* Left Visual Column */}
        <div className="auth-hero-side">
          <div className="auth-hero-overlay"></div>
          <div className="auth-hero-content">
            <Link to="/" className="auth-logo-badge">
              <span className="logo-icon">🏡</span>
              <span className="logo-name">Farm House</span>
            </Link>
            <h2>Welcome Back</h2>
            <p>Login to your account and continue exploring pristine farm houses across India.</p>

            <div className="auth-feature-list">
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Book Your Stay</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Manage Bookings</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Get Exclusive Offers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="auth-form-side">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>Login</h1>
              <p>Access your account to manage stays and favorites</p>
            </div>

            {error && <div className="auth-error-banner">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <div className="auth-options">
                <label className="remember-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); alert("Password reset link will be sent to your registered email."); }}>
                  Forgot Password?
                </a>
              </div>

              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading ? 'Logging in...' : (
                  <>
                    <span>Login</span>
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>

              <div className="auth-divider">
                <span>or continue with</span>
              </div>

              <div className="auth-social-buttons">
                <button
                  type="button"
                  className="social-btn google-btn"
                  onClick={() => alert("Google login integration will be linked to OAuth.")}
                >
                  <span className="social-icon">🔴</span>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  className="social-btn facebook-btn"
                  onClick={() => alert("Facebook login integration will be linked to OAuth.")}
                >
                  <span className="social-icon">🔵</span>
                  <span>Facebook</span>
                </button>
              </div>
            </form>

            <p className="auth-footer-link">
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
