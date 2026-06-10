import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import Chatbot from "./Chatbot";
import { AuthContext } from "./context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

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

  const handleHover = (e, enter) => {
    e.currentTarget.style.background = enter
      ? "rgba(255,255,255,0.28)"
      : "rgba(255,255,255,0.18)";
  };

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