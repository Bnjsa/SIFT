// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyDXnjZwlqH7hheBJpBVQEKEVtKy7RIm5c4",
  authDomain: "sift-3faf2.firebaseapp.com",
  projectId: "sift-3faf2",
  storageBucket: "sift-3faf2.appspot.com",
  messagingSenderId: "295804083362",
  appId: "1:295804083362:web:65b982f53eb63ea5900bfb",
  measurementId: "G-MG3FWPS1NJ"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Firestore
const db = firebase.firestore();
