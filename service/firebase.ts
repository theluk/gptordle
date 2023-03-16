// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

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
const functions = getFunctions(app);

if (process.env.NEXT_PUBLIC_EMULATE) {
  connectFirestoreEmulator(firestore, "localhost", 8080);

  connectAuthEmulator(auth, "http://localhost:9099", {
    disableWarnings: true,
  });

  connectFunctionsEmulator(functions, "localhost", 5001);
}

export { auth, firestore };
