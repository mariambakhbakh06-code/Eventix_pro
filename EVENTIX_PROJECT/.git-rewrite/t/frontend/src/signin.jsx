import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";

const SignIn = ({ onSignIn }) => {
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

    // ---------------- VALIDATION ----------------
    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim())
            newErrors.firstName = "First name is required";

        if (!formData.lastName.trim())
            newErrors.lastName = "Last name is required";

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
            newErrors.email = "Invalid email";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone is required";
        } else if (!/^(\+212|0)[5-7][0-9]{8}$/.test(formData.phone)) {
            newErrors.phone = "Invalid Moroccan number";
        }

        if (!formData.password || !formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = "Accept terms required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ---------------- INPUT CHANGE ----------------
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        setErrors((prev) => ({ ...prev, [name]: "" }));
        setServerError("");
    };

    // ---------------- SUBMIT ----------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. validate FIRST
        if (!validateForm()) return;

        setIsLoading(true);
        setServerError("");

        try {
            // 2. API CALL
            const res = await fetch("http://localhost:5000/api/customers/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            let data = null;

            try {
                data = await res.json();
            } catch {}

            const user = data?.data || formData;

            // 3. create session object
            const contactPerson = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                signedInAt: new Date().toISOString(),
                expiresAt: Date.now() + 86400000
            };

            // 4. SYNC AUTH (IMPORTANT)
            setUser(contactPerson);
            localStorage.setItem("user", JSON.stringify(contactPerson));

            // optional event system
            window.dispatchEvent(
                new CustomEvent("signInStatusChanged", {
                    detail: contactPerson
                })
            );

            // optional callback
            if (onSignIn) onSignIn(contactPerson);

            // 5. redirect
            navigate("/");

        } catch (err) {
            console.error("SignIn error:", err);

            // fallback offline mode
            const contactPerson = {
                ...formData,
                signedInAt: new Date().toISOString(),
                expiresAt: Date.now() + 86400000
            };

            setUser(contactPerson);
            localStorage.setItem("user", JSON.stringify(contactPerson));

            navigate("/");
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------- UI ----------------
    return (
        <div className="signin-container">
            <div className="signin-card">
                <div className="signin-header">
                    <h1 className="signin-title">EVENTIX</h1>
                    <p className="signin-subtitle">Sign in to book events</p>
                </div>

                {serverError && (
                    <div className="server-error">{serverError}</div>
                )}

                <form onSubmit={handleSubmit} className="signin-form">

                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {errors.firstName && (
                                <span className="error">{errors.firstName}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {errors.lastName && (
                                <span className="error">{errors.lastName}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <span className="error">{errors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        {errors.phone && (
                            <span className="error">{errors.phone}</span>
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
                   
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                        />
                        <span>Accept Terms</span>
                    </div>

                    {errors.acceptTerms && (
                        <span className="error">{errors.acceptTerms}</span>
                    )}

                    <button className="signin-button" disabled={isLoading}>
                        {isLoading ? "Loading..." : "Sign In"}
                    </button>
                </form>

                <button
                    type="button"
                    className="login-redirect-button"
                    onClick={() => navigate("/login")}
                    disabled={isLoading}
                >
                    You already have an account? Try Login
                </button>

                <button
                    type="button"
                    className="signin-button"
                    onClick={() => navigate("/organizer-signin")}
                    disabled={isLoading}
                >
                    Sign in as an organizer
                </button>
            </div>
        </div>
    );
};

export default SignIn;