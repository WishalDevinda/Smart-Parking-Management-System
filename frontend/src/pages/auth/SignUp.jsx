import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverAPI } from '../../services/api';
import backgroundImage from '../../assets/background.jpg';

// Professional color scheme
const colors = {
  white: '#FFFFFF',
  cream: '#FBE1AD',
  blue: '#0074D5',
  green: '#069B47',
  red: '#C80306',
  darkGray: '#40403E',
  orange: '#C16D00',
  yellow: '#F1A100'
};

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    nicNumber: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateNIC = (nic) => {
    // Basic NIC validation for Sri Lankan NIC numbers
    // Old format: 9 digits + V (e.g., 123456789V)
    // New format: 12 digits (e.g., 123456789012)
    const oldFormat = /^[0-9]{9}[vVxX]$/;
    const newFormat = /^[0-9]{12}$/;
    return oldFormat.test(nic) || newFormat.test(nic);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.nicNumber.trim()) {
      newErrors.nicNumber = 'NIC number is required';
    } else if (!validateNIC(formData.nicNumber.trim())) {
      newErrors.nicNumber = 'Please enter a valid NIC number (e.g., 123456789V or 123456789012)';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate driver ID with auto-increment
  const generateDriverId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const number = Math.floor((timestamp % 100000) + random);
    return `DRV${number.toString().padStart(3, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Generate unique driver ID
      const driverId = generateDriverId();
      
      // Prepare driver data for API
      const driverData = {
        driverId: driverId,
        name: formData.fullName,
        email: formData.email,
        nic: formData.nicNumber,
        password: formData.password
      };

      // Call API to create driver
      await driverAPI.createDriver(driverData);
      
      // Handle successful registration
      alert(`Account created successfully! Your Driver ID is: ${driverId}. Please sign in.`);
      
      // Reset form
      setFormData({
        fullName: '',
        nicNumber: '',
        email: '',
        password: ''
      });
      
      // Navigate to sign in page
      navigate('/signin');
      
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: colors.white,
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '3rem',
        width: '100%',
        maxWidth: '500px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          background: colors.cream,
          borderRadius: '50%',
          opacity: 0.3
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '60px',
          height: '60px',
          background: colors.yellow,
          borderRadius: '50%',
          opacity: 0.2
        }}></div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            color: colors.darkGray,
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: '0 0 0.5rem 0',
            background: `linear-gradient(135deg, ${colors.orange}, ${colors.yellow})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Create Account
          </h1>
          <p style={{
            color: colors.darkGray,
            fontSize: '1.1rem',
            margin: 0,
            opacity: 0.8
          }}>
            Join our parking management system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          {errors.general && (
            <div style={{
              background: `${colors.red}10`,
              border: `1px solid ${colors.red}30`,
              color: colors.red,
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              {errors.general}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: colors.darkGray,
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${errors.fullName ? colors.red : '#F1A10055'}`,
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                backgroundColor: colors.white
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.yellow;
                e.target.style.boxShadow = `0 0 0 3px ${colors.yellow}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.fullName ? colors.red : '#F1A10055';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.fullName && (
              <span style={{
                color: colors.red,
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                display: 'block'
              }}>
                {errors.fullName}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: colors.darkGray,
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              NIC Number
            </label>
            <input
              type="text"
              name="nicNumber"
              value={formData.nicNumber}
              onChange={handleChange}
              required
              placeholder="Enter your NIC number (e.g., 123456789V)"
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${errors.nicNumber ? colors.red : '#F1A10055'}`,
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                backgroundColor: colors.white
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.yellow;
                e.target.style.boxShadow = `0 0 0 3px ${colors.yellow}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.nicNumber ? colors.red : '#F1A10055';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.nicNumber && (
              <span style={{
                color: colors.red,
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                display: 'block'
              }}>
                {errors.nicNumber}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: colors.darkGray,
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${errors.email ? colors.red : '#F1A10055'}`,
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                backgroundColor: colors.white
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.yellow;
                e.target.style.boxShadow = `0 0 0 3px ${colors.yellow}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.email ? colors.red : '#F1A10055';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.email && (
              <span style={{
                color: colors.red,
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                display: 'block'
              }}>
                {errors.email}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: colors.darkGray,
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${errors.password ? colors.red : '#F1A10055'}`,
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                backgroundColor: colors.white
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.yellow;
                e.target.style.boxShadow = `0 0 0 3px ${colors.yellow}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.password ? colors.red : '#F1A10055';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.password && (
              <span style={{
                color: colors.red,
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                display: 'block'
              }}>
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading ? '#F1A10055' : `linear-gradient(135deg, ${colors.orange}, ${colors.yellow})`,
              color: colors.white,
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 8px 25px rgba(241, 161, 0, 0.3)',
              marginBottom: '2rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(241, 161, 0, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(241, 161, 0, 0.3)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${colors.white}`,
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          borderTop: `1px solid #E1E5E9`,
          paddingTop: '2rem',
          position: 'relative',
          zIndex: 1
        }}>
          <p style={{
            color: colors.darkGray,
            margin: 0,
            fontSize: '1rem'
          }}>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/signin')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.orange,
                textDecoration: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = colors.yellow}
              onMouseLeave={(e) => e.target.style.color = colors.orange}
            >
              Sign In
            </button>
          </p>
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};



export default SignUp;
