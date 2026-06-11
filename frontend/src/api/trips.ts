import api from './client';

export interface Trip {
    id: number;
    trip_number: string;
    departure_city: string;
    arrival_city: string;
    departure_date: string;
    departure_time: string;
    arrival_time: string;
    price: number;
    available_seats: number;
    status: string;
    duration?: string;
    type: string;
    vehicle?: {
        id: number;
        registration_number: string;
        brand: string;
        model: string;
        capacity: number;
        type: string;
    };
}

export interface Seat {
    numero: number;
    libre: boolean;
    features: string[];
}

export interface SearchFilters {
    departure?: string;
    arrival?: string;
    date?: string;
    passagers?: number;
    bus_type?: string;
    price_max?: number;
    time_from?: string;
    time_to?: string;
    sort_by?: string;
    sort_order?: string;
}

export async function searchTrips(filters: SearchFilters): Promise<Trip[]> {
    const { data } = await api.get('/trips', { params: filters });
    return data.data ?? data;
}

export async function getTrip(id: number): Promise<Trip> {
    const { data } = await api.get<Trip>(`/trips/${id}`);
    return data;
}

export async function getTripSeats(id: number, passagers = 1): Promise<{ trip: Trip; seats: Seat[]; passagers_max: number }> {
    const { data } = await api.get(`/trips/${id}/seats`, { params: { passagers } });
    return data;
}

export async function validatePromo(code: string, amount: number) {
    const { data } = await api.post('/promotions/validate', { code, amount });
    return data;
}
