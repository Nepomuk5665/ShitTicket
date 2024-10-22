// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJwbMAKUX2i1JWhcIpHr_SlrNgLKZTtX8",
    authDomain: "shitticket-5665.firebaseapp.com",
    projectId: "shitticket-5665",
    storageBucket: "shitticket-5665.appspot.com",
    messagingSenderId: "736779061282",
    appId: "1:736779061282:web:e19dd020bb473f0a2d227b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
    auth, 
    db, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    doc,
    setDoc,
    collection,
    addDoc,
    getDoc 
};