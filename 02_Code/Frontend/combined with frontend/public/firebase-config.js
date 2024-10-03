// Use a unique name for the configuration
const shitticketFirebaseConfig = {
    apiKey: "AIzaSyAJwbMAKUX2i1JWhcIpHr_SlrNgLKZTtX8",
    authDomain: "shitticket-5665.firebaseapp.com",
    projectId: "shitticket-5665",
    storageBucket: "shitticket-5665.appspot.com",
    messagingSenderId: "736779061282",
    appId: "1:736779061282:web:e19dd020bb473f0a2d227b"
};

// Initialize Firebase only if it hasn't been initialized yet
if (!firebase.apps.length) {
    firebase.initializeApp(shitticketFirebaseConfig);
}

// Export Firebase services if needed
const db = firebase.firestore();
const auth = firebase.auth();
const functions = firebase.functions();

// You can export these services if you need to use them in other files
// export { db, auth, functions };