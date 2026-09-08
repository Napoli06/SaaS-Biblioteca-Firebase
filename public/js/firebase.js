const firebaseConfig = {
  apiKey: "COLOQUE_SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.firebasestorage.app",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

const firebaseReady = typeof firebase !== "undefined" && firebaseConfig.projectId !== "SEU_PROJETO";
if (firebaseReady) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebaseReady ? firebase.auth() : null;
const db = firebaseReady ? firebase.firestore() : null;
const functions = firebaseReady && typeof firebase.functions === "function" ? firebase.functions() : null;
window.libraryFirebase = { auth, db, functions, ready: firebaseReady };
