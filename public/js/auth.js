const demoUser = { email: "admin@biblioteca.local", name: "Administrador" };

function requireAuth() {
  const localUser = sessionStorage.getItem("libraryUser");
  if (!localUser && !location.pathname.endsWith("login.html") && !location.pathname.endsWith("index.html")) {
    location.href = "login.html";
  }
  return localUser ? JSON.parse(localUser) : null;
}

function bindLogin() {
  const form = document.querySelector("#login-form");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;
    try {
      const result = window.libraryFirebase.auth
        ? await window.libraryFirebase.auth.signInWithEmailAndPassword(email, password)
        : { user: { email } };
      let staffProfile = null;
      if (window.libraryFirebase.db) {
        const staffSnapshot = await window.libraryFirebase.db.collection("staff").doc(result.user.uid).get();
        if (staffSnapshot.exists) staffProfile = staffSnapshot.data();
      }
      sessionStorage.setItem("libraryUser", JSON.stringify({ uid: result.user.uid || result.user.email, email: result.user.email, name: staffProfile?.name || "Administrador", role: staffProfile?.role || "admin", libraryId: staffProfile?.libraryId || "biblioteca_001" }));
      location.href = "dashboard.html";
    } catch (error) {
      document.querySelector("#login-message").textContent = "Não foi possível entrar. Verifique seus dados.";
    }
  });
}

function bindLogout() {
  document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", async () => {
    if (window.libraryFirebase && window.libraryFirebase.auth) await window.libraryFirebase.auth.signOut();
    sessionStorage.removeItem("libraryUser");
    location.href = "login.html";
  }));
}

document.addEventListener("DOMContentLoaded", () => { bindLogin(); requireAuth(); bindLogout(); });
