import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

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
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerCreate from "./pages/OrganizerCreate";
import OrganizerAddEvent from "./addEvent";
import AdminEventDemandes from "./AdminEventDemandes";
import CheckoutPage from "./components/CheckoutPage";

function App() {
    return (
        <AuthProvider>
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
                        <Route path="/organizer/add-event" element={<OrganizerAddEvent />} />
                        <Route path="/events-demandes" element={<AdminEventDemandes />} />
                        <Route path="/checkout" element={<CheckoutPage />} />

                        {/* Protected routes (logged-in users only) */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route 
                            path="/organizer-dashboard" 
                            element={
                                <ProtectedRoute allowedRoles={["admin", "organizer"]}>
                                    <OrganizerDashboard />
                                </ProtectedRoute>
                            } 
                        />

                        <Route 
                            path="/organizer/create" 
                            element={
                                <ProtectedRoute allowedRoles={["admin", "organizer"]}>
                                    <OrganizerCreate />
                                </ProtectedRoute>
                            } 
                        />

                        {/* Catch all - 404 redirect to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>

                    <Footer />
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;