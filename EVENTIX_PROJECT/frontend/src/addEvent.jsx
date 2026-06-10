import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrganizerAddEvent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    endDate: "",
    time: "",
    venue: "",
    city: "",
    price: "",
    totalSeats: "",
    imageUrl: "",
    category: "musical",
    subCategory: "",
    maxTicketsPerPurchase: 4
  });

  const categories = [
    { value: "musical", label: "🎵 Musical / Concert" },
    { value: "sport", label: "⚽ Sport" },
    { value: "cinema", label: "🎬 Cinema" },
    { value: "education", label: "📚 Education / Conference" }
  ];

  const cities = [
    "Casablanca",
    "Rabat",
    "Marrakech",
    "Fès",
    "Tanger",
    "Agadir",
    "Meknès",
    "Oujda",
    "Kenitra",
    "Tetouan"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Event name is required");
      return false;
    }
    if (!formData.date) {
      setError("Event date is required");
      return false;
    }
    if (!formData.time) {
      setError("Event time is required");
      return false;
    }
    if (!formData.venue.trim()) {
      setError("Venue is required");
      return false;
    }
    if (!formData.city) {
      setError("City is required");
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setError("Valid price is required");
      return false;
    }
    if (!formData.totalSeats || formData.totalSeats <= 0) {
      setError("Valid number of seats is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Get token from localStorage
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("You must be logged in to create an event");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/items",
        {
          name: formData.name.trim(),
          description: formData.description.trim(),
          date: new Date(formData.date).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(formData.date).toISOString(),
          time: formData.time,
          venue: formData.venue.trim(),
          city: formData.city,
          price: parseFloat(formData.price),
          totalSeats: parseInt(formData.totalSeats),
          imageUrl: formData.imageUrl.trim(),
          category: formData.category,
          subCategory: formData.subCategory,
          maxTicketsPerPurchase: parseInt(formData.maxTicketsPerPurchase)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSuccess("✅ Event created successfully!");
        // Reset form
        setFormData({
          name: "",
          description: "",
          date: "",
          endDate: "",
          time: "",
          venue: "",
          city: "",
          price: "",
          totalSeats: "",
          imageUrl: "",
          category: "musical",
          subCategory: "",
          maxTicketsPerPurchase: 4
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/organizer/dashboard");
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.response?.data?.message || "Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-event-container">
      <div className="add-event-card">
        <div className="add-event-header">
          <h1>📅 Create New Event</h1>
          <p>Fill in the details to add a new event</p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-event-form">
          {/* Event Name */}
          <div className="form-group">
            <label>Event Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Jazz Night 2024"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              rows="4"
              disabled={isLoading}
            />
          </div>

          {/* Date and Time Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Event Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>End Date (Optional)</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Event Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Venue and City */}
          <div className="form-row">
            <div className="form-group">
              <label>Venue *</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g., Stade Mohammed V"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>City *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Select a city</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price and Seats */}
          <div className="form-row">
            <div className="form-group">
              <label>Price (MAD) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="10"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Total Seats *</label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                placeholder="Number of seats"
                min="1"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Max Tickets Per Purchase</label>
              <input
                type="number"
                name="maxTicketsPerPurchase"
                value={formData.maxTicketsPerPurchase}
                onChange={handleChange}
                min="1"
                max="20"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isLoading}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Sub-Category (Optional)</label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                placeholder="e.g., Jazz, Rock, Football"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label>Image URL (Optional)</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/event-image.jpg"
              disabled={isLoading}
            />
            {formData.imageUrl && (
              <div className="image-preview">
                <img src={formData.imageUrl} alt="Preview" />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="form-buttons">
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Creating Event..." : "✨ Create Event"}
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/organizer/dashboard")}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerAddEvent;