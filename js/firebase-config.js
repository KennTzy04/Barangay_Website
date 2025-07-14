// Firebase Configuration
// Replace with your actual Firebase config from Firebase Console

const firebaseConfig = {
    apiKey: "AIzaSyAG_BvuKGo76nk_n79oSEBdoDybv0YtAlE",
    authDomain: "barangay-website-d1160.firebaseapp.com",
    projectId: "barangay-website-d1160",
    storageBucket: "barangay-website-d1160.appspot.com",
    messagingSenderId: "866598221670",
    appId: "1:866598221670:web:df115797a87f41deb87aa7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = firebase.auth();

// Initialize Firestore Database
const db = firebase.firestore();

// Initialize Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDB = db;
window.googleProvider = googleProvider;