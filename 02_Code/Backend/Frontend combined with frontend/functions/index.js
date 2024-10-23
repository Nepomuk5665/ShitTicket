const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const QRCode = require('qrcode');
const cors = require('cors')({
    origin: true,
    credentials: true
});

admin.initializeApp();

exports.createCheckoutSession = functions
    .region('europe-west6')
    .https.onRequest((request, response) => {
        cors(request, response, async () => {
            try {
                if (request.method === 'OPTIONS') {
                    response.set('Access-Control-Allow-Origin', 'https://shitticket.ch');
                    response.set('Access-Control-Allow-Methods', 'POST');
                    response.set('Access-Control-Allow-Headers', 'Content-Type');
                    response.set('Access-Control-Max-Age', '3600');
                    response.status(204).send('');
                    return;
                }

                const { ticketId, email } = request.body;

                const ticketDoc = await admin.firestore().collection('tickets').doc(ticketId).get();
                
                if (!ticketDoc.exists) {
                    throw new Error('Ticket not found');
                }

                const ticketData = ticketDoc.data();

                // Create Stripe checkout session
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [{
                        price_data: {
                            currency: 'chf',
                            product_data: {
                                name: ticketData.eventName,
                                description: `Event at ${ticketData.location} on ${ticketData.datetime}`,
                            },
                            unit_amount: Math.round(ticketData.price * 100),
                        },
                        quantity: 1,
                    }],
                    mode: 'payment',
                    success_url: `https://shitticket.ch/success.html?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `https://shitticket.ch/buyticket.html?id=${ticketId}`,
                    customer_email: email,
                    metadata: {
                        ticketId: ticketId
                    }
                });

                response.set('Access-Control-Allow-Origin', 'https://shitticket.ch');
                response.set('Access-Control-Allow-Methods', 'POST');
                response.set('Access-Control-Allow-Headers', 'Content-Type');
                
                response.json({
                    sessionId: session.id,
                    url: session.url
                });
            } catch (error) {
                console.error('Error:', error);
                response.status(500).json({ error: error.message });
            }
        });
    });

exports.createTicketQR = functions
    .region('europe-west6')
    .https.onRequest((request, response) => {
        cors(request, response, async () => {
            try {
                if (request.method === 'OPTIONS') {
                    response.set('Access-Control-Allow-Origin', 'https://shitticket.ch');
                    response.set('Access-Control-Allow-Methods', 'POST');
                    response.set('Access-Control-Allow-Headers', 'Content-Type');
                    response.set('Access-Control-Max-Age', '3600');
                    response.status(204).send('');
                    return;
                }

                const { sessionId } = request.body;

                const session = await stripe.checkout.sessions.retrieve(sessionId);
                
                if (session.payment_status !== 'paid') {
                    throw new Error('Payment not completed');
                }

                const ticketId = admin.firestore().collection('purchased_tickets').doc().id;
                
                const qrData = {
                    ticketId: ticketId,
                    sessionId: sessionId,
                    purchaseDate: new Date().toISOString(),
                    eventId: session.metadata.ticketId
                };
                
                const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));

                await admin.firestore().collection('purchased_tickets').doc(ticketId).set({
                    sessionId: sessionId,
                    customerEmail: session.customer_email,
                    purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
                    qrCode: qrCodeUrl,
                    used: false,
                    eventId: session.metadata.ticketId,
                    amount: session.amount_total / 100
                });

                // Update sold tickets count
                const ticketRef = admin.firestore().collection('tickets').doc(session.metadata.ticketId);
                await admin.firestore().runTransaction(async (transaction) => {
                    const ticketDoc = await transaction.get(ticketRef);
                    if (!ticketDoc.exists) {
                        throw new Error('Original ticket not found');
                    }
                    const currentSold = ticketDoc.data().soldTickets || 0;
                    transaction.update(ticketRef, { soldTickets: currentSold + 1 });
                });

                response.set('Access-Control-Allow-Origin', 'https://shitticket.ch');
                response.set('Access-Control-Allow-Methods', 'POST');
                response.set('Access-Control-Allow-Headers', 'Content-Type');
                response.json({ qrCodeUrl, ticketId });
            } catch (error) {
                console.error('Error:', error);
                response.status(500).json({ error: error.message });
            }
        });
    });

exports.stripeWebhook = functions
    .region('europe-west6')
    .https.onRequest(async (request, response) => {
        try {
            const sig = request.headers['stripe-signature'];
            const event = stripe.webhooks.constructEvent(
                request.rawBody,
                sig,
                functions.config().stripe.webhook_secret
            );

            console.log('Webhook event type:', event.type);

            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                console.log('Payment successful for session:', session.id);

                // Add payment to your database
                await admin.firestore().collection('payments').doc(session.id).set({
                    ticketId: session.metadata.ticketId,
                    customerEmail: session.customer_email,
                    amount: session.amount_total / 100,
                    status: 'completed',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            response.json({ received: true });
        } catch (error) {
            console.error('Webhook Error:', error);
            response.status(400).send(`Webhook Error: ${error.message}`);
        }
    });