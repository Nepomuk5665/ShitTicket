# Backend Realization

# Firebase Setup [issue #17](https://github.com/Nepomuk5665/ShitTicket/issues/17)

1. First, I visited the [Firebase Console](https://console.firebase.google.com/) and created a new project.

   ![Projekt erstellen](https://github.com/user-attachments/assets/657c7638-907c-425e-a7f0-825e28117e0d)

2. I then gave the project a name that matches the name of our project.

   ![Projektname vergeben](https://github.com/user-attachments/assets/665bc0c0-1cb4-4cd8-9ce4-4c61c5c6fae8)

3. Afterward, I chose not to share any data with Google Analytics.

   ![Google Analytics abwählen](https://github.com/user-attachments/assets/2af1cdc2-fc0f-4003-983c-cc422ebe1187)

4. Finally, I reached this screen, confirming that Firebase has been successfully set up for the database.

<img width="1188" alt="Screenshot 2024-10-27 at 2 30 39 PM" src="https://github.com/user-attachments/assets/a65093b9-f099-4196-8dec-5fe4a9d84c46">

# Stripe Implementation [issue #18](https://github.com/Nepomuk5665/ShitTicket/issues/18)

## Setup
1. Created a Stripe Account at [stripe.com](https://dashboard.stripe.com/register)
<img width="1216" alt="Screenshot 2024-10-27 at 2 33 33 PM" src="https://github.com/user-attachments/assets/e0b56cff-6575-433a-a8f2-9c5d08fcf5bb">

2. Got API Keys from Stripe Dashboard
<img width="1728" alt="Screenshot 2024-10-27 at 2 55 05 PM" src="https://github.com/user-attachments/assets/bb37d207-a44a-4130-bcdf-6de75ec4c44d">
- Using publishable key in frontend
- Secret key stored in Firebase Functions


## Implementation
1. Added Stripe to project:
```html
<script src="https://js.stripe.com/v3/"></script>
```

2. Created checkout function based on:
- [Accept a Payment Guide](https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=checkout)
- [Checkout Session API](https://stripe.com/docs/api/checkout/sessions/create)

3. Connected to Firebase:
```javascript
const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
        price_data: {
            currency: 'chf',
            product_data: {
                name: ticketData.eventName,
            },
            unit_amount: Math.round(ticketData.price * 100),
        },
        quantity: 1,
    }],
    mode: 'payment',
    success_url: `https://shitticket.ch/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `https://shitticket.ch/buyticket.html?id=${ticketId}`,
});
```
Code from: [Stripe Checkout Guide](https://stripe.com/docs/checkout/quickstart)

## Problems & Solutions

1. CORS Errors:
   - Error: "Access-Control-Allow-Origin missing"
   - Solution: [Added CORS handling](https://firebase.google.com/docs/functions/http-events#cors)

2. Permission Issues:
   - Error: "Missing or insufficient permissions"
   - Solution: [Updated Firebase Rules](https://firebase.google.com/docs/firestore/security/get-started)

3. Currency Handling:
   - Problem: Price in wrong format
   - Solution: Multiply by 100 for cents ([Stripe Amount Guide](https://stripe.com/docs/currencies#zero-decimal))

## Test Cards
- Success: 4242 4242 4242 4242
- [More test cards](https://stripe.com/docs/testing)



## Key Resources
- [Firebase + Stripe Tutorial](https://firebase.google.com/codelabs/stripe-firebase-extensions)
- [Stripe Quickstart](https://stripe.com/docs/checkout/quickstart)
- [Error Handling Guide](https://stripe.com/docs/error-handling)
- [Web Integration Guide](https://stripe.com/docs/payments/accept-a-payment?platform=web)
