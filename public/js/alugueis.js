async function renderLoans() {
	const body = document.querySelector("#data-rows");
	let loans = libraryDemo.rentals;
	if (demoOrCollection("rentals")) { const snapshot = await demoOrCollection("rentals").where("libraryId", "==", getLibraryId()).limit(50).get(); loans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); }
	body.innerHTML = loans.map((item) => `<tr><td><strong>${escapeHtml(item.book || item.bookTitle)}</strong></td><td>${escapeHtml(item.user || item.userName)}</td><td>${escapeHtml(item.due || item.dueDate)}</td><td><span class="badge ${item.status === "Atrasado" ? "danger" : ""}">${escapeHtml(item.status || "Em andamento")}</span></td></tr>`).join("") || `<tr><td colspan="4" class="empty">Nenhum aluguel registrado.</td></tr>`;
}

async function createLoan(event) {
	event.preventDefault();
	const form = event.currentTarget;
	const loan = { libraryId: getLibraryId(), bookTitle: form.bookTitle.value.trim(), userName: form.userName.value.trim(), dueDate: form.dueDate.value, status: "active", createdAt: new Date().toISOString(), createdBy: currentUserId() };
	if (!loan.bookTitle || !loan.userName || !loan.dueDate) return showMessage("#loan-message", "Preencha livro, usuário e devolução.", true);
	try { if (demoOrCollection("rentals")) await demoOrCollection("rentals").add(loan); else libraryDemo.rentals.unshift(loan); form.reset(); showMessage("#loan-message", "Aluguel registrado."); renderLoans(); } catch (error) { showMessage("#loan-message", "Não foi possível registrar o aluguel.", true); }
}

document.addEventListener("DOMContentLoaded", () => { document.querySelector("#loan-form")?.addEventListener("submit", createLoan); renderLoans(); });
