async function getComputers() {
	if (demoOrCollection("computers")) { const snapshot = await demoOrCollection("computers").where("libraryId", "==", getLibraryId()).get(); return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); }
	return libraryDemo.computers;
}

async function renderComputers() {
	const body = document.querySelector("#data-rows");
	const computers = await getComputers();
	document.querySelector("#computer-id").innerHTML = computers.filter((item) => item.status === "Disponível").map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} - ${escapeHtml(item.location)}</option>`).join("");
	body.innerHTML = computers.map((item) => `<tr><td><strong>${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.location)}</td><td><span class="badge ${item.status === "Manutenção" ? "danger" : item.status === "Em uso" ? "warn" : ""}">${escapeHtml(item.status)}</span></td></tr>`).join("");
}

async function scheduleComputer(event) {
	event.preventDefault();
	const form = event.currentTarget;
	const date = form.date.value;
	if (date !== tomorrowIso()) return showMessage("#computer-message", "O agendamento só pode ser feito para amanhã.", true);
	const hours = Number(form.hours.value);
	if (!Number.isInteger(hours) || hours < 1 || hours > 8) return showMessage("#computer-message", "Informe entre 1 e 8 horas.", true);
	const reservation = { userName: form.userName.value.trim(), computerId: form.computerId.value, date, startTime: form.startTime.value, hours, status: "scheduled", createdAt: new Date().toISOString(), createdBy: currentUserId() };
	if (!reservation.userName) return showMessage("#computer-message", "Informe o usuário.", true);
	try {
		if (window.libraryFirebase?.functions) {
			await window.libraryFirebase.functions.httpsCallable("createComputerBooking")({ ...reservation, libraryId: getLibraryId() });
		} else if (demoOrCollection("computerBookings")) {
			const sameDay = await demoOrCollection("computerBookings").where("date", "==", date).get();
			if (sameDay.docs.some((doc) => doc.data().computerId === reservation.computerId)) return showMessage("#computer-message", "Essa estação já está agendada para amanhã.", true);
			await demoOrCollection("computerBookings").add({ ...reservation, libraryId: getLibraryId() });
		} else { libraryDemo.reservations = libraryDemo.reservations || []; libraryDemo.reservations.push(reservation); }
		form.reset(); form.date.value = tomorrowIso(); showMessage("#computer-message", "Computador agendado com sucesso.");
	} catch (error) { showMessage("#computer-message", "Não foi possível salvar o agendamento.", true); }
}

document.addEventListener("DOMContentLoaded", () => { document.querySelector("#computer-form")?.addEventListener("submit", scheduleComputer); document.querySelector("#computer-form").date.min = tomorrowIso(); document.querySelector("#computer-form").date.value = tomorrowIso(); renderComputers(); });
