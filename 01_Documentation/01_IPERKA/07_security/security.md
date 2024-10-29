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
<img width="1728" alt="image" src="https://github.com/user-attachments/assets/7265eb0d-26fb-4587-8813-004e5250ca27">

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
<img width="911" alt="image" src="https://github.com/user-attachments/assets/c86f60e2-7d58-4176-9f6c-e59caa51ec8d">


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
<img width="1204" alt="image" src="https://github.com/user-attachments/assets/da271143-7dd6-4ece-b346-5d04ade6858c">


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
