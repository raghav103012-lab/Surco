window.surcoStartAuth = function surcoStartAuth() {
  const sheet = document.getElementById("account-sheet");
  const open = document.getElementById("open-account");
  const error = document.getElementById("account-error");
  const signedIn = document.getElementById("account-signed-in");
  const signedOut = document.getElementById("account-signed-out");
  if (!sheet || !open) return;

  const showError = (message) => {
    error.hidden = !message;
    error.textContent = message || "";
  };
  const openSheet = () => {
    sheet.hidden = false;
    open.setAttribute("aria-expanded", "true");
  };
  const closeSheet = () => {
    sheet.hidden = true;
    open.setAttribute("aria-expanded", "false");
  };

  open.addEventListener("click", openSheet);
  document.getElementById("close-account").addEventListener("click", closeSheet);
  document.querySelector(".account-veil").addEventListener("click", closeSheet);

  const cfg = window.SURCO_FIREBASE;
  if (!cfg || !cfg.apiKey || !window.firebase) {
    showError("Sign-in is waiting on the Firebase project.");
    return;
  }

  if (!firebase.apps.length) firebase.initializeApp(cfg);
  const auth = firebase.auth();
  const db = firebase.firestore();
  const thread = (uid) => db.collection("users").doc(uid).collection("threads").doc("book").collection("messages");

  window.surcoSaveLine = (role, text) => {
    const user = auth.currentUser;
    if (!user || !text) return;
    thread(user.uid).add({
      role: role === "me" ? "me" : "bot",
      text: String(text).slice(0, 8000),
      at: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch((err) => {
      console.error(err);
      showError("The chat did not save. Stay signed in and try once more.");
    });
  };

  async function loadChat(user) {
    if (!window.surcoChat) return;
    const snap = await thread(user.uid).orderBy("at").limit(80).get();
    if (snap.empty) return;
    window.surcoChat.clear();
    snap.forEach((doc) => {
      const data = doc.data();
      window.surcoChat.add(data.role === "me" ? "me" : "bot", data.text || "");
    });
  }

  auth.onAuthStateChanged((user) => {
    const label = user ? (user.displayName || user.email || "Account") : "";
    window.surcoAccountLabel = label;
    open.textContent = label || "Sign in";
    signedIn.hidden = !user;
    signedOut.hidden = !!user;
    document.getElementById("account-title").textContent = user ? "Account" : "Sign in";
    if (user) {
      document.getElementById("account-who").textContent = label;
      loadChat(user).catch((err) => console.error(err));
    }
  });

  document.getElementById("google-sign-in").addEventListener("click", () => {
    showError("");
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account", login_hint: "raghav103012@gmail.com" });
    auth.signInWithPopup(provider).then(closeSheet).catch((err) => showError(err.message || "Google sign-in did not finish."));
  });

  document.getElementById("email-sign-in").addEventListener("submit", (event) => {
    event.preventDefault();
    showError("");
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    auth.signInWithEmailAndPassword(email, password).then(closeSheet).catch((err) => showError(err.message || "That email and password did not match."));
  });

  document.getElementById("create-account").addEventListener("click", () => {
    showError("");
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    if (!email || password.length < 6) {
      showError("Use an email and a password of at least 6 characters.");
      return;
    }
    auth.createUserWithEmailAndPassword(email, password).then(closeSheet).catch((err) => showError(err.message || "The account was not created."));
  });

  document.getElementById("sign-out").addEventListener("click", () => {
    auth.signOut().then(closeSheet);
  });
};
