import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
<<<<<<< HEAD
import { AuthContext } from "./context/AuthContext";
=======
import { getUserRole } from "./auth";
>>>>>>> 032f871 (Ajout du projet PFE complet)

const SignIn = ({ onSignIn, initialMode = "signin" }) => {
    const navigate = useNavigate();
<<<<<<< HEAD
    const { setUser } = useContext(AuthContext);
=======
    const [mode, setMode] = useState(initialMode);
>>>>>>> 032f871 (Ajout du projet PFE complet)

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
<<<<<<< HEAD
        password: "",
=======
        role: "customer",
        organizerName: "",
>>>>>>> 032f871 (Ajout du projet PFE complet)
        acceptTerms: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [serverInfo, setServerInfo] = useState(
        initialMode === "login"
            ? "Enter your email and phone to confirm your existing account."
            : ""
    );

    // ---------------- VALIDATION ----------------
    const validateForm = () => {
        const newErrors = {};

<<<<<<< HEAD
        if (!formData.firstName.trim())
            newErrors.firstName = "First name is required";

        if (!formData.lastName.trim())
            newErrors.lastName = "Last name is required";
=======
        if (mode === "signin" && !formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (mode === "signin" && !formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (mode === "signin" && formData.role === "organizer" && !formData.organizerName.trim()) {
            newErrors.organizerName = "Organizer name is required";
        }
>>>>>>> 032f871 (Ajout du projet PFE complet)

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

<<<<<<< HEAD
        if (!formData.password || !formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.acceptTerms) {
=======
        if (mode === "signin" && !formData.acceptTerms) {
>>>>>>> 032f871 (Ajout du projet PFE complet)
            newErrors.acceptTerms = "Accept terms required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

<<<<<<< HEAD
    // ---------------- INPUT CHANGE ----------------
=======
    const saveSession = (user) => {
        const contactPerson = {
            firstName: user.firstName || formData.firstName,
            lastName: user.lastName || formData.lastName,
            email: user.email || formData.email,
            phone: user.phone || formData.phone,
            role: getUserRole(user) || user.role || formData.role || "customer",
            organizerName: user.organizerName || formData.organizerName || "",
            signedInAt: new Date().toISOString(),
            expiresAt: Date.now() + 86400000
        };

        localStorage.setItem("contactPerson", JSON.stringify(contactPerson));

        window.dispatchEvent(new CustomEvent("signInStatusChanged", {
            detail: contactPerson
        }));

        if (onSignIn) onSignIn(contactPerson);
        navigate("/");
    };

>>>>>>> 032f871 (Ajout du projet PFE complet)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        setErrors((prev) => ({ ...prev, [name]: "" }));
        setServerError("");
        setServerInfo("");
    };

<<<<<<< HEAD
    // ---------------- SUBMIT ----------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. validate FIRST
        if (!validateForm()) return;

=======
    const switchMode = (nextMode) => {
        setMode(nextMode);
        setErrors({});
        setServerError("");
        setServerInfo(
            nextMode === "login"
                ? "Enter your email and phone to confirm your existing account."
                : ""
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

>>>>>>> 032f871 (Ajout du projet PFE complet)
        setIsLoading(true);
        setServerError("");

        try {
<<<<<<< HEAD
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
=======
            const endpoint = mode === "login"
                ? "http://localhost:5000/api/customers/login"
                : "http://localhost:5000/api/customers/signin";

            const payload = mode === "login"
                ? { email: formData.email, phone: formData.phone }
                : formData;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => null);

            if (!res.ok || data?.success === false) {
                throw new Error(data?.message || "Authentication failed");
            }

            if (mode === "signin" && data?.alreadyExists) {
                const confirmed = window.confirm(
                    "This account already exists. Do you want to continue with this account?"
                );

                if (!confirmed) return;
            }

            // Save token and user; extract role from token if present
            const token = data?.token;
            let roleFromToken = null;
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    roleFromToken = payload.role;
                } catch (err) {
                    // ignore
                }
                localStorage.setItem('authToken', token);
            }

            const userData = data?.data || formData;
            if (roleFromToken) userData.role = roleFromToken;

            saveSession(userData);
        } catch (err) {
            if (mode === "signin") {
                saveSession(formData);
            } else {
                setServerError(err.message || "Login failed");
            }
>>>>>>> 032f871 (Ajout du projet PFE complet)
        } finally {
            setIsLoading(false);
        }
    };

<<<<<<< HEAD
    // ---------------- UI ----------------
=======
>>>>>>> 032f871 (Ajout du projet PFE complet)
    return (
        <div className="signin-container">
            <div className="signin-card">
                <div className="signin-header">
                    <h1 className="signin-title">EVENTIX</h1>
                    <p className="signin-subtitle">
                        {mode === "login" ? "Login with your existing account" : "Sign in to book events"}
                    </p>
                </div>

<<<<<<< HEAD
                {serverError && (
                    <div className="server-error">{serverError}</div>
                )}
=======
                {serverError && <div className="server-error">{serverError}</div>}
                {serverInfo && <div className="server-info">{serverInfo}</div>}

                <div className="auth-switch">
                    <button
                        type="button"
                        className={mode === "signin" ? "active" : ""}
                        onClick={() => switchMode("signin")}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        className={mode === "login" ? "active" : ""}
                        onClick={() => switchMode("login")}
                    >
                        Login
                    </button>
                </div>
>>>>>>> 032f871 (Ajout du projet PFE complet)

                <form onSubmit={handleSubmit} className="signin-form">
                    {mode === "signin" && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input name="firstName" value={formData.firstName} onChange={handleChange} disabled={isLoading}/>
                                {errors.firstName && <span className="error">{errors.firstName}</span>}
                            </div>

<<<<<<< HEAD
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
=======
                            <div className="form-group">
                                <label>Last Name</label>
                                <input name="lastName" value={formData.lastName} onChange={handleChange} disabled={isLoading}/>
                                {errors.lastName && <span className="error">{errors.lastName}</span>}
                            </div>
>>>>>>> 032f871 (Ajout du projet PFE complet)
                        </div>
                    )}

<<<<<<< HEAD
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
=======
                    {mode === "signin" && (
                        <>
                            <div className="form-group">
                                <label>Account Type</label>
                                <select name="role" value={formData.role} onChange={handleChange} disabled={isLoading}>
                                    <option value="customer">Customer</option>
                                    <option value="organizer">Organizer</option>
                                </select>
                                <span className="field-hint">
                                    Admin access is enabled only for emails configured by the platform.
                                </span>
                            </div>

                            {formData.role === "organizer" && (
                                <div className="form-group">
                                    <label>Organizer Name</label>
                                    <input
                                        name="organizerName"
                                        value={formData.organizerName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        placeholder="Example: Cinema Megarama"
                                    />
                                    {errors.organizerName && <span className="error">{errors.organizerName}</span>}
                                </div>
                            )}
                        </>
                    )}
>>>>>>> 032f871 (Ajout du projet PFE complet)

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

<<<<<<< HEAD
                     
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
=======
                    {mode === "signin" && (
                        <>
                            <div className="checkbox-group">
                                <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange}/>
                                <span>Accept Terms</span>
                            </div>
                            {errors.acceptTerms && <span className="error">{errors.acceptTerms}</span>}
                        </>
>>>>>>> 032f871 (Ajout du projet PFE complet)
                    )}

                    <button className="signin-button" disabled={isLoading}>
                        {isLoading ? "Loading..." : mode === "login" ? "Login" : "Sign In"}
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
