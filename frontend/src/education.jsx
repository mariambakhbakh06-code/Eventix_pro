import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const Education = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantities, setQuantities] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Filter education events
    const educationEvents = events.filter(
        (event) => event.category?.toLowerCase() === "education"
    );
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [bookingQuantity, setBookingQuantity] = useState(1);
    const [bookingStatus, setBookingStatus] = useState({});

    // Contact person form - will be auto-populated from localStorage
    const [contactPerson, setContactPerson] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
    });
    
    // Check if user is signed in
    const [isSignedIn, setIsSignedIn] = useState(false);

    // Attendees list (each person attending)
    const [attendees, setAttendees] = useState([]);

    useEffect(() => {
        loadEvents();
        checkSignInStatus();
    }, []);
    
    const checkSignInStatus = () => {
        // Check if contact person info exists in localStorage
        const storedContact = localStorage.getItem("contactPerson");
        if (storedContact) {
            try {
                const contactData = JSON.parse(storedContact);
                setContactPerson({
                    firstName: contactData.firstName || "",
                    lastName: contactData.lastName || "",
                    email: contactData.email || "",
                    phone: contactData.phone || ""
                });
                setIsSignedIn(true);
            } catch (err) {
                console.error("Error parsing contact person data:", err);
                setIsSignedIn(false);
            }
        } else {
            setIsSignedIn(false);
        }
    };
    
    const loadEvents = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/items");
            const result = await response.json();
            if (result.success) {
                setEvents(result.data);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (eventId, quantity) => {
        setQuantities(prev => ({ ...prev, [eventId]: Math.max(1, parseInt(quantity) || 1) }));
    };

    const openBookingModal = (event, quantity) => {
        // Check if user is signed in
        if (!isSignedIn) {
            const confirmSignIn = window.confirm("Please sign in to book tickets. Go to sign in page?");
            if (confirmSignIn) {
                navigate("/signin");
            }
            return;
        }
        
        setSelectedEvent(event);
        setBookingQuantity(quantity);
        
        // Initialize attendees array with empty forms
        const initialAttendees = Array(quantity).fill().map(() => ({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            specialRequests: ""
        }));
        
        setAttendees(initialAttendees);
        setShowModal(true);
        setBookingStatus({});
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedEvent(null);
        setAttendees([]);
    };

    const handleContactChange = (e) => {
        setContactPerson({
            ...contactPerson,
            [e.target.name]: e.target.value
        });
    };

    const handleAttendeeChange = (index, field, value) => {
        const updatedAttendees = [...attendees];
        updatedAttendees[index][field] = value;
        setAttendees(updatedAttendees);
    };
    
    // Auto-fill attendee with contact person info
    const fillAttendeeWithContactInfo = (index) => {
        if (window.confirm(`Use your contact information for Attendee ${index + 1}?`)) {
            const updatedAttendees = [...attendees];
            updatedAttendees[index] = {
                ...updatedAttendees[index],
                firstName: contactPerson.firstName,
                lastName: contactPerson.lastName,
                email: contactPerson.email,
                phone: contactPerson.phone
            };
            setAttendees(updatedAttendees);
        }
    };

    const submitBooking = async () => {
        // Validate contact person
        if (!contactPerson.firstName || !contactPerson.lastName || 
            !contactPerson.email || !contactPerson.phone) {
            setBookingStatus({ error: "Please fill in your contact information" });
            return;
        }

        // Validate email format
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(contactPerson.email)) {
            setBookingStatus({ error: "Please enter a valid email address" });
            return;
        }

        // Validate all attendees
        for (let i = 0; i < attendees.length; i++) {
            const attendee = attendees[i];
            if (!attendee.firstName || !attendee.lastName || 
                !attendee.email || !attendee.phone) {
                setBookingStatus({ error: `Please fill in all fields for attendee ${i + 1}` });
                return;
            }
            if (!emailRegex.test(attendee.email)) {
                setBookingStatus({ error: `Please enter a valid email for attendee ${i + 1}` });
                return;
            }
        }

        setBookingStatus({ loading: true });

        try {
            const response = await fetch("http://localhost:5000/api/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerEmail: contactPerson.email, // Use email to identify customer
                    eventId: selectedEvent._id,
                    attendees: attendees
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Booking failed");
            }

            setBookingStatus({
                success: true,
                ticketCode: result.data.ticketCode,
                message: `✅ Booking successful! Your ticket code: ${result.data.ticketCode}\nCheck your email for confirmation.`
            });

            // Refresh events to update seat count
            await loadEvents();

            setTimeout(() => {
                closeModal();
                setQuantities(prev => ({ ...prev, [selectedEvent._id]: 1 }));
            }, 5000);

        } catch (err) {
            console.error("Booking error:", err);
            setBookingStatus({ error: err.message || "Booking failed. Please try again." });
        } finally {
            setBookingStatus(prev => ({ ...prev, loading: false }));
        }
    };

    // Sign out function
    const handleSignOut = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            localStorage.removeItem("contactPerson");
            setIsSignedIn(false);
            setContactPerson({
                firstName: "",
                lastName: "",
                email: "",
                phone: ""
            });
        }
    };
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"  // Smooth scrolling animation
    });
};
    useEffect(() => {
        if (educationEvents.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => prev + 1);
        }, 4000);

        return () => clearInterval(interval);
    }, [educationEvents]);

    useEffect(() => {
        if (currentIndex === educationEvents.length) {
            setTimeout(() => {
                setCurrentIndex(0);
            }, 800);
        }
    }, [currentIndex, educationEvents.length]);

    const loopEvents = [...educationEvents, ...educationEvents];

    return (
        <div style={{ padding: "24px", fontFamily: "sans-serif" }} className="page-enter">
                <h1 className="EVENTIX">EVENTIX EDUCATION</h1>
            {educationEvents.length > 0 && (
                <div className="carousel">
                    <div className="carousel-track">
                        {loopEvents.map((event, index) => (
                            <div className="carousel-item" key={index}>
                                <img src={event.imageUrl} alt={event.name} />
                                <div className="carousel-title">
                                    {event.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && <p>Loading educational events...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && !error && educationEvents.length === 0 && (
                <p style={{ textAlign: "center", fontSize: "18px", marginTop: "40px" }}>
                    No educational events available at the moment.
                </p>
            )}

            {!isSignedIn && !loading && educationEvents.length > 0 && (
                <div style={{
                    backgroundColor: "#fff3cd",
                    color: "#856404",
                    padding: "15px",
                    borderRadius: "8px",
                    marginTop: "20px",
                    textAlign: "center",
                    border: "1px solid #ffeeba"
                }}>
                    <p style={{ margin: 0 }}>
                        ⚠️ Please <a href="/signin" style={{ fontWeight: "bold", color: "#007bff" }}>sign in</a> to book educational events.
                    </p>
                </div>
            )}

            {isSignedIn && !loading && educationEvents.length > 0 && (
                <div style={{
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    padding: "15px",
                    borderRadius: "8px",
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    border: "1px solid #c3e6cb"
                }}>
                    <p style={{ margin: 0 }}>
                        Connected as <strong>{contactPerson.firstName} {contactPerson.lastName}</strong>
                    </p>
                    <button
                        onClick={handleSignOut}
                        style={{
                            padding: "8px 12px",
                            border: "none",
                            borderRadius: "6px",
                            backgroundColor: "#155724",
                            color: "white",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Sign out
                    </button>
                </div>
            )}

            <div style={{
                display: "grid",
                gap: "16px",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                marginTop: "16px"
            }}>
                {educationEvents.map(event => (
                    <div key={event._id} className="event_card">
                        {event.imageUrl && (
                            <img 
                                src={event.imageUrl} 
                                alt={event.name} 
                                style={{
                                    width: "100%",
                                    height: "250px",
                                    objectFit: "cover",
                                    marginBottom: "12px",
                                }}
                                className="CardImg"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                }}
                            />
                        )}
                        
                        <h2 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", textAlign: "center", paddingLeft: "18px" }}>
                            {event.name}
                        </h2>
                        <p style={{ margin: "0 0 8px 0", color: "#555", paddingLeft: "18px" }}>
                            {event.description || "No description"}
                        </p>
                        
                        {/* Education Category Badge */}
                        <span style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            marginBottom: "10px",
                            marginLeft: "18px",
                            backgroundColor: "#e8f5e9",
                            color: "#2e7d32"
                        }}>
                            📚 EDUCATION
                        </span>
                        
                        <p style={{ margin: "8px 0", paddingLeft: "18px" }}>
                            <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p style={{ margin: "8px 0", paddingLeft: "18px" }}>
                            <strong>Time:</strong> {event.time}
                        </p>
                        <p style={{ margin: "8px 0", paddingLeft: "18px" }}>
                            <strong>Location:</strong> {event.venue}, {event.city}
                        </p>
                        <p style={{ margin: "8px 0", paddingLeft: "18px" }}>
                            <strong>Price:</strong> {event.price} DH
                        </p>
                        <p style={{ margin: "8px 0", paddingLeft: "18px" }}>
                            <strong>Available seats:</strong> 
                            <span style={{ 
                                color: event.availableSeats < 10 ? "red" : "green", 
                                marginLeft: "5px" 
                            }}>
                                {event.availableSeats}
                            </span>
                        </p>

                        {event.availableSeats > 0 && (
                            <div style={{ margin: "10px 0", paddingLeft: "18px" }}>
                                <label style={{ marginRight: "10px" }}>Quantity:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={Math.min(event.availableSeats, 10)}
                                    value={quantities[event._id] || 1}
                                    onChange={(e) => updateQuantity(event._id, e.target.value)}
                                    style={{
                                        width: "70px",
                                        padding: "5px",
                                        borderRadius: "4px",
                                        border: "1px solid #ccc",
                                        textAlign: "center"
                                    }}
                                />
                            </div>
                        )}

                        <button
                            onClick={() => {
                                openBookingModal(event, quantities[event._id] || 1);
                                scrollToTop();
                            }}
                            disabled={event.availableSeats === 0}
                            style={{
                                width: "100%",
                                marginTop: "auto",
                                padding: "10px",
                                backgroundColor: event.availableSeats === 0 ? "#ccc" : "#2e7d32",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: event.availableSeats === 0 ? "not-allowed" : "pointer",
                                fontWeight: "bold",
                                fontSize: "14px",
                            }}
                        >
                            {event.availableSeats === 0 ? "Sold out" : `Book ${quantities[event._id] || 1} ticket(s)`}
                        </button>
                    </div>
                ))}
            </div>

            {/* Booking Modal */}
            {showModal && selectedEvent && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                    overflowY: "auto",
                }}>
                    <div style={{
                        backgroundColor: "white",
                        padding: "30px",
                        width: "600px",
                        maxWidth: "90%",
                        borderRadius: "12px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "15px"
                        }}>
                            <h2 style={{ margin: 0 }}>Complete Your Educational Event Booking</h2>
                            <button className="Xbutton"
                                onClick={closeModal}
                                disabled={bookingStatus.loading}
                            >
                                X
                            </button>
                        </div>
                        
                        <div style={{
                            backgroundColor: "#f8f9fa",
                            padding: "15px",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}>
                            <p><strong>Event:</strong> {selectedEvent.name}</p>
                            <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {selectedEvent.time}</p>
                            <p><strong>Venue:</strong> {selectedEvent.venue}, {selectedEvent.city}</p>
                            <p><strong>Quantity:</strong> {bookingQuantity} ticket(s)</p>
                            <p><strong>Total Price:</strong> {selectedEvent.price * bookingQuantity} DH</p>
                        </div>

                        <hr style={{ margin: "20px 0" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <h3 style={{ margin: 0 }}>📋 Contact Person (Main contact)</h3>
                            {isSignedIn && (
                                <span style={{
                                    fontSize: "12px",
                                    backgroundColor: "#d4edda",
                                    color: "#155724",
                                    padding: "4px 8px",
                                    borderRadius: "12px"
                                }}>
                                    ✓ Auto-filled from your profile
                                </span>
                            )}
                        </div>
                        
                        <div style={{ marginBottom: "20px" }}>
                            <input
                                name="firstName"
                                placeholder="First Name *"
                                onChange={handleContactChange}
                                value={contactPerson.firstName}
                                readOnly={isSignedIn}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    marginBottom: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    boxSizing: "border-box",
                                    backgroundColor: isSignedIn ? "#f8f9fa" : "white",
                                    cursor: isSignedIn ? "not-allowed" : "text"
                                }}
                            />
                            <input
                                name="lastName"
                                placeholder="Last Name *"
                                onChange={handleContactChange}
                                value={contactPerson.lastName}
                                readOnly={isSignedIn}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    marginBottom: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    boxSizing: "border-box",
                                    backgroundColor: isSignedIn ? "#f8f9fa" : "white",
                                    cursor: isSignedIn ? "not-allowed" : "text"
                                }}
                            />
                            <input
                                name="email"
                                placeholder="Email *"
                                onChange={handleContactChange}
                                value={contactPerson.email}
                                readOnly={isSignedIn}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    marginBottom: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    boxSizing: "border-box",
                                    backgroundColor: isSignedIn ? "#f8f9fa" : "white",
                                    cursor: isSignedIn ? "not-allowed" : "text"
                                }}
                            />
                            <input
                                name="phone"
                                placeholder="Phone *"
                                onChange={handleContactChange}
                                value={contactPerson.phone}
                                readOnly={isSignedIn}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    marginBottom: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    boxSizing: "border-box",
                                    backgroundColor: isSignedIn ? "#f8f9fa" : "white",
                                    cursor: isSignedIn ? "not-allowed" : "text"
                                }}
                            />
                            {!isSignedIn && (
                                <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                                    💡 Tip: <a href="/signin" style={{ color: "#007bff" }}>Sign in</a> to save your info for future bookings!
                                </p>
                            )}
                        </div>

                        <hr style={{ margin: "20px 0" }} />

                        <h3>👥 Attendees Information</h3>
                        {attendees.map((attendee, index) => (
                            <div key={index} style={{
                                border: "1px solid #ddd",
                                padding: "15px",
                                marginBottom: "15px",
                                borderRadius: "8px",
                                backgroundColor: "#fafafa"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <h4 style={{ margin: 0, color: "#2e7d32" }}>Attendee {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => fillAttendeeWithContactInfo(index)}
                                        style={{
                                            padding: "4px 8px",
                                            backgroundColor: "#28a745",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "12px"
                                        }}
                                    >
                                        Use My Info
                                    </button>
                                </div>
                                <input
                                    placeholder="First Name *"
                                    value={attendee.firstName}
                                    onChange={(e) => handleAttendeeChange(index, "firstName", e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        marginBottom: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        boxSizing: "border-box"
                                    }}
                                />
                                <input
                                    placeholder="Last Name *"
                                    value={attendee.lastName}
                                    onChange={(e) => handleAttendeeChange(index, "lastName", e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        marginBottom: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        boxSizing: "border-box"
                                    }}
                                />
                                <input
                                    placeholder="Email *"
                                    value={attendee.email}
                                    onChange={(e) => handleAttendeeChange(index, "email", e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        marginBottom: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        boxSizing: "border-box"
                                    }}
                                />
                                <input
                                    placeholder="Phone *"
                                    value={attendee.phone}
                                    onChange={(e) => handleAttendeeChange(index, "phone", e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        marginBottom: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        boxSizing: "border-box"
                                    }}
                                />
                                <textarea
                                    placeholder="Special Requests (Optional)"
                                    value={attendee.specialRequests || ""}
                                    onChange={(e) => handleAttendeeChange(index, "specialRequests", e.target.value)}
                                    rows="2"
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        boxSizing: "border-box",
                                        fontFamily: "inherit"
                                    }}
                                />
                            </div>
                        ))}

                        {bookingStatus.error && (
                            <div style={{
                                backgroundColor: "#f8d7da",
                                color: "#721c24",
                                padding: "10px",
                                borderRadius: "6px",
                                marginBottom: "15px"
                            }}>
                                ❌ {bookingStatus.error}
                            </div>
                        )}
                        
                        {bookingStatus.success && (
                            <div style={{
                                backgroundColor: "#d4edda",
                                color: "#155724",
                                padding: "10px",
                                borderRadius: "6px",
                                marginBottom: "15px"
                            }}>
                                {bookingStatus.message}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                            <button
                                onClick={closeModal}
                                disabled={bookingStatus.loading}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitBooking}
                                disabled={bookingStatus.loading}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    backgroundColor: bookingStatus.loading ? "#ccc" : "#2e7d32",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: bookingStatus.loading ? "not-allowed" : "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                {bookingStatus.loading ? "Processing..." : "Confirm Booking"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Education;
