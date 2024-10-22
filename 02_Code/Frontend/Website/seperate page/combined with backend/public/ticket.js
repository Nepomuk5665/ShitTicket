// Function to create a ticket and generate a link
async function createTicket(event) {
    event.preventDefault();
    console.log('Create ticket function called');

    const eventName = document.getElementById('eventName').value;
    const eventLocation = document.getElementById('eventLocation').value;
    const entranceFee = document.getElementById('entranceFee').value;
    const maxAttendees = document.getElementById('maxAttendees').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const description = document.getElementById('description').value;

    console.log('Form data:', { eventName, eventLocation, entranceFee, maxAttendees, eventDate, eventTime, description });

    // Get the current user
    const user = firebase.auth().currentUser;

    if (!user) {
        console.error('User not authenticated');
        alert('You must be logged in to create a ticket.');
        return;
    }

    try {
        console.log('Attempting to create Firestore document');
        // Create a new ticket document in Firestore
        const docRef = await firebase.firestore().collection('tickets').add({
            eventName: eventName,
            eventLocation: eventLocation,
            entranceFee: parseFloat(entranceFee),
            maxAttendees: parseInt(maxAttendees),
            eventDate: eventDate,
            eventTime: eventTime,
            description: description,
            createdBy: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Ticket created with ID: ', docRef.id);

        console.log('Calling createStripeProduct function');
        // Call the Cloud Function to create Stripe product and price
        const createStripeProduct = firebase.functions().httpsCallable('createStripeProduct');
        try {
            const result = await createStripeProduct({
                ticketId: docRef.id,
                eventName: eventName,
                entranceFee: parseFloat(entranceFee)
            });
            console.log('Stripe product and price created:', result.data);
        } catch (error) {
            console.error('Error creating Stripe product:', error);
            let errorMessage = 'Stripe product creation failed';
            if (error.details) {
                errorMessage += `: ${error.details.stripeError || error.details.message || error.message}`;
            } else {
                errorMessage += `: ${error.message}`;
            }
            throw new Error(errorMessage);
        }

        // Generate a shareable link
        const shareableLink = `${window.location.origin}/buy-ticket.html?id=${docRef.id}`;
        console.log('Shareable link generated:', shareableLink);

        // Display the link
        const ticketLinkDiv = document.getElementById('ticket-link');
        const shareableLinkInput = document.getElementById('shareableLink');

        if (shareableLinkInput && ticketLinkDiv) {
            shareableLinkInput.value = shareableLink;
            ticketLinkDiv.style.display = 'block';
            console.log('Link displayed in UI');
        } else {
            console.error('Could not find elements to display the link');
        }

        // Clear the form
        document.getElementById('ticket-form').reset();
        alert('Ticket created successfully!');
    } catch (error) {
        console.error('Error creating ticket: ', error);
        alert(`An error occurred while creating the ticket: ${error.message}`);
    }
}

// Function to copy the link to clipboard
function copyLink() {
    const shareableLinkInput = document.getElementById('shareableLink');
    if (shareableLinkInput) {
        shareableLinkInput.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    } else {
        console.error('Could not find shareable link input');
    }
}

// Function to get ticket ID from URL
function getTicketIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Function to display ticket information
function displayTicketInfo(ticket) {
    console.log('Displaying ticket info:', ticket);
    const ticketInfoDiv = document.getElementById('ticket-info');
    if (ticketInfoDiv) {
        ticketInfoDiv.innerHTML = `
            <h2>${ticket.eventName}</h2>
            <p><strong>Location:</strong> ${ticket.eventLocation}</p>
            <p><strong>Entrance Fee:</strong> $${ticket.entranceFee}</p>
            <p><strong>Max Attendees:</strong> ${ticket.maxAttendees}</p>
            <p><strong>Date:</strong> ${new Date(ticket.eventDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${ticket.eventTime}</p>
            <p>${ticket.description}</p>
        `;
    } else {
        console.error('Could not find ticket-info div');
    }
}

// Function to fetch and display ticket information
async function fetchTicketInfo() {
    const ticketId = getTicketIdFromUrl();

    if (!ticketId) {
        console.error('No ticket ID provided in URL');
        return;
    }

    try {
        const doc = await firebase.firestore().collection('tickets').doc(ticketId).get();
        if (doc.exists) {
            const ticketData = doc.data();
            displayTicketInfo(ticketData);
        } else {
            console.error('No such ticket!');
            alert('Ticket not found');
        }
    } catch (error) {
        console.error('Error getting ticket:', error);
        alert(`An error occurred while fetching ticket information: ${error.message}`);
    }
}

// Function to initiate Stripe Checkout
async function initiateCheckout(ticketId) {
    console.log('Initiating checkout for ticket:', ticketId);
    try {
        const createCheckoutSession = firebase.functions().httpsCallable('createCheckoutSession');
        const result = await createCheckoutSession({ ticketId: ticketId });
        
        const { sessionId } = result.data;
        console.log('Checkout session created:', sessionId);
        
        // Redirect to Stripe Checkout
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (error) {
        console.error('Error initiating checkout:', error);
        alert(`An error occurred while initiating checkout: ${error.message}`);
    }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    const ticketForm = document.getElementById('ticket-form');
    const copyLinkButton = document.getElementById('copyLink');
    const buyButton = document.getElementById('buyButton');

    if (ticketForm) {
        ticketForm.addEventListener('submit', createTicket);
        console.log('Submit event listener added to ticket form');
    } else {
        console.log('Ticket form not found in this page');
    }

    if (copyLinkButton) {
        copyLinkButton.addEventListener('click', copyLink);
        console.log('Click event listener added to copy link button');
    } else {
        console.log('Copy link button not found in this page');
    }

    if (buyButton) {
        const ticketId = getTicketIdFromUrl();
        buyButton.addEventListener('click', () => initiateCheckout(ticketId));
        console.log('Click event listener added to buy button');
        fetchTicketInfo();
    } else {
        console.log('Buy button not found in this page');
    }
});

console.log('ticket.js loaded');