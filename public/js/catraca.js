async function registerAccess(type) {
  const userInput = document.querySelector("#access-user");
  const memberId = userInput.value.trim();
  if (!memberId) return showMessage("#access-message", "Informe o código do membro.", true);
  const record = { libraryId: getLibraryId(), memberId, turnstileId: "catraca_01", type, timestamp: new Date().toISOString(), registeredBy: currentUserId() };
  try {
    if (window.libraryFirebase?.functions) await window.libraryFirebase.functions.httpsCallable("registerTurnstileEvent")({ memberId, turnstileId: record.turnstileId, type });
    else if (demoOrCollection("turnstileEvents")) await demoOrCollection("turnstileEvents").add(record);
    else libraryDemo.access.unshift({ id: `demo-${Date.now()}`, ...record, userName: memberId });
    userInput.value = "";
    showMessage("#access-message", `${type === "entry" ? "Entrada" : "Saída"} registrada para ${name}.`);
    renderAccess();
  } catch (error) { showMessage("#access-message", "Não foi possível registrar o acesso.", true); }
}

async function renderAccess() {
  const body = document.querySelector("#access-rows");
  if (!body) return;
  let records = libraryDemo.access;
  if (demoOrCollection("turnstileEvents")) { const snapshot = await demoOrCollection("turnstileEvents").where("libraryId", "==", getLibraryId()).limit(20).get(); records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))); }
  body.innerHTML = records.map((item) => `<tr><td>${formatDateTime(item.timestamp)}</td><td><strong>${escapeHtml(item.memberId || item.userName)}</strong></td><td><span class="badge ${item.type === "exit" ? "warn" : ""}">${item.type === "entry" ? "Entrada" : "Saída"}</span></td></tr>`).join("") || `<tr><td colspan="3" class="empty">Nenhum acesso registrado.</td></tr>`;
}

document.addEventListener("DOMContentLoaded", () => { document.querySelector("#entry-button")?.addEventListener("click", () => registerAccess("entry")); document.querySelector("#exit-button")?.addEventListener("click", () => registerAccess("exit")); renderAccess(); });
