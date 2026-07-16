// ============================================
// FIREBASE CONFIG
// ============================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  
  // Initialize services
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();
  const analytics = firebase.analytics();

  // Make available globally
  window.firebaseApp = firebase;
  window.firebaseAuth = auth;
  window.firebaseDb = db;
  window.firebaseStorage = storage;
  window.firebaseAnalytics = analytics;
}
