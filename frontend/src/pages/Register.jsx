import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/axiosInstance';
import './Login.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-split">
        {/* Left Visual Column */}
        <div className="auth-hero-side signup-hero">
          <div className="auth-hero-overlay"></div>
          <div className="auth-hero-content">
            <Link to="/" className="auth-logo-badge">
              <span className="logo-icon">🏡</span>
              <span className="logo-name">Farm House</span>
            </Link>
            <h2>Join Our Community</h2>
            <p>Create your account and start your farm house journey across serene destinations.</p>

            <div className="auth-feature-list">
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Easy Bookings</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Exclusive Offers & Perks</span>
              </div>
              <div className="feature-item">
                <span className="check-icon">✓</span>
                <span>Personalized Concierge Experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="auth-form-side">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Sign up to get started booking dream farm stays</p>
            </div>

            {error && <div className="auth-error-banner">{error}</div>}
            {success && <div className="auth-success-banner">{success}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-row-auth">
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a password"
                  />
                </div>

                <div className="form-group">
                  <label>Account Type</label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="CUSTOMER">Guest / Customer</option>
                    <option value="OWNER">Farmhouse Owner</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-submit-btn">
                {loading ? 'Creating Account...' : (
                  <>
                    <span>Sign Up</span>
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
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
