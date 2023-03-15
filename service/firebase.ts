// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUZYXotNoB0B4c05WlDEAzGHY23ofBKbs",
  authDomain: "gptordle.firebaseapp.com",
  projectId: "gptordle",
  storageBucket: "gptordle.appspot.com",
  messagingSenderId: "776407952120",
  appId: "1:776407952120:web:4293c7e57ae7300856a90d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
