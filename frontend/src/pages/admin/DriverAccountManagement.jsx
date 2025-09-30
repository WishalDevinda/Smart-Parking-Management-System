import React, { useState, useEffect } from 'react';
import { driverAPI, reservationAPI } from '../../services/api';

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

const DriverAccountManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    driverId: '',
    name: '',
    email: '',
    nic: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [driverContactMap, setDriverContactMap] = useState({});
  const [contactOverrides, setContactOverrides] = useState({});

  useEffect(() => {
    fetchDrivers();
    fetchDriverContacts();
    try {
      const stored = localStorage.getItem('driverContactOverrides');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setContactOverrides(parsed);
          setDriverContactMap(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch (_) {}
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await driverAPI.getAllDrivers();
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setMessage({ type: 'error', text: 'Error fetching drivers' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverContacts = async () => {
    try {
      const response = await reservationAPI.getAllReservations();
      const reservations = Array.isArray(response.data) ? response.data : [];
      const latestByDriver = {};
      const contactMap = {};
      reservations.forEach((r) => {
        const key = typeof r.driverId === 'object' ? (r.driverId?._id || r.driverId) : r.driverId;
        if (!key) return;
        const rDate = r.reservedDate ? new Date(r.reservedDate).getTime() : 0;
        const prevDate = latestByDriver[key] ?? -1;
        if (r.contactNumber && rDate >= prevDate) {
          latestByDriver[key] = rDate;
          contactMap[key] = r.contactNumber;
        }
      });
      setDriverContactMap({ ...contactMap, ...contactOverrides });
    } catch (error) {
      // ignore
    }
  };

  const saveContactOverride = (driverKey, value) => {
    if (!driverKey) return;
    const updated = { ...contactOverrides, [driverKey]: value };
    setContactOverrides(updated);
    try {
      localStorage.setItem('driverContactOverrides', JSON.stringify(updated));
    } catch (_) {}
    setDriverContactMap(prev => ({ ...prev, [driverKey]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (editingDriver) {
        // Update driver (exclude password and driverId from updates)
        const { password, driverId, ...updateData } = formData;
        await driverAPI.updateDriver(editingDriver._id, updateData);
        setMessage({ type: 'success', text: 'Driver updated successfully!' });
        if (typeof formData.contactNumber === 'string') {
          saveContactOverride(editingDriver._id, formData.contactNumber.trim());
        }
      } else {
        // Create new driver
        await driverAPI.createDriver(formData);
        setMessage({ type: 'success', text: 'Driver created successfully!' });
      }

      // Reset form and refresh data
      setFormData({ driverId: '', name: '', email: '', nic: '', password: '' });
      setShowForm(false);
      setEditingDriver(null);
      fetchDrivers();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || `Error ${editingDriver ? 'updating' : 'creating'} driver` 
      });
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      driverId: driver.driverId,
      name: driver.name,
      email: driver.email,
      nic: driver.nic,
      password: '', // Don't populate password for editing
      contactNumber: driverContactMap[driver._id] || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (driverId, driverName) => {
    if (window.confirm(`Are you sure you want to delete driver ${driverName}?`)) {
      try {
        await driverAPI.deleteDriver(driverId);
        setMessage({ type: 'success', text: 'Driver deleted successfully!' });
        fetchDrivers();
      } catch (error) {
        // Fallback: try by driverId field if _id didn't match a document
        if (error.response?.status === 404) {
          try {
            await driverAPI.deleteDriver(driverName); // this is incorrect placeholder, replaced below
          } catch (e) {}
        }
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Error deleting driver' 
        });
      }
    }
  };

  const handleDeleteSafe = async (driver) => {
    if (!driver) return;
    if (window.confirm(`Are you sure you want to delete driver ${driver.name}?`)) {
      try {
        await driverAPI.deleteDriver(driver._id);
        setMessage({ type: 'success', text: 'Driver deleted successfully!' });
        fetchDrivers();
      } catch (error) {
        if (error.response?.status === 404 && driver.driverId) {
          try {
            await driverAPI.deleteDriver(driver.driverId);
            setMessage({ type: 'success', text: 'Driver deleted successfully!' });
            fetchDrivers();
            return;
          } catch (e) {
            setMessage({ 
              type: 'error', 
              text: e.response?.data?.message || 'Error deleting driver' 
            });
            return;
          }
        }
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Error deleting driver' 
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({ driverId: '', name: '', email: '', nic: '', password: '', contactNumber: '' });
    setShowForm(false);
    setEditingDriver(null);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        fontSize: '1.2rem',
        color: colors.darkGray
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            border: `3px solid ${colors.blue}`,
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Loading drivers...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      background: '#F1C28C',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.orange}, ${colors.yellow})`,
        padding: '2rem',
        borderRadius: '15px',
        marginBottom: '2rem',
        color: colors.white,
        boxShadow: '0 8px 25px rgba(241, 161, 0, 0.2)'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>
          Driver Account Management
        </h1>
        <p style={{
          margin: 0,
          fontSize: '1.1rem',
          opacity: 0.9
        }}>
          Manage driver accounts and permissions
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div style={{
          background: message.type === 'error' ? `${colors.red}10` : `${colors.green}10`,
          border: `1px solid ${message.type === 'error' ? colors.red : colors.green}`,
          color: message.type === 'error' ? colors.red : colors.green,
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          fontSize: '0.95rem',
          fontWeight: '500'
        }}>
          {message.text}
        </div>
      )}

      {/* Add New Driver Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setShowForm(true)}
          disabled={showForm}
          style={{
            background: showForm ? '#E1E5E9' : `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
            color: colors.white,
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: showForm ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: showForm ? 'none' : '0 8px 25px rgba(0, 116, 213, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (!showForm) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 35px rgba(0, 116, 213, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!showForm) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 116, 213, 0.3)';
            }
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>+</span>
          Add New Driver
        </button>
      </div>

      {/* Driver Form */}
      {showForm && (
        <div style={{
          background: colors.white,
          borderRadius: '15px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          border: `1px solid #F1A10055`
        }}>
          <h3 style={{
            marginBottom: '1.5rem',
            color: colors.darkGray,
            fontSize: '1.8rem',
            fontWeight: 'bold'
          }}>
            {editingDriver ? 'Update Driver' : 'Add New Driver'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: colors.darkGray,
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  Driver ID
                </label>
                <input
                  type="text"
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleInputChange}
                  required
                  disabled={editingDriver}
                  placeholder="Enter driver ID"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #F1A10055',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    backgroundColor: editingDriver ? '#f5f5f5' : colors.white
                  }}
                  onFocus={(e) => {
                    if (!editingDriver) {
                      e.target.style.borderColor = colors.yellow;
                      e.target.style.boxShadow = `0 0 0 3px ${colors.yellow}20`;
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#F1A10055';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
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
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #F1A10055',
                    borderRadius: '8px',
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
                    e.target.style.borderColor = '#F1A10055';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: colors.darkGray,
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #F1A10055',
                    borderRadius: '8px',
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
                    e.target.style.borderColor = '#F1A10055';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
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
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter NIC number"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #F1A10055',
                    borderRadius: '8px',
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
                    e.target.style.borderColor = '#F1A10055';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {editingDriver && (
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: colors.darkGray,
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber || ''}
                    onChange={handleInputChange}
                    placeholder="Enter contact number"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #F1A10055',
                      borderRadius: '8px',
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
                      e.target.style.borderColor = '#F1A10055';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}

              {!editingDriver && (
                <div>
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
                    onChange={handleInputChange}
                    required
                    placeholder="Enter password"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #E1E5E9',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      backgroundColor: colors.white
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.blue;
                      e.target.style.boxShadow = `0 0 0 3px ${colors.blue}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E1E5E9';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  background: `linear-gradient(135deg, ${colors.green}, ${colors.blue})`,
                  color: colors.white,
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(6, 155, 71, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(6, 155, 71, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(6, 155, 71, 0.3)';
                }}
              >
                {editingDriver ? 'Update Driver' : 'Add Driver'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: colors.red,
                  color: colors.white,
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(200, 3, 6, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(200, 3, 6, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(200, 3, 6, 0.3)';
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drivers Table */}
      <div style={{
        background: colors.white,
        borderRadius: '15px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
        border: `1px solid #E1E5E9`
      }}>
        <h3 style={{
          marginBottom: '1.5rem',
          color: colors.darkGray,
          fontSize: '1.8rem',
          fontWeight: 'bold'
        }}>
          Registered Drivers ({drivers.length})
        </h3>

        {drivers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: colors.darkGray,
            fontSize: '1.1rem',
            opacity: 0.7
          }}>
            No drivers registered yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.95rem'
            }}>
              <thead>
                <tr style={{
                  background: `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
                  color: colors.white
                }}>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    Driver ID
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    Name
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    Email
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    NIC
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    Contact Number
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    Registration Date
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver, index) => (
                  <tr key={driver._id} style={{
                    background: index % 2 === 0 ? colors.white : '#f8f9fa',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.parentElement.style.backgroundColor = '#f0f8ff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.parentElement.style.backgroundColor = index % 2 === 0 ? colors.white : '#f8f9fa';
                  }}
                  >
                    <td style={{
                      padding: '1rem',
                      fontWeight: 'bold',
                      color: colors.blue,
                      borderBottom: '1px solid #E1E5E9'
                    }}>
                      {driver.driverId}
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: colors.darkGray,
                      borderBottom: '1px solid #E1E5E9'
                    }}>
                      {driver.name}
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: colors.darkGray,
                      borderBottom: '1px solid #E1E5E9'
                    }}>
                      {driver.email}
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: colors.darkGray,
                      borderBottom: '1px solid #E1E5E9'
                    }}>
                      {driver.nic}
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: colors.darkGray,
                      borderBottom: '1px solid #E1E5E9'
                    }}>
                      {driverContactMap[driver._id] || '—'}
                    </td>
                    <td style={{
                      padding: '1rem',
                      color: colors.darkGray,
                      borderBottom: '1px solid #E1E5E9'
                    }}>
                      {new Date(driver.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{
                      padding: '1rem',
                      borderBottom: '1px solid #E1E5E9'
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(driver)}
                          style={{
                            background: colors.orange,
                            color: colors.white,
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(193, 109, 0, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(193, 109, 0, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(193, 109, 0, 0.3)';
                          }}
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteSafe(driver)}
                          style={{
                            background: colors.red,
                            color: colors.white,
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(200, 3, 6, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(200, 3, 6, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(200, 3, 6, 0.3)';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div style={{
        background: colors.white,
        borderRadius: '15px',
        padding: '2rem',
        marginTop: '2rem',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
        border: `1px solid #E1E5E9`
      }}>
        <h3 style={{
          marginBottom: '1.5rem',
          color: colors.darkGray,
          fontSize: '1.8rem',
          fontWeight: 'bold'
        }}>
          Statistics
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
            color: colors.white,
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(0, 116, 213, 0.3)'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              {drivers.length}
            </div>
            <div style={{
              fontSize: '1rem',
              opacity: 0.9
            }}>
              Total Drivers
            </div>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${colors.green}, ${colors.blue})`,
            color: colors.white,
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(6, 155, 71, 0.3)'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              {drivers.filter(d => 
                new Date(d.createdAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <div style={{
              fontSize: '1rem',
              opacity: 0.9
            }}>
              Registered Today
            </div>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${colors.orange}, ${colors.yellow})`,
            color: colors.white,
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(193, 109, 0, 0.3)'
          }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              {drivers.filter(d => 
                new Date(d.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <div style={{
              fontSize: '1rem',
              opacity: 0.9
            }}>
              This Week
            </div>
          </div>
        </div>
      </div>

             {/* CSS Animation */}
       <style>{`
         @keyframes spin {
           0% { transform: rotate(0deg); }
           100% { transform: rotate(360deg); }
         }
       `}</style>
     </div>
   );
 };

export default DriverAccountManagement;
