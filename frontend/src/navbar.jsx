import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { useState, useEffect, useRef, useContext } from "react";
import Chatbot from "./Chatbot";
import { AuthContext } from "./context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
=======
import { useState, useEffect, useRef, useCallback } from "react";
import Chatbot from "./Chatbot"; // Import your Chatbot component
import { getUserRole } from "./auth";

const Navbar = () => {
    const navigate = useNavigate();
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [userName, setUserName] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showChatbot, setShowChatbot] = useState(false); // State for chatbot visibility
    const [userRole, setUserRole] = useState("customer");
    const dropdownRef = useRef(null);
    const chatbotRef = useRef(null); // Ref for chatbot container
    const [userEmail, setUserEmail] = useState(null);
>>>>>>> 032f871 (Ajout du projet PFE complet)

  const isSignedIn = Boolean(user);
  const isAdmin = Boolean(user && (user?.role?.toLowerCase() === "admin" || user?.isAdmin));
  const isOrganizer = Boolean(user && (user?.role?.toLowerCase() === "organizer"));
  const userName = user?.firstName || user?.name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const dropdownRef = useRef(null);
  const chatbotRef = useRef(null);

  // CHECK USER FROM LOCALSTORAGE
  useEffect(() => {
    const handleStorage = () => {
      if (!user) {
        setShowDropdown(false);
        setShowChatbot(false);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      console.log("USER FROM CONTEXT:", user);
    };
  }, [user]);

  // CLOSE DROPDOWN IF CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }

      if (
        chatbotRef.current &&
        !chatbotRef.current.contains(event.target)
      ) {
        setShowChatbot(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const buttonStyle = {
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.28)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "999px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };

<<<<<<< HEAD
  const handleHover = (e, enter) => {
    e.currentTarget.style.background = enter
      ? "rgba(255,255,255,0.28)"
      : "rgba(255,255,255,0.18)";
  };
=======
    // Use useCallback to ensure the function reference is stable
    const checkSignInStatus = useCallback(() => {
        const storedContact = localStorage.getItem("contactPerson");
        console.log("Checking sign-in status:", storedContact); // Debug log
        
        if (storedContact) {
            try {
                const contactData = JSON.parse(storedContact);
                console.log("Parsed contact data:", contactData); // Debug log
                setUserName(contactData.firstName || "User");
                setUserRole(getUserRole(contactData));
                setIsSignedIn(true);
            } catch (err) {
                console.error("Error parsing contact person data:", err);
                setIsSignedIn(false);
                setUserName("");
                setUserRole("customer");
            }
        } else {
            console.log("No contact person found in localStorage"); // Debug log
            setIsSignedIn(false);
            setUserName("");
            setUserRole("customer");
        }
    }, []);
>>>>>>> 032f871 (Ajout du projet PFE complet)

  const handleUserButtonClick = () => {
    if (isSignedIn) {
      setShowDropdown(!showDropdown);
    } else {
      navigate("/signin");
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

<<<<<<< HEAD
  return (
    <>
      <nav
        style={{
          background: "linear-gradient(135deg, #6a00f4 0%, #9b4dff 100%)",
          padding: "14px 24px",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* LEFT BUTTONS */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              style={buttonStyle}
              onClick={() => navigate("/music")}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
=======
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            // Close chatbot when clicking outside (optional)
            if (chatbotRef.current && !chatbotRef.current.contains(event.target) && showChatbot) {
                setShowChatbot(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('storage', checkSignInStatus);
            window.removeEventListener('signInStatusChanged', checkSignInStatus);
            window.removeEventListener('focus', checkSignInStatus);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [checkSignInStatus, showChatbot]);

    const buttonStyle = {
        background: 'rgba(255,255,255,0.18)',
        border: '1px solid rgba(255,255,255,0.28)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '999px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    };

    const handleHover = (e, enter) => {
        e.currentTarget.style.background = enter
            ? 'rgba(255,255,255,0.28)'
            : 'rgba(255,255,255,0.18)';
        e.currentTarget.style.transform = enter
            ? 'translateY(-1px)'
            : 'translateY(0)';
    };

    const handleUserButtonClick = () => {
        if (isSignedIn) {
            setShowDropdown(!showDropdown);
        } else {
            navigate('/signin');
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleLogout = () => {
        // Remove user data from localStorage
        localStorage.removeItem("contactPerson");
        
        // Reset state immediately
        setIsSignedIn(false);
        setUserName("");
        setUserRole("customer");
        setShowDropdown(false);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('signInStatusChanged'));
        
        // Navigate to home page
        navigate('/');
    };

    const toggleChatbot = () => {
        setShowChatbot(!showChatbot);
        // Close dropdown if open
        if (showDropdown) setShowDropdown(false);
    };

    return (
        <>
            <nav
                style={{
                    background: 'linear-gradient(135deg, #6a00f4 0%, #9b4dff 100%)',
                    padding: '14px 24px',
                    color: '#fff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
>>>>>>> 032f871 (Ajout du projet PFE complet)
            >
              Music Events
            </button>

            <button
              style={buttonStyle}
              onClick={() => navigate("/cinema")}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
            >
              Cinema
            </button>

            <button
              style={buttonStyle}
              onClick={() => navigate("/education")}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
            >
              Educational
            </button>

<<<<<<< HEAD
            {isAdmin ? (
              <button
                style={buttonStyle}
                onClick={() => navigate("/AdminDashboard")}
                onMouseEnter={(e) => handleHover(e, true)}
                onMouseLeave={(e) => handleHover(e, false)}
              >
                Dashboard
              </button>
            ) : null}
=======
                        {isSignedIn && userRole === "admin" && (
                            <button
                                style={buttonStyle}
                                onClick={() => navigate('/dashboard')}
                                onMouseEnter={(e) => handleHover(e, true)}
                                onMouseLeave={(e) => handleHover(e, false)}
                            >
                                Admin Dashboard
                            </button>
                        )}

                        {isSignedIn && ["admin", "organizer"].includes(userRole) && (
                            <>
                            <button
                                style={buttonStyle}
                                onClick={() => navigate('/organizer-dashboard')}
                                onMouseEnter={(e) => handleHover(e, true)}
                                onMouseLeave={(e) => handleHover(e, false)}
                            >
                                Organizer
                            </button>
                            <button
                                style={buttonStyle}
                                onClick={() => navigate('/organizer/create')}
                                onMouseEnter={(e) => handleHover(e, true)}
                                onMouseLeave={(e) => handleHover(e, false)}
                            >
                                Create Event
                            </button>
                            </>
                        )}
                    </div>
                    
                    {/* Logo */}
                    <div
                        style={{
                            fontSize: '1.8rem',
                            fontWeight: '900',
                            letterSpacing: '1.2px',
                            textTransform: 'uppercase',
                            marginRight:  "230px",
                            marginLeft: isSignedIn ? "185px":"",
                            cursor: "pointer"
                        }}
                        onClick={() => navigate('/')}
                    >
                        EVENTIX
                    </div>
>>>>>>> 032f871 (Ajout du projet PFE complet)

             {isOrganizer ? (
              <button
                style={buttonStyle}
                onClick={() => navigate("/OrganizerDashboard")}
                onMouseEnter={(e) => handleHover(e, true)}
                onMouseLeave={(e) => handleHover(e, false)}
              >
                Dashboard
              </button>
            ) : null}

<<<<<<< HEAD
=======
                        {!isSignedIn && (
                            <button
                                style={buttonStyle}
                                onMouseEnter={(e) => handleHover(e, true)}
                                onMouseLeave={(e) => handleHover(e, false)}
                                onClick={handleLoginClick}
                            >
                                Login
                            </button>
                        )}

                        {/* Sign In / User Name Button with Dropdown */}
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                style={{
                                    ...buttonStyle,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: isSignedIn ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.18)',
                                }}
                                onMouseEnter={(e) => handleHover(e, true)}
                                onMouseLeave={(e) => handleHover(e, false)}
                                onClick={handleUserButtonClick}
                            >
                                {isSignedIn ? (
                                    <>
                                        <span style={{ fontSize: '16px' }}>👤</span>
                                        <span>{userName}</span>
                                        <span style={{ 
                                            fontSize: '12px', 
                                            marginLeft: '4px',
                                            transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease'
                                        }}>
                                            ▼
                                        </span>
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
>>>>>>> 032f871 (Ajout du projet PFE complet)

            {isAdmin ? (
              <button
                style={buttonStyle}
                onClick={() => navigate("/demandes")}
                onMouseEnter={(e) => handleHover(e, true)}
                onMouseLeave={(e) => handleHover(e, false)}
              >
                Demandes
              </button>
            ) : null}
          </div>

          {/* LOGO */}
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: "900",
              letterSpacing: "1.2px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            EVENTIX
          </div>

          {/* RIGHT SIDE */}
          <div style={{ display: "flex", gap: "12px" }}>
            {/* CHATBOT */}
            {isSignedIn && (
              <button
                style={buttonStyle}
                onClick={() => setShowChatbot(!showChatbot)}
                onMouseEnter={(e) => handleHover(e, true)}
                onMouseLeave={(e) => handleHover(e, false)}
              >
                💬 AI Assistant
              </button>
            )}

            {/* USER BUTTON */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                style={buttonStyle}
                onClick={handleUserButtonClick}
                onMouseEnter={(e) => handleHover(e, true)}
                onMouseLeave={(e) => handleHover(e, false)}
              >
                {isSignedIn ? `👤 ${userName}` : "Sign In"}
              </button>

              {showDropdown && isSignedIn && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    right: 0,
                    background: "white",
                    borderRadius: "10px",
                    minWidth: "180px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #eee",
                      color: "#333",
                    }}
                  >
                    <strong>{userName}</strong>
                    <br />
                    <small>{userEmail}</small>
                  </div>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      border: "none",
                      background: "white",
                      padding: "12px",
                      cursor: "pointer",
                      color: "red",
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* CHATBOT */}
      {showChatbot && (
        <div
          ref={chatbotRef}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 9999,
          }}
        >
          <Chatbot userEmail={userEmail} />
        </div>
      )}
    </>
  );
};

export default Navbar;