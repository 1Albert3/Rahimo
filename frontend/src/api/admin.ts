import api from './client';

// ── Dashboard ──────────────────────────────────────────────────────────────────

export async function getDashboard() {
    const { data } = await api.get('/admin/dashboard');
    return data;
}

export async function getManifeste() {
    const { data } = await api.get('/admin/manifeste');
    return data;
}

// ── Flotte ─────────────────────────────────────────────────────────────────────

export async function getFleet() {
    const { data } = await api.get('/admin/flotte');
    return data;
}

export async function storeVehicle(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/flotte', payload);
    return data;
}

export async function updateVehicle(id: number, payload: Record<string, unknown>) {
    const { data } = await api.put(`/admin/flotte/${id}`, payload);
    return data;
}

export async function deleteVehicle(id: number) {
    await api.delete(`/admin/flotte/${id}`);
}

export async function getGpsData() {
    const { data } = await api.get('/admin/flotte/gps');
    return data;
}

export async function simulateGps(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/flotte/gps/simuler', payload);
    return data;
}

// ── Maintenance ────────────────────────────────────────────────────────────────

export async function getMaintenance() {
    const { data } = await api.get('/admin/maintenance');
    return data;
}

export async function storeMaintenance(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/maintenance', payload);
    return data;
}

export async function completeMaintenance(id: number) {
    const { data } = await api.patch(`/admin/maintenance/${id}/terminer`);
    return data;
}

// ── Trajets ────────────────────────────────────────────────────────────────────

export async function getTrips() {
    const { data } = await api.get('/admin/trajets');
    return data;
}

export async function storeTrip(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/trajets', payload);
    return data;
}

export async function updateTrip(id: number, payload: Record<string, unknown>) {
    const { data } = await api.put(`/admin/trajets/${id}`, payload);
    return data;
}

export async function deleteTrip(id: number) {
    await api.delete(`/admin/trajets/${id}`);
}

// ── Planning ───────────────────────────────────────────────────────────────────

export async function getPlanning() {
    const { data } = await api.get('/admin/planning');
    return data;
}

export async function assignPlanning(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/planning/assigner', payload);
    return data;
}

// ── Alertes Vitesse ────────────────────────────────────────────────────────────

export async function getSpeedAlerts() {
    const { data } = await api.get('/admin/alertes-vitesse');
    return data;
}

export async function acknowledgeSpeedAlert(id: number) {
    const { data } = await api.post(`/admin/alertes-vitesse/${id}/acquitter`);
    return data;
}

export async function resolveSpeedAlert(id: number) {
    const { data } = await api.post(`/admin/alertes-vitesse/${id}/resoudre`);
    return data;
}

// ── Embarquement ───────────────────────────────────────────────────────────────

export async function verifyQr(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/embarquement/verifier', payload);
    return data;
}

export async function confirmBoarding(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/embarquement/confirmer', payload);
    return data;
}

// ── Notifications ──────────────────────────────────────────────────────────────

export async function getNotifications() {
    const { data } = await api.get('/admin/notifications');
    return data;
}

export async function sendNotification(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/notifications/envoyer', payload);
    return data;
}

// ── Alertes ────────────────────────────────────────────────────────────────────

export async function getAlertes() {
    const { data } = await api.get('/admin/alertes');
    return data;
}

export async function storeAlerte(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/alertes', payload);
    return data;
}

export async function traiterAlerte(id: number) {
    const { data } = await api.patch(`/admin/alertes/${id}/traiter`);
    return data;
}

// ── Rapports ───────────────────────────────────────────────────────────────────

export async function getRapports() {
    const { data } = await api.get('/admin/rapports');
    return data;
}

export async function exportRapports(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/rapports/export', payload);
    return data;
}

export async function getAdvancedRapports() {
    const { data } = await api.get('/admin/rapports-avances');
    return data;
}

// ── Réclamations ───────────────────────────────────────────────────────────────

export async function getReclamations() {
    const { data } = await api.get('/admin/reclamations');
    return data;
}

export async function storeReclamation(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/reclamations', payload);
    return data;
}

export async function updateReclamationStatus(id: number, payload: Record<string, unknown>) {
    const { data } = await api.patch(`/admin/reclamations/${id}/statut`, payload);
    return data;
}

// ── Objets Trouvés ─────────────────────────────────────────────────────────────

export async function getLostItems() {
    const { data } = await api.get('/admin/objets-trouves');
    return data;
}

export async function updateLostItem(id: number, payload: Record<string, unknown>) {
    const { data } = await api.patch(`/admin/objets-trouves/${id}`, payload);
    return data;
}

// ── Guichet ────────────────────────────────────────────────────────────────────

export async function getGuichet() {
    const { data } = await api.get('/admin/guichet');
    return data;
}

export async function storeGuichet(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/guichet', payload);
    return data;
}

// ── Colis ──────────────────────────────────────────────────────────────────────

export async function getColis() {
    const { data } = await api.get('/admin/colis');
    return data;
}

export async function storeColis(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/colis', payload);
    return data;
}

export async function updateColisStatus(id: number, payload: Record<string, unknown>) {
    const { data } = await api.patch(`/admin/colis/${id}/statut`, payload);
    return data;
}

// ── Bagages ────────────────────────────────────────────────────────────────────

export async function getBagages() {
    const { data } = await api.get('/admin/bagages');
    return data;
}

export async function storeBagage(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/bagages', payload);
    return data;
}

export async function scanBagage(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/bagages/scanner', payload);
    return data;
}

export async function getBagage(id: number) {
    const { data } = await api.get(`/admin/bagages/${id}`);
    return data;
}

export async function getBagageManifest(tripId: number) {
    const { data } = await api.get(`/admin/bagages/trajet/${tripId}`);
    return data;
}

// ── Police ─────────────────────────────────────────────────────────────────────

export async function getPolice() {
    const { data } = await api.get('/admin/police');
    return data;
}

export async function verifyPassenger(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/police/verifier', payload);
    return data;
}

export async function verifyTrip(tripId: number) {
    const { data } = await api.post(`/admin/police/verifier-trajet/${tripId}`);
    return data;
}

export async function getWatchlist() {
    const { data } = await api.get('/admin/police/surveillance');
    return data;
}

export async function addToWatchlist(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/police/surveillance', payload);
    return data;
}

export async function removeFromWatchlist(id: number) {
    const { data } = await api.post(`/admin/police/surveillance/${id}/retirer`);
    return data;
}

export async function getCheckLogs() {
    const { data } = await api.get('/admin/police/verifications');
    return data;
}

// ── Fraude ─────────────────────────────────────────────────────────────────────

export async function getFraud() {
    const { data } = await api.get('/admin/fraude');
    return data;
}

export async function resolveFraud(id: number) {
    const { data } = await api.post(`/admin/fraude/${id}/resoudre`);
    return data;
}

export async function dismissFraud(id: number) {
    const { data } = await api.post(`/admin/fraude/${id}/classer`);
    return data;
}

// ── Sécurité ───────────────────────────────────────────────────────────────────

export async function getSecurityDashboard() {
    const { data } = await api.get('/admin/securite');
    return data;
}

export async function storeSecurityAlert(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/securite/alertes', payload);
    return data;
}

export async function resolveSecurityAlert(id: number) {
    const { data } = await api.post(`/admin/securite/alertes/${id}/resoudre`);
    return data;
}

export async function storeIncident(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/securite/incidents', payload);
    return data;
}

export async function resolveIncident(id: number) {
    const { data } = await api.post(`/admin/securite/incidents/${id}/resoudre`);
    return data;
}

export async function getSecurityManifeste(tripId: number) {
    const { data } = await api.get(`/admin/securite/manifeste/${tripId}`);
    return data;
}

// ── Formations ─────────────────────────────────────────────────────────────────

export async function getCourses() {
    const { data } = await api.get('/admin/formations');
    return data;
}

export async function storeCourse(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/formations', payload);
    return data;
}

export async function updateCourse(id: number, payload: Record<string, unknown>) {
    const { data } = await api.put(`/admin/formations/${id}`, payload);
    return data;
}

export async function deleteCourse(id: number) {
    await api.delete(`/admin/formations/${id}`);
}

export async function getQuizzes(courseId: number) {
    const { data } = await api.get(`/admin/formations/${courseId}/quiz`);
    return data;
}

export async function storeQuiz(courseId: number, payload: Record<string, unknown>) {
    const { data } = await api.post(`/admin/formations/${courseId}/quiz`, payload);
    return data;
}

export async function getCertificates() {
    const { data } = await api.get('/admin/certificats');
    return data;
}

export async function issueCertificate(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/certificats/emettre', payload);
    return data;
}

// ── RH ─────────────────────────────────────────────────────────────────────────

export async function getRhDashboard() {
    const { data } = await api.get('/admin/rh/dashboard');
    return data;
}

export async function getPersonnel() {
    const { data } = await api.get('/admin/rh/personnel');
    return data;
}

export async function getPersonnelShow(id: number) {
    const { data } = await api.get(`/admin/rh/personnel/${id}`);
    return data;
}

export async function getContrats() {
    const { data } = await api.get('/admin/rh/contrats');
    return data;
}

export async function storeContrat(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/rh/contrats', payload);
    return data;
}

export async function updateContrat(id: number, payload: Record<string, unknown>) {
    const { data } = await api.put(`/admin/rh/contrats/${id}`, payload);
    return data;
}

export async function getConges() {
    const { data } = await api.get('/admin/rh/conges');
    return data;
}

export async function storeConge(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/rh/conges', payload);
    return data;
}

export async function approuverConge(id: number) {
    const { data } = await api.post(`/admin/rh/conges/${id}/approuver`);
    return data;
}

export async function rejeterConge(id: number) {
    const { data } = await api.post(`/admin/rh/conges/${id}/rejeter`);
    return data;
}

export async function getPointage() {
    const { data } = await api.get('/admin/rh/pointage');
    return data;
}

export async function storePointage(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/rh/pointage', payload);
    return data;
}

export async function getPaie(params?: Record<string, string>) {
    const { data } = await api.get('/admin/rh/paie', { params });
    return data;
}

export async function genererPaie(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/rh/paie/generer', payload);
    return data;
}

export async function payerPaie(id: number) {
    const { data } = await api.patch(`/admin/rh/paie/${id}/payer`);
    return data;
}

// ── Finance ────────────────────────────────────────────────────────────────────

export async function getComptabilite() {
    const { data } = await api.get('/admin/comptabilite');
    return data;
}

export async function getDepenses() {
    const { data } = await api.get('/admin/depenses');
    return data;
}

export async function storeDepense(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/depenses', payload);
    return data;
}

export async function validerDepense(id: number) {
    const { data } = await api.patch(`/admin/depenses/${id}/valider`);
    return data;
}

export async function ouvrirCaisse(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/caisses/ouvrir', payload);
    return data;
}

export async function fermerCaisse(id: number, payload?: Record<string, unknown>) {
    const { data } = await api.post(`/admin/caisses/${id}/fermer`, payload);
    return data;
}

export async function getFactures() {
    const { data } = await api.get('/admin/factures');
    return data;
}

export async function storeFacture(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/factures', payload);
    return data;
}

export async function payerFacture(id: number) {
    const { data } = await api.post(`/admin/factures/${id}/payer`);
    return data;
}

export async function annulerFacture(id: number) {
    const { data } = await api.post(`/admin/factures/${id}/annuler`);
    return data;
}

export async function getGrandLivre() {
    const { data } = await api.get('/admin/grand-livre');
    return data;
}

export async function getBilan() {
    const { data } = await api.get('/admin/bilan');
    return data;
}

export async function getBudgets() {
    const { data } = await api.get('/admin/budgets');
    return data;
}

export async function storeBudget(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/budgets', payload);
    return data;
}

export async function getPaiements() {
    const { data } = await api.get('/admin/paiements');
    return data;
}

export async function rembourserPaiement(id: number) {
    const { data } = await api.post(`/admin/paiements/${id}/rembourser`);
    return data;
}

export async function verifierPaiement(id: number) {
    const { data } = await api.post(`/admin/paiements/${id}/verifier`);
    return data;
}

// ── Services ───────────────────────────────────────────────────────────────────

export async function getParking() {
    const { data } = await api.get('/admin/services/parking');
    return data;
}

export async function storeParking(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/services/parking', payload);
    return data;
}

export async function parkingSortir(id: number) {
    const { data } = await api.post(`/admin/services/parking/${id}/sortir`);
    return data;
}

export async function getLocation() {
    const { data } = await api.get('/admin/services/location');
    return data;
}

export async function storeLocation(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/services/location', payload);
    return data;
}

export async function terminerLocation(id: number) {
    const { data } = await api.post(`/admin/services/location/${id}/terminer`);
    return data;
}

export async function getHebergement() {
    const { data } = await api.get('/admin/services/hebergement');
    return data;
}

export async function storeHebergement(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/services/hebergement', payload);
    return data;
}

export async function checkinHebergement(id: number) {
    const { data } = await api.post(`/admin/services/hebergement/${id}/checkin`);
    return data;
}

export async function checkoutHebergement(id: number) {
    const { data } = await api.post(`/admin/services/hebergement/${id}/checkout`);
    return data;
}

export async function getMotoTransport() {
    const { data } = await api.get('/admin/services/moto-transport');
    return data;
}

export async function storeMotoTransport(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/services/moto-transport', payload);
    return data;
}

export async function updateMotoTransportStatus(id: number, payload: Record<string, unknown>) {
    const { data } = await api.post(`/admin/services/moto-transport/${id}/status`, payload);
    return data;
}

// ── Utilisateurs ───────────────────────────────────────────────────────────────

export async function getUsers() {
    const { data } = await api.get('/admin/utilisateurs');
    return data;
}

export async function storeUser(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/utilisateurs', payload);
    return data;
}

export async function updateUser(id: number, payload: Record<string, unknown>) {
    const { data } = await api.put(`/admin/utilisateurs/${id}`, payload);
    return data;
}

export async function deleteUser(id: number) {
    await api.delete(`/admin/utilisateurs/${id}`);
}

// ── Villes ─────────────────────────────────────────────────────────────────────

export async function getCities() {
    const { data } = await api.get('/admin/villes');
    return data;
}

export async function storeCity(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/villes', payload);
    return data;
}

export async function updateCity(id: number, payload: Record<string, unknown>) {
    const { data } = await api.put(`/admin/villes/${id}`, payload);
    return data;
}

export async function deleteCity(id: number) {
    await api.delete(`/admin/villes/${id}`);
}

// ── Compagnies ─────────────────────────────────────────────────────────────────

export async function getCompanies() {
    const { data } = await api.get('/admin/compagnies');
    return data;
}

export async function storeCompany(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/compagnies', payload);
    return data;
}

export async function updateCompany(id: number, payload: Record<string, unknown>) {
    const { data } = await api.put(`/admin/compagnies/${id}`, payload);
    return data;
}

// ── Gares ──────────────────────────────────────────────────────────────────────

export async function getStations() {
    const { data } = await api.get('/admin/gares');
    return data;
}

export async function storeStation(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/gares', payload);
    return data;
}

export async function updateStation(id: number, payload: Record<string, unknown>) {
    const { data } = await api.put(`/admin/gares/${id}`, payload);
    return data;
}

export async function storeStationRoute(payload: Record<string, unknown>) {
    const { data } = await api.post('/admin/gares/routes', payload);
    return data;
}
