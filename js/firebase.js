// Sustituye con tus datos de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT",
  storageBucket: "TU_PROJECT.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
