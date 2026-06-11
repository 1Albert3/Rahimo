import api from './client';

export async function trackColis(tracking: string) {
    const { data } = await api.get('/colis/track', { params: { tracking } });
    return data;
}

export async function sendColis(payload: Record<string, unknown>) {
    const { data } = await api.post('/colis', payload);
    return data;
}

export async function publicParking(payload: Record<string, unknown>) {
    const { data } = await api.post('/services/parking', payload);
    return data;
}

export async function publicLocation(payload: Record<string, unknown>) {
    const { data } = await api.post('/services/location', payload);
    return data;
}

export async function publicHebergement(payload: Record<string, unknown>) {
    const { data } = await api.post('/services/hebergement', payload);
    return data;
}

export async function publicMotoTransport(payload: Record<string, unknown>) {
    const { data } = await api.post('/services/moto-transport', payload);
    return data;
}

export async function publicReclamation(payload: Record<string, unknown>) {
    const { data } = await api.post('/services/reclamations', payload);
    return data;
}

export async function publicLostAndFound(payload: Record<string, unknown>) {
    const { data } = await api.post('/services/objets-trouves', payload);
    return data;
}
