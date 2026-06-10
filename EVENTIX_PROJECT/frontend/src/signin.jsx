import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";

const SignIn = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        acceptTerms: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone is required";
        } else if (!/^(\+212|0)[5-7][0-9]{8}$/.test(formData.phone)) {
            newErrors.phone = "Enter a valid Moroccan number (e.g., 0612345678 or +212612345678)";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

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
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setServerError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setServerError("");

        try {
            const response = await fetch("http://localhost:5000/api/customers/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim(),
                    password: formData.password,
                    acceptTerms: formData.acceptTerms,
                    isOrganizer: false
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Sign in failed");
            }

            // Save user data to localStorage and context
            const userData = {
                firstName: data.data.firstName,
                lastName: data.data.lastName,
                email: data.data.email,
                phone: data.data.phone,
                role: data.data.role || "customer",
                signedInAt: new Date().toISOString()
            };

            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("token", data.token);
            setUser(userData);

            // Redirect to home page
            navigate("/");
        } catch (err) {
            console.error("Sign in error:", err);
            setServerError(err.message || "Sign in failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <div className="signin-header">
                    <h1 className="signin-title">EVENTIX</h1>
                    <p className="signin-subtitle">Create your account to book tickets</p>
                </div>

                {serverError && (
                    <div className="server-error">
                        ⚠️ {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signin-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name *</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Enter your first name"
                                className={errors.firstName ? "error-input" : ""}
                            />
                            {errors.firstName && (
                                <span className="error">{errors.firstName}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Last Name *</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Enter your last name"
                                className={errors.lastName ? "error-input" : ""}
                            />
                            {errors.lastName && (
                                <span className="error">{errors.lastName}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="you@example.com"
                            className={errors.email ? "error-input" : ""}
                        />
                        {errors.email && (
                            <span className="error">{errors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="0612345678 or +212612345678"
                            className={errors.phone ? "error-input" : ""}
                        />
                        {errors.phone && (
                            <span className="error">{errors.phone}</span>
                        )}
                        <small className="help-text">Moroccan phone number only</small>
                    </div>

                    <div className="form-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Create a password (min 6 characters)"
                            className={errors.password ? "error-input" : ""}
                        />
                        {errors.password && (
                            <span className="error">{errors.password}</span>
                        )}
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <label>
                            I accept the <a href="/terms" target="_blank">Terms and Conditions</a> *
                        </label>
                    </div>
                    {errors.acceptTerms && (
                        <span className="error">{errors.acceptTerms}</span>
                    )}

                    <button
                        type="submit"
                        className="signin-button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating account..." : "Sign In"}
                    </button>
                </form>

                <button
                    type="button"
                    className="login-redirect-button"
                    onClick={() => navigate("/login")}
                    disabled={isLoading}
                >
                    Already have an account? Login
                </button>

                <button
                    type="button"
                    className="signin-button"
                    onClick={() => navigate("/organizer-signin")}
                    disabled={isLoading}
                    style={{ marginTop: "12px", backgroundColor: "#6c757d" }}
                >
                    Register as Organizer
                </button>
            </div>
        </div>
    );
};

export default SignIn;