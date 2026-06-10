import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaChartLine,
  FaDoorOpen,
  FaMoneyBillWave,
  FaSearch,
  FaTicketAlt,
  FaTrophy,
  FaWallet
} from "react-icons/fa";
import StatCard from "../components/StatCard";
import "./Dashboard.css";
import { getCurrentUser } from "../auth";

const formatMoney = (value) => `${Number(value || 0).toLocaleString("fr-FR")} DH`;

const emptyDashboard = {
  stats: {
    eventCount: 0,
    roomCount: 0,
    totalEventRevenue: 0,
    totalAppRevenue: 0,
    soldTickets: 0,
    commissionRate: 0.1
  },
  events: [],
  monthlySuccess: [],
  topEvents: []
};

export default function OrganizerDashboard() {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const user = getCurrentUser();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const loadOrganizerDashboard = async () => {
      try {
        const params = new URLSearchParams({
          role: user?.role || "customer",
          email: user?.email || "",
          organizerName: user?.organizerName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
        });

        const response = await fetch(`http://localhost:5000/api/organizer-dashboard?${params.toString()}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Impossible de charger le dashboard organisateur");
        }

        setDashboard(result.data);
      } catch (err) {
        setError(err.message || "Backend non disponible.");
      } finally {
        setLoading(false);
      }
    };

    loadOrganizerDashboard();
  }, [user?.email, user?.firstName, user?.lastName, user?.organizerName, user?.role]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return dashboard.events;

    return dashboard.events.filter((event) =>
      [event.name, event.room, event.city]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [dashboard.events, search]);

  const maxMonthlyRevenue = Math.max(
    ...dashboard.monthlySuccess.map((month) => month.eventRevenue),
    1
  );

  return (
    <main className="dashboard-page organizer-dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">{isAdmin ? "Admin + Organisateur" : "Espace organisateur"}</p>
          <h1>Dashboard Organisateur</h1>
          <p className="dashboard-subtitle">
            Analysez les salles, les evenements, le revenu de chaque event et le succes gagne par EVENTIX.
          </p>
        </div>

        <div className="dashboard-action">
          <FaChartLine />
          <span>{loading ? "Chargement..." : "Dashboard pret"}</span>
        </div>
      </section>

      {error && <div className="dashboard-alert">{error}</div>}

      <section className="stats-grid">
        <StatCard
          title="Evenements"
          value={dashboard.stats.eventCount}
          icon={<FaCalendarAlt />}
          tone="blue"
          trend="Events"
          description="attaches a ce compte"
        />
        <StatCard
          title="Nombre des salles"
          value={dashboard.stats.roomCount}
          icon={<FaDoorOpen />}
          tone="violet"
          trend="Salles"
          description="salles utilisees"
        />
        <StatCard
          title="Rbah net event"
          value={formatMoney(dashboard.stats.totalEventRevenue)}
          icon={<FaMoneyBillWave />}
          tone="emerald"
          trend="Organisateur"
          description="prix reussi par les events"
        />
        <StatCard
          title="Succes application"
          value={formatMoney(dashboard.stats.totalAppRevenue)}
          icon={<FaWallet />}
          tone="amber"
          trend={`${Math.round((dashboard.stats.commissionRate || 0) * 100)}%`}
          description="part gagnee par EVENTIX"
        />
      </section>

      <section className="organizer-toolbar dashboard-card">
        <div>
          <p className="card-kicker">Recherche</p>
          <h2>Trouver un event ou une salle</h2>
        </div>
        <label className="organizer-search">
          <FaSearch />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par event, salle ou ville"
          />
        </label>
      </section>

      <section className="organizer-grid">
        <article className="dashboard-card organizer-events-card">
          <div className="card-header">
            <div>
              <p className="card-kicker">Card event</p>
              <h2>Liste des events et salles</h2>
            </div>
            <span className="status-pill status-pill-blue">{filteredEvents.length} events</span>
          </div>

          <div className="organizer-event-list">
            {filteredEvents.length === 0 && (
              <p className="empty-state">Aucun event trouve.</p>
            )}

            {filteredEvents.map((event) => (
              <div className="organizer-event-row" key={event._id || event.id}>
                <div>
                  <strong>{event.name}</strong>
                  <span>{event.room} - {event.city}</span>
                </div>
                <div className="event-row-metrics">
                  <span><FaTicketAlt /> {event.soldTickets} tickets</span>
                  <strong>{formatMoney(event.eventRevenue)}</strong>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card net-profit-card">
          <div className="card-header">
            <div>
              <p className="card-kicker">Card rbah.net</p>
              <h2>Succes des revenus</h2>
            </div>
            <span className="status-pill status-pill-green">Net</span>
          </div>

          <div className="net-profit-main">
            <span>Events</span>
            <strong>{formatMoney(dashboard.stats.totalEventRevenue)}</strong>
            <p>Montant reussi par les evenements confirmes.</p>
          </div>

          <div className="net-profit-split">
            <div>
              <span>EVENTIX</span>
              <strong>{formatMoney(dashboard.stats.totalAppRevenue)}</strong>
            </div>
            <div>
              <span>Tickets</span>
              <strong>{dashboard.stats.soldTickets}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="organizer-grid">
        <article className="dashboard-card monthly-success-card">
          <div className="card-header">
            <div>
              <p className="card-kicker">Succes par mois</p>
              <h2>Evolution mensuelle</h2>
            </div>
          </div>

          <div className="monthly-bars">
            {dashboard.monthlySuccess.length === 0 && (
              <p className="empty-state">Pas encore de reservations confirmees.</p>
            )}

            {dashboard.monthlySuccess.map((month) => (
              <div className="monthly-row" key={month.month}>
                <span>{month.month}</span>
                <div>
                  <i style={{ width: `${Math.max((month.eventRevenue / maxMonthlyRevenue) * 100, 8)}%` }} />
                </div>
                <strong>{formatMoney(month.eventRevenue)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card top-events-card">
          <div className="card-header">
            <div>
              <p className="card-kicker">Plus reussis</p>
              <h2>Top evenements</h2>
            </div>
            <FaTrophy className="top-events-icon" />
          </div>

          <div className="top-events-list">
            {dashboard.topEvents.length === 0 && (
              <p className="empty-state">Aucun top event disponible.</p>
            )}

            {dashboard.topEvents.map((event, index) => (
              <div className="top-event-row" key={event._id || event.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{event.name}</strong>
                  <small>{event.room}</small>
                </div>
                <b>{formatMoney(event.eventRevenue)}</b>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
