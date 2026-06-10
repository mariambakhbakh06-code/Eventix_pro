import { useEffect, useState } from "react";

const AdminDemandes = () => {

    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDemandes = async () => {
        try {
            setLoading(true);
            setError("");
            
            const res = await fetch(
                "http://localhost:5000/api/organizers/pending"
            );

            const data = await res.json();

            // Fix: Access the data property from the response
            if (data.success && Array.isArray(data.data)) {
                setDemandes(data.data);
            } else if (Array.isArray(data)) {
                // Fallback in case API returns array directly
                setDemandes(data);
            } else {
                console.error("Unexpected response format:", data);
                setDemandes([]);
                setError("Invalid response format from server");
            }

        } catch (err) {
            console.error("Error fetching demandes:", err);
            setError("Failed to load organizer requests");
            setDemandes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemandes();
    }, []);

    const handleAccept = async (id) => {
        try {
            const res = await fetch(
                `http://localhost:5000/api/organizers/${id}/accept`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await res.json();

            if (data.success) {
                // Remove the accepted demande from the list
                setDemandes((prev) =>
                    prev.filter((item) => item._id !== id)
                );
                alert("Organizer request accepted successfully!");
            } else {
                alert(data.message || "Failed to accept request");
            }

        } catch (err) {
            console.error("Error accepting demande:", err);
            alert("Error accepting request. Please try again.");
        }
    };

    const handleRefuse = async (id) => {
        // Optional: Ask for a reason before refusing
        const reason = prompt("Please provide a reason for refusing this request (optional):");
        
        try {
            const res = await fetch(
                `http://localhost:5000/api/organizers/${id}/refuse`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ reason: reason || "" })
                }
            );

            const data = await res.json();

            if (data.success) {
                // Remove the refused demande from the list
                setDemandes((prev) =>
                    prev.filter((item) => item._id !== id)
                );
                alert("Organizer request refused successfully!");
            } else {
                alert(data.message || "Failed to refuse request");
            }

        } catch (err) {
            console.error("Error refusing demande:", err);
            alert("Error refusing request. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="admin-demandes">
                <h1>Organizer Requests</h1>
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-demandes">
                <h1>Organizer Requests</h1>
                <div className="error-message">
                    <p>❌ {error}</p>
                    <button onClick={fetchDemandes}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-demandes">
            <h1>Organizer Requests</h1>
            
            {demandes.length === 0 ? (
                <div className="no-requests">
                    <p>✅ No pending requests</p>
                    <p>All organizer requests have been processed.</p>
                </div>
            ) : (
                <div className="demandes-grid">
                    {demandes.map((demande) => (
                        <div key={demande._id} className="demande-card">
                            <div className="demande-header">
                                <img 
                                    src={demande.photo} 
                                    alt={demande.name}
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/120?text=No+Image";
                                    }}
                                />
                                <h2>{demande.name}</h2>
                            </div>
                            
                            <div className="demande-details">
                                <p><strong>Email:</strong> {demande.email}</p>
                                <p><strong>Phone:</strong> {demande.phone}</p>
                                <p><strong>Address:</strong> {demande.address}</p>
                                <p><strong>Rooms:</strong> {demande.rooms}</p>
                                <p><strong>Earnings:</strong> {demande.earnings}%</p>
                                <p><strong>Status:</strong> 
                                    <span className="status-pending">{demande.status}</span>
                                </p>
                                <p><strong>Requested:</strong> {new Date(demande.createdAt).toLocaleDateString()}</p>
                            </div>
                            
                            <div className="buttons">
                                <button 
                                    className="accept-btn"
                                    onClick={() => handleAccept(demande._id)}
                                >
                                    ✓ Accept
                                </button>
                                <button 
                                    className="refuse-btn"
                                    onClick={() => handleRefuse(demande._id)}
                                >
                                    ✗ Refuse
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDemandes;