function Hero({ onViewSchedule }) {
  return (
    <div className="hero">
      <h1>IPL 2026 Ticket Booking</h1>
      <p>Experience The Stadium Energy Live!</p>
      <button className="hero-btn" onClick={onViewSchedule}>
        View Schedule
      </button>
    </div>
  );
}

export default Hero;