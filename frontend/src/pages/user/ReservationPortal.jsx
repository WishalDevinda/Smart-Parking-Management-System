import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { reservationAPI, parkingSlotAPI, socket } from '../../services/api';

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

ChartJS.register(ArcElement, Tooltip, Legend);

const ReservationPortal = () => {
  const [formData, setFormData] = useState({
    driverId: '',
    parkingSlotId: '',
    entryTime: '',
    exitTime: '',
    date: new Date().toISOString().split('T')[0],
    contactNumber: '',
    vehicleNumber: '',
    vehicleType: '',
  });
  const [driverName, setDriverName] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotStats, setSlotStats] = useState({ totalSlots: 0, availableSlots: 0, reservedSlots: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Prefill driverId from logged-in user
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && user._id) {
          setFormData(prev => ({
            ...prev,
            driverId: user._id
          }));
          if (user.name) {
            setDriverName(user.name);
          }
        }
      }
    } catch (e) {
      // ignore JSON errors
    }
  }, []);

  const fetchAvailableSlots = useCallback(async () => {
    try {
      console.log('Fetching available slots...');
      const response = await parkingSlotAPI.getAvailableSlots();
      console.log('Available slots response:', response.data);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  }, []);

  const fetchSlotStatistics = useCallback(async () => {
    try {
      console.log('Fetching slot statistics...');
      const response = await parkingSlotAPI.getSlotStatistics();
      console.log('Slot statistics response:', response.data);
      setSlotStats(response.data);
    } catch (error) {
      console.error('Error fetching slot statistics:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAvailableSlots();
    fetchSlotStatistics();
  }, [fetchAvailableSlots, fetchSlotStatistics]);

  // Socket listeners for real-time updates
  useEffect(() => {
    console.log('Setting up socket listeners...');
    console.log('Socket connected:', socket.connected);
    
    const handleUpdate = () => {
      console.log('Socket event received - updating data');
      fetchAvailableSlots();
      fetchSlotStatistics();
    };
    
    const handleSlotUpdate = (data) => {
      console.log('Slot update received:', data);
      handleUpdate();
    };
    
    const handleReservationUpdate = (data) => {
      console.log('Reservation update received:', data);
      handleUpdate();
    };
    
    const handleConnect = () => {
      console.log('Socket connected!');
    };
    
    const handleDisconnect = () => {
      console.log('Socket disconnected!');
    };
    
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('slotUpdate', handleSlotUpdate);
    socket.on('reservationUpdate', handleReservationUpdate);
    
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('slotUpdate', handleSlotUpdate);
      socket.off('reservationUpdate', handleReservationUpdate);
    };
  }, [fetchAvailableSlots, fetchSlotStatistics]);

  // Fallback polling mechanism - refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Polling for updates...');
      fetchAvailableSlots();
      fetchSlotStatistics();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [fetchAvailableSlots, fetchSlotStatistics]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Combine date and time for entry and exit
      const entryDateTime = new Date(`${formData.date}T${formData.entryTime}`);
      const exitDateTime = new Date(`${formData.date}T${formData.exitTime}`);

      if (exitDateTime <= entryDateTime) {
        setMessage({ type: 'error', text: 'Exit time must be after entry time' });
        setLoading(false);
        return;
      }

      const reservationData = {
        driverId: formData.driverId,
        parkingSlotId: formData.parkingSlotId,
        entryTime: entryDateTime.toISOString(),
        exitTime: exitDateTime.toISOString(),
        contactNumber: formData.contactNumber,
        vehicleNumber: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
      };

      const response = await reservationAPI.createReservation(reservationData);
      
      setMessage({ 
        type: 'success', 
        text: `Reservation created successfully! Reservation ID: ${response.data.reservationId}` 
      });
      
      // Reset form
      setFormData(prev => ({
        driverId: prev.driverId, // preserve logged-in driver ID
        parkingSlotId: '',
        entryTime: '',
        exitTime: '',
        date: new Date().toISOString().split('T')[0],
        contactNumber: '',
        vehicleNumber: '',
        vehicleType: '',
      }));

      // Emit socket event for real-time update
      socket.emit('reservationUpdate', response.data);
      socket.emit('slotUpdate', { slotId: formData.parkingSlotId, isAvailable: false });

      // Refresh data
      fetchAvailableSlots();
      fetchSlotStatistics();
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error creating reservation' 
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Available Slots', 'Reserved Slots'],
    datasets: [
      {
        data: [slotStats.availableSlots, slotStats.reservedSlots],
        backgroundColor: [colors.green, colors.red],
        borderColor: [colors.green, colors.red],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = slotStats.totalSlots;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{
      padding: '2rem',
      background: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
        padding: '2rem',
        borderRadius: '15px',
        marginBottom: '2rem',
        color: colors.white,
        boxShadow: '0 8px 25px rgba(0, 116, 213, 0.2)'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>
          Reservation Portal
        </h1>
        <p style={{
          margin: 0,
          fontSize: '1.1rem',
          opacity: 0.9
        }}>
          Book your parking space with ease
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Reservation Form */}
        <div style={{
          background: colors.white,
          borderRadius: '15px',
          padding: '2rem',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          border: `1px solid #E1E5E9`
        }}>
          <h3 style={{
            marginBottom: '1.5rem',
            color: colors.darkGray,
            fontSize: '1.8rem',
            fontWeight: 'bold'
          }}>
            Make a Reservation
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: colors.darkGray,
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  Driver ID
                </label>
                {driverName && (
                  <span style={{
                    marginLeft: '1rem',
                    color: colors.darkGray,
                    fontSize: '0.9rem',
                    opacity: 0.8
                  }}>
                    Name: {driverName}
                  </span>
                )}
              </div>
              <input
                type="text"
                name="driverId"
                value={formData.driverId}
                onChange={handleInputChange}
                required
                placeholder="Enter your driver ID"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #E1E5E9',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  backgroundColor: '#f7f7f7'
                }}
                readOnly
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

            {/* Contact Number */}
            <div style={{ marginBottom: '1.5rem' }}>
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
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="Enter your contact number"
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

            {/* Vehicle Number */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: colors.darkGray,
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                Vehicle Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleInputChange}
                placeholder="Enter your vehicle number"
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

            {/* Vehicle Type */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: colors.darkGray,
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                Vehicle Type
              </label>
              <input
                type="text"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                placeholder="Enter your vehicle type (e.g., Car)"
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

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: colors.darkGray,
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                Parking Slot
              </label>
              <select
                name="parkingSlotId"
                value={formData.parkingSlotId}
                onChange={handleInputChange}
                required
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
              >
                <option value="">Select a parking slot</option>
                {availableSlots.map(slot => (
                  <option key={slot._id} value={slot._id}>
                    {slot.slotId} - {slot.location} (Floor: {slot.floor}, Section: {slot.section})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: colors.darkGray,
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
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

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: colors.darkGray,
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                Entry Time
              </label>
              <input
                type="time"
                name="entryTime"
                value={formData.entryTime}
                onChange={handleInputChange}
                required
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

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: colors.darkGray,
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                Exit Time
              </label>
              <input
                type="time"
                name="exitTime"
                value={formData.exitTime}
                onChange={handleInputChange}
                required
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

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? '#E1E5E9' : `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
                color: colors.white,
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(0, 116, 213, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(0, 116, 213, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 116, 213, 0.3)';
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
                  Creating Reservation...
                </span>
              ) : (
                'Create Reservation'
              )}
            </button>
          </form>
        </div>

        {/* Live Chart */}
        <div style={{
          background: colors.white,
          borderRadius: '15px',
          padding: '2rem',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          border: `1px solid #E1E5E9`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{
              margin: 0,
              color: colors.darkGray,
              fontSize: '1.8rem',
              fontWeight: 'bold'
            }}>
              Parking Slot Availability
            </h3>
            <button 
              onClick={() => {
                console.log('Manual refresh triggered');
                fetchAvailableSlots();
                fetchSlotStatistics();
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: `linear-gradient(135deg, ${colors.blue}, ${colors.green})`,
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 116, 213, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 116, 213, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 116, 213, 0.3)';
              }}
            >
              🔄 Refresh
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
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
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {slotStats.totalSlots}
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.9
              }}>
                Total Slots
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
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {slotStats.availableSlots}
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.9
              }}>
                Available
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
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {slotStats.reservedSlots}
              </div>
              <div style={{
                fontSize: '0.9rem',
                opacity: 0.9
              }}>
                Reserved
              </div>
            </div>
          </div>

          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Available Slots List */}
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
          Available Parking Slots
        </h3>
        {availableSlots.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: colors.darkGray,
            fontSize: '1.1rem',
            opacity: 0.7
          }}>
            No parking slots available at the moment
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {availableSlots.map(slot => (
              <div 
                key={slot._id} 
                style={{
                  padding: '1.5rem',
                  border: `2px solid ${colors.green}`,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.cream}20, ${colors.white})`,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(6, 155, 71, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(6, 155, 71, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(6, 155, 71, 0.1)';
                }}
              >
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  color: colors.darkGray,
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  {slot.slotId}
                </h4>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  color: colors.darkGray,
                  fontSize: '1rem'
                }}>
                  {slot.location}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: colors.darkGray,
                  opacity: 0.8
                }}>
                  Floor: {slot.floor} | Section: {slot.section}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        background: `linear-gradient(135deg, ${colors.green}, ${colors.blue})`, 
        color: colors.white, 
        padding: '0.75rem 1.5rem', 
        borderRadius: '25px',
        fontSize: '0.9rem',
        fontWeight: '600',
        boxShadow: '0 8px 25px rgba(6, 155, 71, 0.4)',
        zIndex: 1000
      }}>
        🟢 Live Updates Active
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

export default ReservationPortal;
