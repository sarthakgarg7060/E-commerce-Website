import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  getDocs,
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAROM1lMt_-VZSikZDNtl29xrAzbLwywgQ",
  authDomain: "e--commerce-website-9b2fc.firebaseapp.com",
  projectId: "e--commerce-website-9b2fc",
  storageBucket: "e--commerce-website-9b2fc.firebasestorage.app",
  messagingSenderId: "309334590038",
  appId: "1:309334590038:web:22225776cf447d1c5571f7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

function logoutUser() {
  return signOut(auth);
}

function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

async function getAllProducts() {
  const productsSnapshot = await getDocs(collection(db, "Products"));

  return productsSnapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name ?? "Untitled Product",
      price: Number(data.price ?? 0),
      image: data.image ?? ""
    };
  });
}

export {
  getAllProducts,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  signUpWithEmail,
  watchAuthState
};
