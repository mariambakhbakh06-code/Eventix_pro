import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Chatbot from "./Chatbot";
import { AuthContext } from "./context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useContext(AuthContext);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const dropdownRef = useRef(null);
  const chatbotRef = useRef(null);

  const isSignedIn = Boolean(user);

  const isAdmin = Boolean(
    user && (user?.role?.toLowerCase() === "admin" || user?.isAdmin)
  );

  const isOrganizer = Boolean(
    user && user?.role?.toLowerCase() === "organizer"
  );

  const userName =
    user?.firstName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const userEmail = user?.email || "";

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
    };
  }, [user]);

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

  const navButtonStyle = (path) => ({
    background:
      location.pathname === path
        ? "rgba(255,255,255,0.15)"
        : "transparent",
    border: "none",
    color: "#fff",
    padding: "14px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bolder",
    fontSize: "15px",
    transition: "all .25s ease",
  });

  const handleHover = (e, enter) => {
    e.currentTarget.style.transform = enter
      ? "translateY(-2px)"
      : "translateY(0)";

    e.currentTarget.style.background = enter
      ? "rgba(255,255,255,.12)"
      : e.currentTarget.dataset.active === "true"
      ? "rgba(255,255,255,.15)"
      : "transparent";
  };

  // Neon button style (same as E logo)
  const neonButtonStyle = {
    background: "linear-gradient(135deg, #ff00cc, #6a00f4)",
    border: "none",
    color: "#fff",
    padding: "10px 22px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    transition: "all 0.3s ease",
    boxShadow: "0 0 15px rgba(255, 0, 204, 0.4)",
    whiteSpace: "nowrap",
  };

  const neonButtonHoverStyle = {
    transform: "translateY(-2px)",
    boxShadow: "0 0 25px rgba(255, 0, 204, 0.6)",
  };

  const handleUserButtonClick = () => {
    if (isSignedIn) {
      setShowDropdown((prev) => !prev);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  // Neon button component with hover effect
  const NeonButton = ({ onClick, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <button
        onClick={onClick}
        style={{
          ...neonButtonStyle,
          ...(isHovered ? neonButtonHoverStyle : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </button>
    );
  };

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5000,
          background: "rgba(15,15,30,0.8)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "14px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* LEFT COLUMN - Logo (Fixed width: 200px) */}
          <div
            style={{
              flex: "0 0 200px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={() => navigate("/")}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg,#ff00cc,#6a00f4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "900",
                fontSize: "22px",
                color: "#fff",
                boxShadow:
                  "0 0 25px rgba(255,0,204,.35)",
              }}
            >
              E
            </div>

            <span
              style={{
                color: "#fff",
                fontSize: "1.8rem",
                fontWeight: "900",
                letterSpacing: "2px",
              }}
            >
              EVENTIX
            </span>
          </div>

          {/* CENTER COLUMN - Navigation (Flexible, centered) */}
          <div
            style={{
              flex: "1 1 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <button
              data-active={location.pathname === "/music"}
              style={navButtonStyle("/music")}
              onClick={() => navigate("/music")}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
            >
              Music
            </button>

            <button
              data-active={location.pathname === "/cinema"}
              style={navButtonStyle("/cinema")}
              onClick={() => navigate("/cinema")}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
            >
              Cinema
            </button>

            <button
              data-active={location.pathname === "/education"}
              style={navButtonStyle("/education")}
              onClick={() => navigate("/education")}
              onMouseEnter={(e) => handleHover(e, true)}
              onMouseLeave={(e) => handleHover(e, false)}
            >
              Education
            </button>

            {isAdmin && (
              <>
                <button
                  style={navButtonStyle("/dashboard")}
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </button>

                <button
                  style={navButtonStyle("/demandes")}
                  onClick={() => navigate("/demandes")}
                >
                  Demandes
                </button>
              </>
            )}

            {isOrganizer && (
              <>
                <button
                  style={navButtonStyle("/organizer-dashboard")}
                  onClick={() =>
                    navigate("/organizer-dashboard")
                  }
                >
                  Organizer
                </button>

                <button
                  style={navButtonStyle("/organizer/add-event")}
                  onClick={() =>
                    navigate("/organizer/add-event")
                  }
                >
                  Add Event
                </button>
              </>
            )}
          </div>

          {/* RIGHT COLUMN - Actions (Fixed width: 200px) */}
          <div
            style={{
              flex: "0 0 200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            {isSignedIn ? (
              <>
                {/* Show AI Assistant for signed-in users */}
                <button
                  onClick={() =>
                    setShowChatbot((prev) => !prev)
                  }
                  style={{
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "700",
                    padding: "10px 18px",
                    borderRadius: "14px",
                    background:
                      "linear-gradient(135deg,#ff00cc,#6a00f4)",
                    boxShadow:
                      "0 0 15px rgba(255,0,204,.35)",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 0 25px rgba(255,0,204,.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(255,0,204,.35)";
                  }}
                >
                  ✨ AI Assistant
                </button>

                {/* User dropdown */}
                <div
                  style={{ position: "relative" }}
                  ref={dropdownRef}
                >
                  <button
                    onClick={handleUserButtonClick}
                    style={{
                      background: "rgba(255,255,255,.08)",
                      border:
                        "1px solid rgba(255,255,255,.1)",
                      color: "#fff",
                      padding: "10px 18px",
                      borderRadius: "14px",
                      cursor: "pointer",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                    }}
                  >
                    👤 {userName.length > 10 ? userName.slice(0, 10) + "..." : userName}
                  </button>

                  {showDropdown && isSignedIn && (
                    <div
                      style={{
                        position: "absolute",
                        top: "120%",
                        right: 0,
                        minWidth: "240px",
                        background:
                          "rgba(255,255,255,.97)",
                        borderRadius: "18px",
                        overflow: "hidden",
                        boxShadow:
                          "0 20px 45px rgba(0,0,0,.15)",
                      }}
                    >
                      <div
                        style={{
                          padding: "16px",
                          borderBottom:
                            "1px solid #eaeaea",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            color: "#222",
                          }}
                        >
                          {userName}
                        </div>

                        <div
                          style={{
                            fontSize: "13px",
                            color: "#666",
                            marginTop: "4px",
                          }}
                        >
                          {userEmail}
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          border: "none",
                          background: "#fff",
                          padding: "14px",
                          cursor: "pointer",
                          color: "#e53935",
                          fontWeight: "600",
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Sign In button (neon style) */}
                <NeonButton onClick={() => navigate("/signin")}>
                  Sign In
                </NeonButton>

                {/* Login button (neon style) */}
                <NeonButton onClick={() => navigate("/login")}>
                  Login
                </NeonButton>
              </>
            )}
          </div>
        </div>
      </nav>

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