let ticketData;

// Function to get ticket ID from URL
function getTicketIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Function to display ticket information
function displayTicketInfo(ticket) {
    ticketData = ticket;
    const ticketInfoDiv = document.getElementById('ticket-info');
    ticketInfoDiv.innerHTML = `
        <h2>${ticket.eventName}</h2>
        <p><strong>Location:</strong> ${ticket.eventLocation}</p>
        <p><strong>Entrance Fee:</strong> $${ticket.entranceFee}</p>
        <p><strong>Max Attendees:</strong> ${ticket.maxAttendees}</p>
        <p><strong>Date:</strong> ${new Date(ticket.eventDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${ticket.eventTime}</p>
        <p>${ticket.description}</p>
    `;
}

// Function to fetch and display ticket information
function fetchTicketInfo() {
    const ticketId = getTicketIdFromUrl();

    if (!ticketId) {
        console.error('No ticket ID provided');
        return;
    }

    db.collection('tickets').doc(ticketId).get()
        .then((doc) => {
            if (doc.exists) {
                const ticketData = doc.data();
                displayTicketInfo(ticketData);
            } else {
                console.error('No such ticket!');
            }
        })
        .catch((error) => {
            console.error('Error getting ticket:', error);
        });
}

// Function to initiate Stripe Checkout
async function initiateCheckout() {
    const ticketId = getTicketIdFromUrl();
    
    try {
        const createCheckoutSession = functions.httpsCallable('createCheckoutSession');
        const result = await createCheckoutSession({ ticketId: ticketId });
        
        const { sessionId } = result.data;
        
        // Redirect to Stripe Checkout
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchTicketInfo();

    const buyButton = document.getElementById('buyButton');
    if (buyButton) {
        buyButton.addEventListener('click', initiateCheckout);
    }
});