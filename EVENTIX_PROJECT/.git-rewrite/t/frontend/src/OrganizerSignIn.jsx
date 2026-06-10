import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const OrganizerSignIn = () => {
    const navigate = useNavigate();

    const [imgError, setImgError] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        phone: "",
        photo: "",
        rooms: "",
        password: "",
        earnings: "90",
        acceptTerms: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Address validation
        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        } else if (formData.address.trim().length < 5) {
            newErrors.address = "Address must be at least 5 characters";
        }

        // Phone validation (Moroccan numbers)
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else {
            const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
            if (!phoneRegex.test(formData.phone)) {
                newErrors.phone = "Enter a valid Moroccan number (e.g., 0612345678 or +212612345678)";
            }
        }

        // Photo URL validation
        if (!formData.photo.trim()) {
            newErrors.photo = "Photo URL is required";
        } else if (!formData.photo.match(/^(http|https):\/\/[^ "]+$/)) {
            newErrors.photo = "Please enter a valid URL (starting with http:// or https://)";
        }

        // Rooms validation
        if (!formData.rooms) {
            newErrors.rooms = "Number of rooms is required";
        } else if (parseInt(formData.rooms) < 1) {
            newErrors.rooms = "Number of rooms must be at least 1";
        }

        if (!formData.password.trim()) {
        newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
}

        // Earnings validation
        if (!formData.earnings) {
            newErrors.earnings = "Earnings percentage is required";
        }

        // Terms validation
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = "You must accept the terms and conditions";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        // Clear error for this field when user starts typing
        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));

        // Clear server messages when user makes changes
        setServerError("");
        setSuccessMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setServerError("");
        setSuccessMessage("");

        try {
            const response = await fetch(`${API_URL}/api/organizers/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    address: formData.address.trim(),
                    phone: formData.phone.trim(),
                    photo: formData.photo.trim(),
                    rooms: parseInt(formData.rooms),
                    earnings: parseInt(formData.earnings),
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific error messages from backend
                setServerError(data.message || "Failed to send request. Please try again.");
                return;
            }

            setSuccessMessage(
                data.message || "Your organizer request has been sent to admin successfully. You will be notified via email once approved."
            );

            // Reset form after successful submission
            setFormData({
                name: "",
                email: "",
                address: "",
                phone: "",
                photo: "",
                rooms: "",
                password: "",
                earnings: "90",
                acceptTerms: false
            });

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate("/signin");
            }, 3000);

        } catch (err) {
            console.error("Network error:", err);
            setServerError("Network error. Please check if the server is running and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <div className="signin-header">
                    <h1 className="signin-title">EVENTIX</h1>
                    <p className="signin-subtitle">
                        Become an Event Organizer
                    </p>
                </div>

                {serverError && (
                    <div className="server-error">
                        ⚠️ {serverError}
                    </div>
                )}

                {successMessage && (
                    <div className="success-message">
                        ✅ {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signin-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={errors.name ? "error-input" : ""}
                        />
                        {errors.name && (
                            <span className="error">
                                {errors.name}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={errors.email ? "error-input" : ""}
                        />
                        {errors.email && (
                            <span className="error">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address *</label>
                        <input
                            id="address"
                            type="text"
                            name="address"
                            placeholder="Your full address"
                            value={formData.address}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={errors.address ? "error-input" : ""}
                        />
                        {errors.address && (
                            <span className="error">
                                {errors.address}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            placeholder="0612345678 or +212612345678"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={errors.phone ? "error-input" : ""}
                        />
                        {errors.phone && (
                            <span className="error">
                                {errors.phone}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="photo">Profile Photo URL *</label>
                        <input
                            id="photo"
                            type="url"
                            name="photo"
                            placeholder="https://example.com/your-photo.jpg"
                            value={formData.photo}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={errors.photo ? "error-input" : ""}
                        />
                        {errors.photo && (
                            <span className="error">
                                {errors.photo}
                            </span>
                        )}
                        {formData.photo && !errors.photo && (
                            <div className="photo-preview">
                                <small>Preview:</small>
                                <img 
                                    src={formData.photo}
                                    alt="Profile preview"
                                    onError={() => setImgError(true)}
                                    style={{ maxWidth: '50px', marginTop: '5px', borderRadius: '50%' }}
                                />
                                {imgError && (
                                 <small className="error">Invalid image URL</small>)}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="rooms">Number of Rooms *</label>
                        <input
                            id="rooms"
                            type="number"
                            name="rooms"
                            min="1"
                            placeholder="Enter number of rooms"
                            value={formData.rooms}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={errors.rooms ? "error-input" : ""}
                        />
                        {errors.rooms && (
                            <span className="error">
                                {errors.rooms}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Create a password"
                        />
                        {errors.password && (
                            <span className="error">{errors.password}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="earnings">Earnings Percentage *</label>
                        <select
                            id="earnings"
                            name="earnings"
                            value={formData.earnings}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={errors.earnings ? "error-input" : ""}
                        >
                            <option value="90">90% (Standard)</option>
                            <option value="95">95% (Premium)</option>
                        </select>
                        {errors.earnings && (
                            <span className="error">
                                {errors.earnings}
                            </span>
                        )}
                        <small className="help-text">
                            You will receive this percentage of ticket sales
                        </small>
                    </div>

                    <div className="checkbox-group">
                        <input
                            id="acceptTerms"
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <label htmlFor="acceptTerms">
                            I accept the <a href="/terms" target="_blank">Terms and Conditions</a> *
                        </label>
                    </div>
                    {errors.acceptTerms && (
                        <span className="error">
                            {errors.acceptTerms}
                        </span>
                    )}

                    <button
                        type="submit"
                        className="signin-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span>⏳ Sending Request...</span>
                        ) : (
                            <span>📝 Submit Organizer Application</span>
                        )}
                    </button>

                </form>

                <button
                    type="button"
                    className="login-redirect-button"
                    onClick={() => navigate("/signin")}
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.6 : 1 }}
                >
                     Sign in as a customer instead
                </button> <br />

                <button
                    type="button"
                    className="login-redirect-button"
                    onClick={() => navigate("/login")}
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.6 : 1 }}
                >
                     You are already an organizer? Try login
                </button>

            </div>
        </div>
    );
};

export default OrganizerSignIn;