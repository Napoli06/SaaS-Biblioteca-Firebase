async function registerVisitor(event) {
	event.preventDefault();
	const form = event.currentTarget;
	const user = { libraryId: getLibraryId(), name: form.name.value.trim(), email: form.email.value.trim(), document: form.document.value.trim(), phone: form.phone.value.trim(), cardNumber: form.cardNumber.value.trim(), type: form.type.value, active: true, createdAt: new Date().toISOString(), createdBy: currentUserId() };
	if (!user.name || !user.email) return showMessage("#reception-message", "Nome e e-mail são obrigatórios.", true);
	try {
		if (demoOrCollection("members")) await demoOrCollection("members").doc(user.cardNumber).set(user);
		else libraryDemo.members.unshift({ id: `demo-${Date.now()}`, ...user, status: "Ativo" });
		form.reset();
		showMessage("#reception-message", `Usuário ${user.name} cadastrado na recepção.`);
	} catch (error) { showMessage("#reception-message", "Não foi possível cadastrar o usuário.", true); }
}
document.addEventListener("DOMContentLoaded", () => document.querySelector("#checkin-form")?.addEventListener("submit", registerVisitor));
