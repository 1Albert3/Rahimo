import api from './client';

export async function getDriverTrips() {
    const { data } = await api.get('/chauffeur/trajets');
    return data;
}

export async function getDriverCourses() {
    const { data } = await api.get('/chauffeur/formations');
    return data;
}

export async function getDriverCourse(courseId: number) {
    const { data } = await api.get(`/chauffeur/formations/${courseId}`);
    return data;
}

export async function submitQuiz(quizId: number, payload: Record<string, unknown>) {
    const { data } = await api.post(`/chauffeur/formations/quiz/${quizId}`, payload);
    return data;
}

export async function getDriverAlerts() {
    const { data } = await api.get('/chauffeur/alertes');
    return data;
}

// Profile
export async function updateProfile(payload: Record<string, unknown>) {
    const { data } = await api.patch('/profile', payload);
    return data;
}

export async function updatePassword(payload: Record<string, unknown>) {
    const { data } = await api.patch('/profile/password', payload);
    return data;
}
