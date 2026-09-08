const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.createLoan = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login necessário.");
  const { bookId, userId, dueDate } = request.data || {};
  if (!bookId || !userId || !dueDate) throw new HttpsError("invalid-argument", "Livro, usuário e prazo são obrigatórios.");
  const loan = { libraryId: request.data.libraryId || "biblioteca_001", bookId, memberId: userId, dueDate, status: "active", createdAt: new Date().toISOString(), createdBy: request.auth.uid };
  const ref = await db.collection("rentals").add(loan);
  return { id: ref.id, ...loan };
});

exports.registerTurnstileEvent = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login necessário.");
  const { memberId, turnstileId, type } = request.data || {};
  if (!memberId || !turnstileId || !["entry", "exit"].includes(type)) throw new HttpsError("invalid-argument", "Dados da catraca inválidos.");
  const memberRef = db.collection("members").doc(memberId);
  const memberSnapshot = await memberRef.get();
  if (!memberSnapshot.exists || memberSnapshot.data().active === false) throw new HttpsError("not-found", "Membro não encontrado ou inativo.");
  const member = memberSnapshot.data();
  const visitQuery = await db.collection("visits").where("memberId", "==", memberId).where("status", "==", "inside").limit(1).get();
  if (type === "entry" && !visitQuery.empty) throw new HttpsError("failed-precondition", "Este membro já está dentro da biblioteca.");
  if (type === "exit" && visitQuery.empty) throw new HttpsError("failed-precondition", "Não existe uma entrada aberta para este membro.");
  const now = new Date();
  const event = { libraryId: member.libraryId, memberId, turnstileId, type, timestamp: now.toISOString(), registeredBy: request.auth.uid };
  const eventRef = db.collection("turnstileEvents").doc();
  const visitRef = type === "entry" ? db.collection("visits").doc() : db.collection("visits").doc(visitQuery.docs[0].id);
  const batch = db.batch();
  batch.set(eventRef, event);
  if (type === "entry") batch.set(visitRef, { libraryId: member.libraryId, memberId, entryAt: now.toISOString(), exitAt: null, status: "inside" });
  else batch.update(visitRef, { exitAt: now.toISOString(), status: "finished" });
  await batch.commit();
  return { eventId: eventRef.id, visitId: visitRef.id };
});

exports.createComputerBooking = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login necessário.");
  const { libraryId, userName, computerId, date, startTime, hours } = request.data || {};
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().slice(0, 10);
  if (date !== tomorrowIso) throw new HttpsError("failed-precondition", "Computadores só podem ser agendados para amanhã.");
  if (!libraryId || !userName || !computerId || !startTime || !Number.isInteger(hours) || hours < 1 || hours > 8) throw new HttpsError("invalid-argument", "Dados da reserva inválidos.");
  const conflict = await db.collection("computerBookings").where("libraryId", "==", libraryId).where("computerId", "==", computerId).where("date", "==", date).limit(1).get();
  if (!conflict.empty) throw new HttpsError("already-exists", "Essa estação já está reservada para amanhã.");
  const booking = { libraryId, userName, computerId, date, startTime, hours, status: "scheduled", createdAt: new Date().toISOString(), createdBy: request.auth.uid };
  const ref = await db.collection("computerBookings").add(booking);
  return { id: ref.id, ...booking };
});
