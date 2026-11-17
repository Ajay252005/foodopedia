import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgw9YETjcfNSz9xB0uSKwVQbgS54LAyhk",
  authDomain: "foodopedia-9731e.firebaseapp.com",
  projectId: "foodopedia-9731e",
  storageBucket: "foodopedia-9731e.firebasestorage.app",
  messagingSenderId: "588546928757",
  appId: "1:588546928757:web:97b4f6dce56e767a92883c",
  measurementId: "G-YYN5C3ZSF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Firebase Analytics not supported in this environment:", err);
});

export { db, analytics };

