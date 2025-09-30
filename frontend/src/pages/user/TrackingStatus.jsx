import React, { useState, useEffect } from 'react';
import { reservationAPI, socket } from '../../services/api';

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

// Helper functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString();
};

const TrackingStatus = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDriverId, setSearchDriverId] = useState('');

  useEffect(() => {
    fetchAllReservations();

    // Socket listeners for real-time updates
    socket.on('reservationUpdate', (data) => {
      fetchAllReservations();
    });

    return () => {
      socket.off('reservationUpdate');
    };
  }, []);

  useEffect(() => {
    // Filter out null/invalid reservations first
    const validReservations = reservations.filter(reservation => 
      reservation && reservation._id && reservation.reservationId
    );

    // Filter reservations based on driver ID search
    if (searchDriverId.trim() === '') {
      setFilteredReservations(validReservations);
    } else {
      const filtered = validReservations.filter(reservation => {
        if (!reservation || !reservation.driverId) return false;
        const driverIdToSearch = typeof reservation.driverId === 'object' 
          ? (reservation.driverId?._id || 'N/A') 
          : (reservation.driverId || 'N/A');
        return driverIdToSearch.toLowerCase().includes(searchDriverId.toLowerCase());
      });
      setFilteredReservations(filtered);
    }
  }, [searchDriverId, reservations]);

  const fetchAllReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getAllReservations();
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return colors.green;
      case 'completed':
        return colors.blue;
      case 'cancelled':
        return colors.red;
      default:
        return colors.darkGray;
    }
  };

  const getStatusBadge = (status) => (
    <span
      style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: colors.white,
        backgroundColor: getStatusColor(status),
      }}
    >
      {status.toUpperCase()}
    </span>
  );

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
          Loading tracking information...
        </div>
      </div>
    );
  }

  // Safety check for reservations
  if (!reservations || !Array.isArray(reservations)) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        fontSize: '1.2rem',
        color: colors.darkGray
      }}>
        No tracking data available...
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
          My Reservation Tracking
        </h1>
        <p style={{
          margin: 0,
          fontSize: '1.1rem',
          opacity: 0.9
        }}>
          Monitor your parking reservations in real-time
        </p>
      </div>

      {/* Search Filter */}
      <div style={{
        background: colors.white,
        borderRadius: '15px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
        border: `1px solid #E1E5E9`
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: colors.darkGray,
            fontWeight: '600',
            fontSize: '0.95rem'
          }}>
            Search by Driver ID
          </label>
          <input
            type="text"
            value={searchDriverId}
            onChange={(e) => setSearchDriverId(e.target.value)}
            placeholder="Enter driver ID to filter reservations"
            style={{
              maxWidth: '400px',
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
      </div>

      {/* Reservations Table */}
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
          Reservation Status 
          <span 
            style={{ 
              fontSize: '1rem', 
              fontWeight: 'normal', 
              color: colors.blue,
              marginLeft: '1rem' 
            }}
          >
            (Live Updates)
          </span>
        </h3>

        {filteredReservations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: colors.darkGray,
            fontSize: '1.1rem',
            opacity: 0.7
          }}>
            {searchDriverId ? 'No reservations found for the specified driver ID' : 'No reservations found'}
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
                    Reservation ID
                  </th>
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
                    Reserved Date
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    Reserved Time
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    Parking Slot (Location)
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    Entry Time
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    Exit Time
                  </th>
                  <th style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                                 {filteredReservations.filter(reservation => reservation && reservation._id).map((reservation, index) => (
                   <tr key={reservation._id || reservation.reservationId || Math.random()} style={{
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
                      {reservation.reservationId}
                    </td>
                                         <td style={{
                       padding: '1rem',
                       color: colors.darkGray,
                       borderBottom: '1px solid #E1E5E9'
                     }}>
                       {typeof reservation.driverId === 'object' ? (reservation.driverId?._id || 'N/A') : (reservation.driverId || 'N/A')}
                     </td>
                                         <td style={{
                       padding: '1rem',
                       color: colors.darkGray,
                       borderBottom: '1px solid #E1E5E9'
                     }}>
                       {reservation.reservedDate ? formatDate(reservation.reservedDate) : 'N/A'}
                     </td>
                     <td style={{
                       padding: '1rem',
                       color: colors.darkGray,
                       borderBottom: '1px solid #E1E5E9'
                     }}>
                       {reservation.reservedDate ? formatTime(reservation.reservedDate) : 'N/A'}
                     </td>
                    <td style={{
                      padding: '1rem',
                      borderBottom: '1px solid #E1E5E9'
                    }}>
                      <div>
                        <strong>{reservation.parkingSlotId?.slotId || 'N/A'}</strong>
                        <br />
                        <small style={{ color: colors.darkGray }}>
                          {reservation.parkingSlotId?.location || 'Location not available'}
                        </small>
                      </div>
                    </td>
                                         <td style={{
                       padding: '1rem',
                       borderBottom: '1px solid #E1E5E9'
                     }}>
                       <div>
                         <div>{reservation.entryTime ? formatDate(reservation.entryTime) : 'N/A'}</div>
                         <small style={{ color: colors.darkGray }}>
                           {reservation.entryTime ? formatTime(reservation.entryTime) : 'N/A'}
                         </small>
                       </div>
                     </td>
                     <td style={{
                       padding: '1rem',
                       borderBottom: '1px solid #E1E5E9'
                     }}>
                       <div>
                         <div>{reservation.exitTime ? formatDate(reservation.exitTime) : 'N/A'}</div>
                         <small style={{ color: colors.darkGray }}>
                           {reservation.exitTime ? formatTime(reservation.exitTime) : 'N/A'}
                         </small>
                       </div>
                     </td>
                                         <td style={{
                       padding: '1rem',
                       borderBottom: '1px solid #E1E5E9'
                     }}>
                       {getStatusBadge(reservation.status || 'unknown')}
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
          Summary
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
               {filteredReservations.filter(r => r && r._id).length}
             </div>
            <div style={{
              fontSize: '1rem',
              opacity: 0.9
            }}>
              Total Reservations
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
               {filteredReservations.filter(r => r && r._id && r.status === 'active').length}
             </div>
            <div style={{
              fontSize: '1rem',
              opacity: 0.9
            }}>
              Active Reservations
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
               {filteredReservations.filter(r => r && r._id && r.status === 'completed').length}
             </div>
            <div style={{
              fontSize: '1rem',
              opacity: 0.9
            }}>
              Completed
            </div>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${colors.red}, ${colors.orange})`,
            color: colors.white,
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(200, 3, 6, 0.3)'
          }}>
                         <div style={{
               fontSize: '2.5rem',
               fontWeight: 'bold',
               marginBottom: '0.5rem'
             }}>
               {filteredReservations.filter(r => r && r._id && r.status === 'cancelled').length}
             </div>
            <div style={{
              fontSize: '1rem',
              opacity: 0.9
            }}>
              Cancelled
            </div>
          </div>
        </div>
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

export default TrackingStatus;
