export default function RecentReservations({ reservations }) {
  return (
    <article className="dashboard-card reservations-card">
      <div className="card-header">
        <div>
          <p className="card-kicker">Activite recente</p>
          <h2>Reservations recentes</h2>
        </div>
        <button className="ghost-button">Voir tout</button>
      </div>

      <div className="table-wrap">
        <table className="reservations-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Evenement</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>
                  <div className="client-cell">
                    <span className="client-avatar">
                      {reservation.client.charAt(0)}
                    </span>
                    <span>{reservation.client}</span>
                  </div>
                </td>

                <td>{reservation.evenement}</td>

                <td>
                  <span className="status-badge">
                    {reservation.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
