import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminEventDemands = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/pending-events", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/events/${eventId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingEvents(); // Refresh list
      alert("✅ Event approved successfully!");
    } catch (err) {
      alert("Failed to approve event");
    }
  };

  const handleReject = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/events/${selectedEvent._id}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowRejectModal(false);
      setRejectionReason("");
      fetchPendingEvents();
      alert("❌ Event rejected");
    } catch (err) {
      alert("Failed to reject event");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-demands-container">
      <div className="admin-demands-header">
        <h1>📋 Event Demands</h1>
        <p>Review and manage event requests from organizers</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {events.length === 0 ? (
        <div className="no-events">
          <p>No pending event requests</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              {event.imageUrl && (
                <img src={event.imageUrl} alt={event.name} className="event-image" />
              )}
              <div className="event-content">
                <h2>{event.name}</h2>
                <p className="event-description">{event.description}</p>
                
                <div className="event-details">
                  <p>📅 Date: {new Date(event.date).toLocaleDateString()}</p>
                  <p>⏰ Time: {event.time}</p>
                  <p>📍 Venue: {event.venue}</p>
                  <p>🏙️ City: {event.city}</p>
                  <p>💰 Price: {event.price} MAD</p>
                  <p>🎟️ Seats: {event.totalSeats}</p>
                </div>

                <div className="organizer-info">
                  <strong>Organizer:</strong> {event.organizerName}<br />
                  <strong>Email:</strong> {event.organizerEmail}
                </div>

                <div className="event-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => handleApprove(event._id)}
                  >
                    ✅ Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowRejectModal(true);
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reject Event</h3>
            <p>Event: <strong>{selectedEvent?.name}</strong></p>
            <textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="4"
            />
            <div className="modal-buttons">
              <button onClick={handleReject}>Confirm Reject</button>
              <button onClick={() => setShowRejectModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventDemands;