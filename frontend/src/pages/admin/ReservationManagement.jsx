import React, { useState, useEffect } from 'react';
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

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [slotStats, setSlotStats] = useState({ totalSlots: 0, availableSlots: 0, reservedSlots: 0 });
  const [loading, setLoading] = useState(true);
  const [editingReservation, setEditingReservation] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    entryTime: '',
    exitTime: '',
    status: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

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
      setMessage({ type: 'error', text: 'Error fetching reservations' });
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

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setEditFormData({
      entryTime: new Date(reservation.entryTime).toISOString().slice(0, 16),
      exitTime: new Date(reservation.exitTime).toISOString().slice(0, 16),
      status: reservation.status
    });
    setShowEditForm(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        entryTime: editFormData.entryTime,
        exitTime: editFormData.exitTime,
        status: editFormData.status
      };

      await reservationAPI.updateReservation(editingReservation._id, updateData);
      setMessage({ type: 'success', text: 'Reservation updated successfully!' });
      
      // Emit socket event for real-time update
      socket.emit('reservationUpdate', { ...editingReservation, ...updateData });
      
      resetEditForm();
      fetchReservations();
      fetchSlotStatistics();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error updating reservation' 
      });
    }
  };

  const handleDelete = async (reservationId, reservationIdDisplay) => {
    if (window.confirm(`Are you sure you want to delete reservation ${reservationIdDisplay}?`)) {
      try {
        await reservationAPI.deleteReservation(reservationId);
        setMessage({ type: 'success', text: 'Reservation deleted successfully!' });
        
        // Emit socket event for real-time update
        socket.emit('reservationUpdate', { deleted: reservationId });
        socket.emit('slotUpdate', { action: 'deleted' });
        
        fetchReservations();
        fetchSlotStatistics();
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Error deleting reservation' 
        });
      }
    }
  };

  const generateReport = async () => {
    try {
      setMessage({ type: '', text: '' });
      setMessage({ type: 'info', text: 'Generating report...' });
      
      const response = await reservationAPI.generateReport();
      
      // Download the report
      if (response.data.fileName) {
        reservationAPI.downloadReport(response.data.fileName);
        setMessage({ type: 'success', text: 'Report generated and downloaded successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Report generated but download failed' });
      }
    } catch (error) {
      console.error('Report generation error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error generating report. Please try again.' 
      });
    }
  };

  const resetEditForm = () => {
    setEditingReservation(null);
    setShowEditForm(false);
    setEditFormData({ entryTime: '', exitTime: '', status: '' });
    setMessage({ type: '', text: '' });
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
          Loading reservation data...
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
        No reservation data available...
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
          Reservation Management
        </h1>
        <p style={{
          margin: 0,
          fontSize: '1.1rem',
          opacity: 0.9
        }}>
          Manage parking reservations and track occupancy
        </p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`}>
          {message.text}
        </div>
      )}

      {/* Statistics Dashboard */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: colors.darkGray }}>
          Parking Statistics
        </h3>
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-number">{slotStats.totalSlots}</div>
            <div className="stat-label">Total Parking Slots</div>
          </div>
          <div className="stat-card reserved">
            <div className="stat-number">{slotStats.reservedSlots}</div>
            <div className="stat-label">Reserved Slots</div>
          </div>
          <div className="stat-card available">
            <div className="stat-number">{slotStats.availableSlots}</div>
            <div className="stat-label">Available Slots</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{reservations.length}</div>
            <div className="stat-label">Total Reservations</div>
          </div>
        </div>
      </div>

      {/* Generate Report Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          className="btn-warning"
          onClick={generateReport}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
        >
          📄 Generate Report
        </button>
      </div>

      {/* Edit Form */}
      {showEditForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: colors.darkGray }}>
            Update Reservation: {editingReservation?.reservationId}
          </h3>
          <form onSubmit={handleEditSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Entry Time</label>
                <input
                  type="datetime-local"
                  value={editFormData.entryTime}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, entryTime: e.target.value }))}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Exit Time</label>
                <input
                  type="datetime-local"
                  value={editFormData.exitTime}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, exitTime: e.target.value }))}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="form-control"
                  required
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-success">
                Update Reservation
              </button>
              <button type="button" className="btn-danger" onClick={resetEditForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reservations Table */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: colors.darkGray }}>
          Reserved Parking Slots 
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

        {reservations.length === 0 ? (
          <div className="no-data">No reservations found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Reservation ID</th>
                  <th>Driver Info</th>
                  <th>Parking Slot</th>
                  <th>Contact Number</th>
                  <th>Vehicle Number</th>
                  <th>Vehicle Type</th>
                  <th>Reserved Date</th>
                  <th>Entry Time</th>
                  <th>Exit Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.filter(reservation => reservation && reservation.reservationId).map((reservation) => (
                  <tr key={reservation._id || reservation.reservationId || Math.random()}>
                    <td style={{ fontWeight: 'bold', color: colors.blue }}>
                      {reservation.reservationId}
                    </td>
                    <td>
                      <div>
                        <strong>ID: {typeof reservation.driverId === 'object' ? (reservation.driverId?._id || 'N/A') : (reservation.driverId || 'N/A')}</strong>
                        {typeof reservation.driverId === 'object' && reservation.driverId?.name && (
                          <>
                            <br />
                            <small style={{ color: colors.darkGray }}>
                              {reservation.driverId.name}
                            </small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{reservation.parkingSlotId?.slotId || 'N/A'}</strong>
                        <br />
                        <small style={{ color: colors.darkGray }}>
                          {reservation.parkingSlotId?.location || 'Location not available'}
                        </small>
                      </div>
                    </td>
                    <td>{reservation.contactNumber || '—'}</td>
                    <td>{reservation.vehicleNumber || '—'}</td>
                    <td>{reservation.vehicleType || '—'}</td>
                    <td>
                      <div>
                        <div>{formatDate(reservation.reservedDate)}</div>
                        <small style={{ color: colors.darkGray }}>
                          {formatTime(reservation.reservedDate)}
                        </small>
                      </div>
                    </td>
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
                    <td>{getStatusBadge(reservation.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        <button
                          className="btn-warning"
                          onClick={() => handleEdit(reservation)}
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                        >
                          Update
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(reservation._id || reservation.reservationId, reservation.reservationId)}
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
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

      {/* Additional Statistics */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: colors.darkGray }}>
          Reservation Statistics
        </h3>
        <div className="stats-grid">
          <div className="stat-card available">
            <div className="stat-number">
              {reservations.filter(r => r.status === 'active').length}
            </div>
            <div className="stat-label">Active Reservations</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reservations.filter(r => r.status === 'completed').length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card reserved">
            <div className="stat-number">
              {reservations.filter(r => r.status === 'cancelled').length}
            </div>
            <div className="stat-label">Cancelled</div>
          </div>
          <div className="stat-card total">
            <div className="stat-number">
              {reservations.filter(r => 
                new Date(r.reservedDate).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <div className="stat-label">Today's Reservations</div>
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

export default ReservationManagement;
