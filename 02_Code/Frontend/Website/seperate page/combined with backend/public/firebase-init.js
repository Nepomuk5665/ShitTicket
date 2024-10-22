// Check if firebaseConfig is already defined
if (typeof window.firebaseConfig === 'undefined') {
    window.firebaseConfig = {
        apiKey: "AIzaSyAJwbMAKUX2i1JWhcIpHr_SlrNgLKZTtX8",
        authDomain: "shitticket-5665.firebaseapp.com",
        projectId: "shitticket-5665",
        storageBucket: "shitticket-5665.appspot.com",
        messagingSenderId: "736779061282",
        appId: "1:736779061282:web:e19dd020bb473f0a2d227b"
    };
}

// Initialize Firebase only if it hasn't been initialized yet
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(window.firebaseConfig);
    console.log('Firebase initialized in firebase-init.js');
} else if (typeof firebase !== 'undefined') {
    console.log('Firebase already initialized');
} else {
    console.error('Firebase SDK not found');
}

console.log('firebase-init.js loaded');