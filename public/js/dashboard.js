document.addEventListener("DOMContentLoaded", () => {
  const data = [
    ["O Cortiço", "Aluísio Azevedo", "Disponível"],
    ["Torto Arado", "Itamar Vieira Junior", "Emprestado"],
    ["Dom Casmurro", "Machado de Assis", "Disponível"]
  ];
  const rows = document.querySelector("#recent-books");
  if (rows) rows.innerHTML = data.map(([title, author, status]) => `<tr><td><strong>${title}</strong></td><td>${author}</td><td><span class="badge ${status === "Emprestado" ? "warn" : ""}">${status}</span></td></tr>`).join("");
});
