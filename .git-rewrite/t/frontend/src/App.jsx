import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";  // Add this import

import Events from "./events.jsx";
import Footer from "./footer.jsx";
import Navbar from "./navbar.jsx";
import Music from "./music.jsx";
import Cinema from "./cinema.jsx";
import Education from "./education.jsx";
import SignIn from "./signin.jsx";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import "./App.css";
import OrganizerSignIn from "./OrganizerSignIn.jsx";
import Demandes from "./Demandes.jsx";
import AdminDemandes from "./AdmineDemandes.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <AuthProvider>  {/* Add this wrapper */}
            <BrowserRouter>
                <div className="App">
                    <Navbar />

                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Events />} />
                        <Route path="/events" element={<Events />} />
                        <Route path="/music" element={<Music />} />
                        <Route path="/cinema" element={<Cinema />} />
                        <Route path="/education" element={<Education />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/organizer-signin" element={<OrganizerSignIn />} />
                        <Route path="/demandes" element={<Demandes />} />
                        <Route path="/organizer-signin-demandes" element={<AdminDemandes />} />
                        {/* Protected route (logged-in users only) */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>

                    <Footer />
                </div>
            </BrowserRouter>
        </AuthProvider>  
    );
}

export default App;