const libraryDemo = {
  members: [{ id: "member-ana", name: "Ana Souza", email: "ana@email.com", document: "00000000000", type: "Estudante", status: "Ativo" }],
  computers: [{ id: "computer-01", name: "Estação 01", location: "Sala de estudos", status: "Disponível" }, { id: "computer-02", name: "Estação 02", location: "Sala de estudos", status: "Em uso" }, { id: "computer-03", name: "Estação 03", location: "Laboratório", status: "Manutenção" }],
  rentals: [{ book: "Torto Arado", user: "Ana Souza", due: "12/09/2026", status: "active" }],
  access: []
};

function getFirebaseDb() { return window.libraryFirebase && window.libraryFirebase.db; }
function demoOrCollection(name) { return getFirebaseDb() ? getFirebaseDb().collection(name) : null; }
function getLibraryId() { return JSON.parse(sessionStorage.getItem("libraryUser") || "null")?.libraryId || "biblioteca_001"; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function showMessage(selector, message, isError = false) { const element = document.querySelector(selector); if (element) { element.textContent = message; element.style.color = isError ? "var(--red)" : "var(--green)"; } }
function todayIso() { return new Date().toISOString().slice(0, 10); }
function tomorrowIso() { const date = new Date(); date.setDate(date.getDate() + 1); return date.toISOString().slice(0, 10); }
function formatDateTime(value) { return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "-"; }
function currentUserId() { const user = JSON.parse(sessionStorage.getItem("libraryUser") || "null"); return user && (user.uid || user.email) || "anonymous"; }
