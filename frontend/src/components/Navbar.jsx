import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../utils/helpers';
import logo from '../assets/logo.png';

const Navbar = ({ userType, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Clear JWT token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    navigate('/signin');
  };
  return (
    <nav className="navbar" style={{ backgroundColor: colors.orange }}>
      <div className="navbar-inner">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img src={logo} alt="Logo" style={{ height: '80px', width: 'auto', borderRadius: '1px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', marginLeft: '6rem' }}>
          {[
            { label: 'Dashboard', path: userType === 'admin' ? '/admin/drivers' : '/dashboard' },
            { label: 'Reservations', path: userType === 'admin' ? '/admin/reservations' : '/user/reservations' },
            // Show Drivers only for admins
            ...(userType === 'admin' ? [{ label: 'Drivers', path: '/admin/drivers' }] : []),
            { label: 'Tracking', path: userType === 'admin' ? '/admin/tracking' : '/user/tracking' },
          ].map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const baseStyle = {
              background: isActive ? 'rgba(255,255,255,0.22)' : 'transparent',
              color: colors.white,
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              transition: 'background-color 0.2s ease',
            };
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={baseStyle}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive ? 'rgba(255,255,255,0.22)' : 'transparent';
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div title="Profile" style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white }}>
            <span role="img" aria-label="profile">👤</span>
          </div>
          <span style={{ fontWeight: '600', color: colors.white, opacity: 0.95 }}>
            {userType === 'user' ? 'User Panel' : 'Admin Panel'}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: colors.red,
              color: colors.white,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
