import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
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

// Helper functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString();
};

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AdminTrackingStatus = () => {
  const [reservations, setReservations] = useState([]);
  const [slotStats, setSlotStats] = useState({ totalSlots: 0, availableSlots: 0, reservedSlots: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchReservations();
    fetchSlotStatistics();

    // Socket listeners for real-time updates
    socket.on('reservationUpdate', () => {
      fetchReservations();
      fetchSlotStatistics();
    });

    socket.on('slotUpdate', () => {
      fetchSlotStatistics();
    });

    return () => {
      socket.off('reservationUpdate');
      socket.off('slotUpdate');
    };
  }, []);

  const fetchReservations = async () => {
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

  const fetchSlotStatistics = async () => {
    try {
      const response = await parkingSlotAPI.getSlotStatistics();
      setSlotStats(response.data);
    } catch (error) {
      console.error('Error fetching slot statistics:', error);
    }
  };

  const getFilteredReservations = () => {
    if (selectedStatus === 'all') {
      return reservations;
    }
    return reservations.filter(reservation => reservation.status === selectedStatus);
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

  // Chart data for slot availability
  const slotChartData = {
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

  // Chart data for reservation status
  const statusChartData = {
    labels: ['Active', 'Completed', 'Cancelled'],
    datasets: [
      {
        label: 'Reservations',
        data: [
          reservations.filter(r => r.status === 'active').length,
          reservations.filter(r => r.status === 'completed').length,
          reservations.filter(r => r.status === 'cancelled').length,
        ],
        backgroundColor: [colors.green, colors.blue, colors.red],
        borderColor: [colors.green, colors.blue, colors.red],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
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
          Loading tracking data...
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

  const filteredReservations = getFilteredReservations();

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
          Admin Tracking Status Dashboard
        </h1>
        <p style={{
          margin: 0,
          fontSize: '1.1rem',
          opacity: 0.9
        }}>
          Real-time monitoring and analytics
        </p>
      </div>

      {/* Real-time Statistics */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: colors.darkGray }}>
          Live Parking Statistics 
          <span 
            style={{ 
              fontSize: '1rem', 
              fontWeight: 'normal', 
              color: colors.green,
              marginLeft: '1rem' 
            }}
          >
            🟢 Real-time
          </span>
        </h3>
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-number">{slotStats.totalSlots}</div>
            <div className="stat-label">Total Parking Slots</div>
          </div>
          <div className="stat-card available">
            <div className="stat-number">{slotStats.availableSlots}</div>
            <div className="stat-label">Available Slots</div>
          </div>
          <div className="stat-card reserved">
            <div className="stat-number">{slotStats.reservedSlots}</div>
            <div className="stat-label">Reserved Slots</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {slotStats.totalSlots > 0 ? 
                Math.round((slotStats.reservedSlots / slotStats.totalSlots) * 100) : 0}%
            </div>
            <div className="stat-label">Occupancy Rate</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: colors.darkGray }}>
            Slot Availability
          </h3>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <Doughnut data={slotChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: colors.darkGray }}>
            Reservation Status
          </h3>
          <Bar data={statusChartData} options={barChartOptions} />
        </div>
      </div>

      {/* Filter Options */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: colors.darkGray }}>
          Filter Reservations
        </h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label className="form-label" style={{ margin: 0 }}>Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-control"
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Reservations</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
          <span style={{ color: colors.darkGray, fontSize: '0.9rem' }}>
            Showing {filteredReservations.length} of {reservations.length} reservations
          </span>
        </div>
      </div>

      {/* Detailed Reservations Table */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: colors.darkGray }}>
          Detailed Tracking Information
        </h3>

        {filteredReservations.length === 0 ? (
          <div className="no-data">
            {selectedStatus === 'all' ? 'No reservations found' : `No ${selectedStatus} reservations found`}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Reservation ID</th>
                  <th>Driver ID</th>
                  <th>Parking Slot</th>
                  <th>Reserved Date</th>
                  <th>Reserved Time</th>
                  <th>Entry Time</th>
                  <th>Exit Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.filter(reservation => reservation && reservation.reservationId).map((reservation) => {
                  const entryTime = new Date(reservation.entryTime);
                  const exitTime = new Date(reservation.exitTime);
                  const durationHours = Math.abs(exitTime - entryTime) / 36e5; // Convert to hours

                  return (
                    <tr key={reservation._id || reservation.reservationId || Math.random()}>
                      <td style={{ fontWeight: 'bold', color: colors.blue }}>
                        {reservation.reservationId}
                      </td>
                      <td>{typeof reservation.driverId === 'object' ? (reservation.driverId?._id || 'N/A') : (reservation.driverId || 'N/A')}</td>
                      <td>
                        <div>
                          <strong>{reservation.parkingSlotId?.slotId || 'N/A'}</strong>
                          <br />
                          <small style={{ color: colors.darkGray }}>
                            {reservation.parkingSlotId?.location || 'Location not available'}
                          </small>
                        </div>
                      </td>
                      <td>{formatDate(reservation.reservedDate)}</td>
                      <td>{formatTime(reservation.reservedDate)}</td>
                      <td>
                        <div>
                          <div>{formatDate(reservation.entryTime)}</div>
                          <small style={{ color: colors.darkGray }}>
                            {formatTime(reservation.entryTime)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div>{formatDate(reservation.exitTime)}</div>
                          <small style={{ color: colors.darkGray }}>
                            {formatTime(reservation.exitTime)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          color: colors.darkGray, 
                          fontWeight: 'bold' 
                        }}>
                          {durationHours.toFixed(1)}h
                        </span>
                      </td>
                      <td>{getStatusBadge(reservation.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Analytics */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: colors.darkGray }}>
          Today's Activity
        </h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">
              {reservations.filter(r => 
                new Date(r.reservedDate).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <div className="stat-label">Today's Reservations</div>
          </div>
          <div className="stat-card available">
            <div className="stat-number">
              {reservations.filter(r => 
                new Date(r.reservedDate).toDateString() === new Date().toDateString() &&
                r.status === 'active'
              ).length}
            </div>
            <div className="stat-label">Active Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reservations.filter(r => 
                new Date(r.reservedDate).toDateString() === new Date().toDateString() &&
                r.status === 'completed'
              ).length}
            </div>
            <div className="stat-label">Completed Today</div>
          </div>
          <div className="stat-card reserved">
            <div className="stat-number">
              {reservations.filter(r => 
                new Date(r.reservedDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
      </div>

      {/* Real-time indicator */}
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        background: colors.green, 
        color: colors.white, 
        padding: '0.5rem 1rem', 
        borderRadius: '20px',
        fontSize: '0.8rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        🟢 Live Updates Active
      </div>
    </div>
  );
};

export default AdminTrackingStatus;
