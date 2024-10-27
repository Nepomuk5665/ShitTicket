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



# Event Link Creation [issue #16](https://github.com/Nepomuk5665/ShitTicket/issues/16)

## Implementation
1. Created form to collect event details:
<img width="1727" alt="Screenshot 2024-10-27 at 3 06 51 PM" src="https://github.com/user-attachments/assets/2830ef00-0904-4533-bfff-1fb92f6d0629">

```html
<form id="createTicketForm">
    <input type="text" id="eventName" placeholder="Event name" required>
    <input type="number" id="price" step="0.01" placeholder="Price" required>
    <input type="number" id="maxPeople" placeholder="Maximum people" required>
</form>
```

2. After submission, generate unique link:
<img width="1728" alt="Screenshot 2024-10-27 at 3 07 40 PM" src="https://github.com/user-attachments/assets/d46d0ff7-e6f4-4c86-aa5e-2ae33b82a7f3">

```javascript
const ticketDoc = await addDoc(collection(db, "tickets"), {
    eventName: document.getElementById('eventName').value,
    price: parseFloat(document.getElementById('price').value),
    maxPeople: parseInt(document.getElementById('maxPeople').value),
    userId: auth.currentUser.uid
});

const ticketLink = `${window.location.origin}/buyticket.html?id=${ticketDoc.id}`;
```

## Problems & Solutions
1. Wrong URL format:
   - Fixed using `window.location.origin` ([URL Guide](https://developer.mozilla.org/en-US/docs/Web/API/URL))

2. Anyone could create events:
   - Added user authentication check ([Firebase Auth](https://firebase.google.com/docs/auth/web/manage-users))

## Code Sources
- [Firebase Add Data](https://firebase.google.com/docs/firestore/manage-data/add-data)
- [URL Parameters](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)


# Firebase Rules Implementation [issue #15](https://github.com/Nepomuk5665/ShitTicket/issues/15)

## Setup
<img width="1728" alt="Screenshot 2024-10-27 at 3 13 10 PM" src="https://github.com/user-attachments/assets/cdafcea4-5f92-4adf-9b30-b095325b8e53">

Rules implemented:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tickets/{ticketId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /purchased_tickets/{ticketId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/tickets/$(resource.data.eventId)).data.userId == request.auth.uid;
    }
  }
}
```

## Problems & Solutions
1. Missing Permissions Error:
   - Problem: Couldn't update tickets
   - Fixed by checking user ID ([Rules Guide](https://firebase.google.com/docs/firestore/security/rules-conditions))

2. Scanner Access:
   - Problem: Scanner couldn't validate tickets
   - Added read permissions for purchased tickets

## Code Sources
- [Firebase Rules Basic](https://firebase.google.com/docs/rules/basics)
- [Rules Conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)


# Firebase Hosting Setup [issue #33](https://github.com/Nepomuk5665/ShitTicket/issues/33)

## Hosting Steps
1. Initialized Firebase hosting:
```bash
firebase init hosting
```


2. Uploaded files:
```bash
firebase deploy
```
<img width="1728" alt="Screenshot 2024-10-27 at 3 32 26 PM" src="https://github.com/user-attachments/assets/1cae5dd6-fa03-469b-b001-9b6179d631e0">


## DNS Configuration
1. Added records in Hostinger:
<img width="1725" alt="Screenshot 2024-10-27 at 3 21 40 PM" src="https://github.com/user-attachments/assets/f8c529fb-6dcb-42d8-a916-4d60dbd84e7c">

```
Type: A
Name: shitticket.ch
Value: 199.36.158.100

Type: TXT
Name: shitticket.ch
Value: hosting-site=shitticket-5665
```


## Code Sources
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Custom Domains](https://firebase.google.com/docs/hosting/custom-domain)


# QR Code Generation [issue #35](https://github.com/Nepomuk5665/ShitTicket/issues/35)

## Implementation
1. Check payment & generate QR code:
```javascript
const qrData = {
    ticketId: ticketId,
    eventId: session.metadata.ticketId,
    purchaseDate: new Date().toISOString()
};

const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));
```



2. Store in Firebase:
```javascript
await admin.firestore().collection('purchased_tickets').doc(ticketId).set({
    qrCode: qrCodeUrl,  // base64 string
    used: false,
    eventId: session.metadata.ticketId
});
```
<img width="1413" alt="image" src="https://github.com/user-attachments/assets/32b9fd67-6a22-4009-a0fd-d8d50804b76b">

3. Show it on the screen
<img width="1728" alt="Screenshot 2024-10-27 at 3 57 20 PM" src="https://github.com/user-attachments/assets/85e3e169-0ea6-4854-9a71-751fb02cf95d">

## Problems & Solutions
1. QR Code too large:
   - Problem: Base64 string too long
   - Fixed by compressing data
   - Source: [QRCode npm](https://www.npmjs.com/package/qrcode)

2. Payment Verification:
   - Added Stripe session check
   - Source: [Stripe Sessions](https://stripe.com/docs/payments/checkout/fulfill-orders)

## Code Sources
- [QRCode Package](https://www.npmjs.com/package/qrcode)
- [Firebase Storage](https://firebase.google.com/docs/storage)
