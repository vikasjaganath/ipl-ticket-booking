function MatchCard({ match, onBook }) {
  const isSoldOut = match.available_seats <= 0;

  return (
    <div className="match-card">
      <div>
        <h3>{match.team1} vs {match.team2}</h3>
        <p><strong>Date:</strong> {match.date}</p>
        <p><strong>Venue:</strong> {match.venue}</p>
        <p><strong>Ticket Price:</strong> ₹{match.price.toLocaleString('en-IN')}</p>
        <p>
          <strong>Available Seats:</strong>{' '}
          <span style={{ color: isSoldOut ? '#d90429' : '#1b7a3d', fontWeight: 'bold' }}>
            {match.available_seats}
          </span>
        </p>
      </div>
      <button
        className="hero-btn"
        disabled={isSoldOut}
        onClick={() => onBook(match)}
      >
        {isSoldOut ? 'Sold Out' : 'Book Ticket'}
      </button>
    </div>
  );
}

export default MatchCard;