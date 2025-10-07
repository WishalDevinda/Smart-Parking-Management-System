import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors } from '../utils/helpers';

const Sidebar = ({ userType }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuItems = [
    { id: '/user/reservations', label: 'Reservation Portal', icon: '🅿️' },
    { id: '/user/tracking', label: 'Tracking Status', icon: '📍' },
  ];

  const adminMenuItems = [
    { id: '/admin/drivers', label: 'Driver Account Management', icon: '👥' },
    { id: '/admin/reservations', label: 'Reservation Management', icon: '📋' },
    { id: '/admin/tracking', label: 'Admin Tracking Status', icon: '📊' },
  ];

  const menuItems = userType === 'user' ? userMenuItems : adminMenuItems;

  return (
    <div className="sidebar" style={{ backgroundColor: colors.yellow }}>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: colors.white }}>
          {userType === 'user' ? 'User Menu' : 'Admin Menu'}
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li key={item.id} style={{ marginBottom: '0.5rem' }}>
              <button
                onClick={() => navigate(item.id)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: location.pathname === item.id ? colors.blue : 'transparent',
                  color: colors.white,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => {
                  if (location.pathname !== item.id) {
                    e.target.style.backgroundColor = colors.orange;
                  }
                }}
                onMouseOut={(e) => {
                  if (location.pathname !== item.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
