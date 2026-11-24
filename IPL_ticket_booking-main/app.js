// 1. Tab Switching Function (Also closes mobile menu if open)
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Close mobile hamburger menu after selecting a link
    const navLinks = document.getElementById('navLinks');
    if (navLinks && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. Reusable Toast Notification Function
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 3. Ticket Pricing Map
const TICKET_PRICES = {
    general: 1200,
    premium: 2500,
    vip: 5000
};

// 4. Live Booking Summary Update Function
function updateBookingSummary(notify = true) {
    const matchSelect = document.getElementById('match');
    const categorySelect = document.getElementById('category');
    const ticketsInput = document.querySelector('#tickets');

    const summaryMatch = document.getElementById('summaryMatch');
    const summaryCategory = document.getElementById('summaryCategory');
    const summaryTickets = document.getElementById('summaryTickets');
    const summaryTotal = document.getElementById('summaryTotal');

    if (!matchSelect || !categorySelect || !ticketsInput) return;

    const selectedMatchText = matchSelect.value 
        ? matchSelect.options[matchSelect.selectedIndex].text 
        : 'Not selected';

    const categoryValue = categorySelect.value;
    const categoryLabel = categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1);

    let quantity = parseInt(ticketsInput.value, 10);
    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
    } else if (quantity > 10) {
        quantity = 10;
    }

    const unitPrice = TICKET_PRICES[categoryValue] || 1200;
    const totalAmount = unitPrice * quantity;

    summaryMatch.textContent = selectedMatchText;
    summaryCategory.textContent = categoryLabel;
    summaryTickets.textContent = quantity;
    summaryTotal.textContent = totalAmount.toLocaleString('en-IN');

    if (notify) {
        showToast(`Booking Summary updated! Total: ₹${totalAmount.toLocaleString('en-IN')}`);
    }
}

// 5. Smooth Scroll to Booking Form + Pre-select Match + Update Summary
function bookMatch(matchValue, matchName) {
    showTab('book');

    const matchDropdown = document.getElementById('match');
    if (matchValue && matchDropdown) {
        matchDropdown.value = matchValue;
        updateBookingSummary(false);
    }

    const bookingSection = document.getElementById('book');
    bookingSection.scrollIntoView({ behavior: 'smooth' });

    if (matchName) {
        showToast(`Selected ${matchName}. Summary updated below!`);
    } else {
        showToast('Select your match, stand, and tickets below!');
    }
}

// 6. Filter Match Cards by Team
function filterMatchesByTeam(selectedTeam) {
    const matchCards = document.querySelectorAll('#matchesContainer .match-card');
    
    matchCards.forEach(card => {
        const teams = card.getAttribute('data-teams') || '';
        if (selectedTeam === 'all' || teams.includes(selectedTeam)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });

    const label = selectedTeam === 'all' ? 'All Teams' : selectedTeam;
    showToast(`Showing matches for: ${label}`);
}

// 7. Toggle Between Grid View and List View
function setMatchView(viewType) {
    const matchesContainer = document.getElementById('matchesContainer');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');

    if (!matchesContainer || !gridViewBtn || !listViewBtn) return;

    if (viewType === 'list') {
        matchesContainer.classList.remove('matches-grid');
        matchesContainer.classList.add('matches-list');
        listViewBtn.classList.add('active-view');
        gridViewBtn.classList.remove('active-view');
        showToast('Switched to List View');
    } else {
        matchesContainer.classList.remove('matches-list');
        matchesContainer.classList.add('matches-grid');
        gridViewBtn.classList.add('active-view');
        listViewBtn.classList.remove('active-view');
        showToast('Switched to Grid View');
    }
}

// 8. Initialize All Event Listeners on Page Load
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }

    // Team filter dropdown
    const teamFilter = document.getElementById('teamFilter');
    if (teamFilter) {
        teamFilter.addEventListener('change', (e) => {
            filterMatchesByTeam(e.target.value);
        });
    }

    // Grid / List view toggle buttons
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => setMatchView('grid'));
    }
    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => setMatchView('list'));
    }

    // Booking form selectors
    const matchSelect = document.getElementById('match');
    const categorySelect = document.getElementById('category');
    const ticketsInput = document.querySelector('#tickets');
    const bookingForm = document.querySelector('#bookingForm');

    if (matchSelect) {
        matchSelect.addEventListener('change', () => updateBookingSummary(true));
    }
    if (categorySelect) {
        categorySelect.addEventListener('change', () => updateBookingSummary(true));
    }
    if (ticketsInput) {
        ticketsInput.addEventListener('change', () => updateBookingSummary(true));
    }

    updateBookingSummary(false);

    if (bookingForm) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            showToast('Booking Confirmed! Check "My Bookings" for details.');
            bookingForm.reset();
            updateBookingSummary(false);
        });
    }
});