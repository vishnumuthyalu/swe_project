// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBaInuG2Ngda9h4MSqbQOulLO-TrtE8-kk",
  authDomain: "sweprojects25.firebaseapp.com",
  projectId: "sweprojects25",
  storageBucket: "sweprojects25.firebasestorage.app",
  messagingSenderId: "572125818186",
  appId: "1:572125818186:web:f7184e1fe9e649da6465b3",
  measurementId: "G-NMJZZ2CVWQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export{app, auth}