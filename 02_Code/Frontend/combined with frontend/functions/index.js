const { onRequest, onCall } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const functions = require("firebase-functions");
const cors = require('cors')({origin: true});
const stripe = require('stripe')('key amk'); // Replace with your actual Stripe secret key

initializeApp();

exports.createStripeProduct = onCall(async (data, context) => {
    console.log('createStripeProduct function called with data:', data);
    
    // Ensure the user is authenticated
    if (!context.auth) {
        console.error('Unauthenticated user attempted to create a product');
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create a product.');
    }

    const { ticketId, eventName, entranceFee } = data;

    if (!ticketId || !eventName || entranceFee === undefined) {
        console.error('Missing required data:', { ticketId, eventName, entranceFee });
        throw new functions.https.HttpsError('invalid-argument', 'Missing required data.');
    }

    try {
        console.log(`Creating Stripe product for event: ${eventName}`);
        // Create a Stripe product
        const product = await stripe.products.create({
            name: eventName,
            metadata: { ticketId: ticketId }
        });
        console.log('Stripe product created:', product.id);

        console.log(`Creating Stripe price for product: ${product.id}`);
        // Create a Stripe price for the product
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(entranceFee * 100), // Stripe uses cents
            currency: 'usd',
        });
        console.log('Stripe price created:', price.id);

        // Update the Firestore document with Stripe product and price IDs
        const db = getFirestore();
        console.log(`Updating Firestore document for ticket: ${ticketId}`);
        await db.collection('tickets').doc(ticketId).update({
            stripeProductId: product.id,
            stripePriceId: price.id
        });
        console.log('Firestore document updated successfully');

        return { productId: product.id, priceId: price.id };
    } catch (error) {
        console.error('Error in createStripeProduct:', error);
        // Log the full error object
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        // Throw a more detailed error
        throw new functions.https.HttpsError('internal', `Unable to create Stripe product and price: ${error.message}`, {
            stripeError: error.raw ? error.raw.message : null,
            code: error.code,
            type: error.type
        });
    }
});

exports.createCheckoutSession = onCall(async (data, context) => {
    console.log('createCheckoutSession function called with data:', data);
    const { ticketId } = data;

    if (!ticketId) {
        console.error('Missing ticketId in request data');
        throw new functions.https.HttpsError('invalid-argument', 'Missing ticketId in request data');
    }

    try {
        const db = getFirestore();
        console.log(`Fetching ticket document for ID: ${ticketId}`);
        const ticketDoc = await db.collection('tickets').doc(ticketId).get();
        
        if (!ticketDoc.exists) {
            console.error(`Ticket not found for ID: ${ticketId}`);
            throw new functions.https.HttpsError('not-found', 'Ticket not found');
        }

        const ticketData = ticketDoc.data();
        console.log('Ticket data retrieved:', ticketData);

        if (!ticketData.stripePriceId) {
            console.error(`Stripe price not set for ticket: ${ticketId}`);
            throw new functions.https.HttpsError('failed-precondition', 'Stripe price not set for this ticket');
        }

        console.log('Creating Stripe Checkout session');
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: ticketData.stripePriceId,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: {
                ticketId: ticketId
            },
        });
        console.log('Checkout session created:', session.id);

        return { sessionId: session.id };
    } catch (error) {
        console.error('Error creating Checkout Session:', error);
        throw new functions.https.HttpsError('internal', `Unable to create Checkout Session: ${error.message}`);
    }
});

exports.createCheckoutSessionHttp = onRequest(async (req, res) => {
    return cors(req, res, async () => {
        console.log('createCheckoutSessionHttp function called with body:', req.body);
        const { ticketId } = req.body;

        if (!ticketId) {
            console.error('Missing ticketId in request body');
            res.status(400).send('Missing ticketId in request body');
            return;
        }

        try {
            const db = getFirestore();
            console.log(`Fetching ticket document for ID: ${ticketId}`);
            const ticketDoc = await db.collection('tickets').doc(ticketId).get();
            
            if (!ticketDoc.exists) {
                console.error(`Ticket not found for ID: ${ticketId}`);
                res.status(404).send('Ticket not found');
                return;
            }

            const ticketData = ticketDoc.data();
            console.log('Ticket data retrieved:', ticketData);

            if (!ticketData.stripePriceId) {
                console.error(`Stripe price not set for ticket: ${ticketId}`);
                res.status(400).send('Stripe price not set for this ticket');
                return;
            }

            console.log('Creating Stripe Checkout session');
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price: ticketData.stripePriceId,
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/cancel`,
                metadata: {
                    ticketId: ticketId
                },
            });
            console.log('Checkout session created:', session.id);

            res.json({ sessionId: session.id });
        } catch (error) {
            console.error('Error creating Checkout Session:', error);
            res.status(500).send(`Unable to create Checkout Session: ${error.message}`);
        }
    });
});