import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import SalesChart from "../components/SalesChart";
import ReservationChart from "../components/ReservationChart";
import RecentReservations from "../components/RecentReservation";
import { salesData, reservationData, recentReservations } from "../data/dashboardData";
import "./Dashboard.css";

import {
  FaMoneyBillWave,
  FaUsers,
  FaTicketAlt,
  FaCalendarAlt,
  FaChartLine
} from "react-icons/fa";

const fallbackStats = {
  totalSales: 25000,
  participants: 540,
  reservations: 320,
  activeEvents: 12
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString("fr-FR")} DH`;

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    stats: fallbackStats,
    salesData,
    reservationData,
    recentReservations
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Impossible de charger le dashboard");
        }

        setDashboard({
          stats: result.data.stats,
          salesData: result.data.salesData.length ? result.data.salesData : salesData,
          reservationData: result.data.reservationData.length ? result.data.reservationData : reservationData,
          recentReservations: result.data.recentReservations.length ? result.data.recentReservations : recentReservations
        });
      } catch (err) {
        setError("Donnees demo affichees: backend non disponible.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const { stats } = dashboard;

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Vue generale</p>
          <h1>Dashboard Admin</h1>
          <p className="dashboard-subtitle">
            Suivez les ventes, les reservations et l'activite des evenements en temps reel.
          </p>
        </div>

        <div className="dashboard-action">
          <FaChartLine />
          <span>{loading ? "Chargement..." : "Donnees actualisees"}</span>
        </div>
      </section>

      {error && <div className="dashboard-alert">{error}</div>}

      <section className="stats-grid">
        <StatCard
          title="Ventes Totales"
          value={formatMoney(stats.totalSales)}
          icon={<FaMoneyBillWave />}
          tone="emerald"
          trend="Total"
          description="revenu confirme"
        />

        <StatCard
          title="Participants"
          value={stats.participants}
          icon={<FaUsers />}
          tone="blue"
          trend="Places"
          description="tickets reserves"
        />

        <StatCard
          title="Reservations"
          value={stats.reservations}
          icon={<FaTicketAlt />}
          tone="amber"
          trend="Total"
          description="reservations valides"
        />

        <StatCard
          title="Evenements actifs"
          value={stats.activeEvents}
          icon={<FaCalendarAlt />}
          tone="violet"
          trend="Actifs"
          description="date future + places"
        />
      </section>

      <section className="dashboard-grid">
        <SalesChart data={dashboard.salesData} />
        <ReservationChart data={dashboard.reservationData} />
      </section>

      <section className="dashboard-table-section">
        <RecentReservations reservations={dashboard.recentReservations} />
      </section>
    </main>
  );
}
