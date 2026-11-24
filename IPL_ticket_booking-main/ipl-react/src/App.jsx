import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MatchCard from './components/MatchCard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [matches, setMatches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState(1);
  const [statusMessage, setStatusMessage] = useState('');

  // Ref for smooth scrolling to the booking form
  const bookingFormRef = useRef(null);

  // Fetch matches from Supabase
  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching matches:', error);
    } else {
      setMatches(data || []);
    }
    setLoading(false);
  };

  // Fetch bookings from Supabase
  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }
  };

  // Initial fetch + Realtime subscription
  useEffect(() => {
    fetchMatches();
    fetchBookings();

    const channel = supabase
      .channel('ipl-realtime-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => fetchMatches()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchBookings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Select match and smoothly scroll to the booking form
  const handleSelectMatch = (match) => {
    setSelectedMatch(match);
    setTickets(1);
    setStatusMessage('');

    setTimeout(() => {
      bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  // Insert booking & update available_seats in Supabase
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;

    const quantity = Number(tickets);
    if (quantity > selectedMatch.available_seats) {
      setStatusMessage(`Only ${selectedMatch.available_seats} seats left!`);
      return;
    }

    const matchTitle = `${selectedMatch.team1} vs ${selectedMatch.team2}`;
    const totalAmount = selectedMatch.price * quantity;

    // 1. Insert into bookings table
    const { error: insertError } = await supabase.from('bookings').insert([
      {
        match_id: selectedMatch.id,
        match_name: matchTitle,
        customer_name: customerName,
        email: email,
        tickets: quantity,
        total_amount: totalAmount,
      },
    ]);

    if (insertError) {
      setStatusMessage(`Booking failed: ${insertError.message}`);
      return;
    }

    // 2. Update available_seats in matches table
    const newSeatCount = selectedMatch.available_seats - quantity;
    const { error: updateError } = await supabase
      .from('matches')
      .update({ available_seats: newSeatCount })
      .eq('id', selectedMatch.id);

    if (updateError) {
      setStatusMessage(`Seats update failed: ${updateError.message}`);
      return;
    }

    setStatusMessage(
      `Booking Confirmed for ${matchTitle}! (${quantity} ticket(s) - ₹${totalAmount.toLocaleString('en-IN')})`
    );
    setCustomerName('');
    setEmail('');
    setSelectedMatch(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container">
        {activeTab === 'home' && (
          <Hero onViewSchedule={() => setActiveTab('matches')} />
        )}

        {activeTab !== 'bookings' ? (
          <section className="schedule-section">
            <h2>IPL Match Schedule (Live from Supabase)</h2>

            {statusMessage && (
              <div className="selection-banner">{statusMessage}</div>
            )}

            {loading ? (
              <p>Loading live matches from database...</p>
            ) : (
              <div className="matches-grid">
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onBook={handleSelectMatch}
                  />
                ))}
              </div>
            )}

            {selectedMatch && (
              <form
                ref={bookingFormRef}
                className="booking-box"
                onSubmit={handleConfirmBooking}
              >
                <h3>Book Tickets: {selectedMatch.team1} vs {selectedMatch.team2}</h3>
                <p>Price per Ticket: <strong>₹{selectedMatch.price.toLocaleString('en-IN')}</strong></p>
                <p>Available Seats: <strong>{selectedMatch.available_seats}</strong></p>

                <label>Name:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />

                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />

                <label>Number of Tickets:</label>
                <input
                  type="number"
                  min="1"
                  max={selectedMatch.available_seats}
                  value={tickets}
                  onChange={(e) => setTickets(e.target.value)}
                  required
                />

                <p className="total-preview">
                  Total: ₹{(selectedMatch.price * Number(tickets)).toLocaleString('en-IN')}
                </p>

                <div className="form-actions">
                  <button type="submit" className="hero-btn">
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setSelectedMatch(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        ) : (
          <section className="schedule-section">
            <h2>My Bookings (Live Database Records)</h2>
            {bookings.length === 0 ? (
              <p>No bookings yet. Book a match to see live records!</p>
            ) : (
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Match</th>
                    <th>Name</th>
                    <th>Tickets</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{b.match_name}</td>
                      <td>{b.customer_name}</td>
                      <td>{b.tickets}</td>
                      <td>₹{b.total_amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;