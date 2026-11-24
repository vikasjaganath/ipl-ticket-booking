function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="header">
      <div className="nav-container">
        <div className="logo" onClick={() => setActiveTab('home')}>
          🏏 IPL 2026
        </div>
        <nav className="nav-links">
          <a
            className={activeTab === 'home' ? 'active-link' : ''}
            onClick={() => setActiveTab('home')}
          >
            Home
          </a>
          <a
            className={activeTab === 'matches' ? 'active-link' : ''}
            onClick={() => setActiveTab('matches')}
          >
            Matches
          </a>
          <a
            className={activeTab === 'bookings' ? 'active-link' : ''}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;