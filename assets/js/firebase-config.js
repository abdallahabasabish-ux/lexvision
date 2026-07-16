// ============================================
// FIREBASE CONFIG - lexvision-2e2e9
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyBSt4SezoaFDoViN0bupEWaFbve31hdrlY",
  authDomain: "lexvision-2e2e9.firebaseapp.com",
  projectId: "lexvision-2e2e9",
  storageBucket: "lexvision-2e2e9.firebasestorage.app",
  messagingSenderId: "480708665839",
  appId: "1:480708665839:web:8d6ba05889e847de55d61a",
  measurementId: "G-CHZR6BLB2K"
};

// Initialize Firebase
if (typeof firebase !== 'undefined' && firebase.initializeApp) {
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

  console.log('✅ Firebase initialized successfully');
} else {
  console.error('❌ Firebase SDK not loaded. Please check script tags.');
}

// (Optional) Enable offline persistence for Firestore
if (firebase.firestore) {
  firebase.firestore().enablePersistence()
    .then(() => console.log('✅ Firestore persistence enabled'))
    .catch((err) => console.warn('⚠️ Firestore persistence error:', err));
}
