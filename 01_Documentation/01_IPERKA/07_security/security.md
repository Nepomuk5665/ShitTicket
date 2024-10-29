# Security Documentation

## Firebase Security Rules
Currently implemented rules:
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
ss

## Known Security Risks
1. User Data Exposure:
   - Currently all user data can be read by anyone
   - In case of a cyber attack, user information could be exposed:
     - Names
     - Email addresses
     - IBAN numbers
   - Future update needed to restrict data access

## Authentication Security
1. Basic Email/Password Authentication:
```javascript
await createUserWithEmailAndPassword(auth, email, password);
await setDoc(doc(db, "users", user.uid), {
    firstName: firstName,
    surname: surname,
    email: email,
    iban: iban,
    createdAt: new Date().toISOString()
});
```
ss registration form

## Input Validation Issues
1. Missing Password Rules:
   - No minimum length requirement
   - No special character requirement
   - No number requirement
   - No uppercase/lowercase requirement

2. Missing IBAN Validation:
   - No format check
   - No country code validation
   - Could lead to payment issues

3. Price Validation:
   - No minimum price check (should be at least 0.50 CHF for Stripe)
   - Can create events with zero or negative prices

4. Date Validation:
   - Can create events in the past
   - No maximum future date limit

5. Email Validation:
   - Only basic format check (done by Firebase)
   - No domain verification

## Payment Security
1. Stripe Integration:
   - Using Stripe's hosted checkout page
   - Never handling credit card data ourselves
   - All payments processed through Stripe
ss stripe checkout flow

## QR Code Security
1. Ticket Validation:
```javascript
if (ticketInfo.used) {
    throw new Error("Ticket already used");
}
await updateDoc(doc(db, "purchased_tickets", ticketId), {
    used: true,
    usedAt: new Date().toISOString(),
    scannedBy: auth.currentUser.email
});
```

## Known Technical Issues
1. iOS Scanner:
   - Not working due to security restrictions
   - Need different implementation for iOS

## Code Sources
- [Firebase Rules](https://firebase.google.com/docs/rules/basics)
- [Stripe Security](https://stripe.com/docs/security)
- [Firebase Auth](https://firebase.google.com/docs/auth)

## Future Security Updates Needed
1. Add proper input validation for:
   - Passwords (minimum requirements)
   - IBAN format
   - Event dates
   - Ticket prices
2. Restrict user data access
3. Implement iOS compatible scanner
4. Add payment verification checks