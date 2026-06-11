// Compatibilité shim Inertia → les pages non migrées utilisent encore PageProps
export interface PageProps {
    auth?: { user?: User | null };
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    role: string;
    email_verified_at?: string;
    loyalty_points?: number;
    company_id?: number;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface Vehicle {
    id: number;
    registration_number: string;
    brand: string;
    model: string;
    capacity: number;
    status: string;
    year?: number;
    fuel_type: string;
    last_maintenance_date?: string;
    next_maintenance_date?: string;
    mileage: number;
    last_latitude?: number;
    last_longitude?: number;
    last_gps_update?: string;
}

export interface Trajet {
    id: number;
    trip_number: string;
    departure_city: string;
    arrival_city: string;
    departure_time: string;
    arrival_time: string;
    price: number;
    available_seats: number;
    status: string;
    departure_date: string;
    vehicle: Vehicle | null;
    vehicle_id: number;
    driver_id?: number;
    booked_seats?: number;
    duration?: string;
    type: string;
}

export interface Siege {
    numero: number;
    libre: boolean;
    features?: string[];
}

export interface Billet {
    id: number;
    booking_number: string;
    passenger_name: string;
    passenger_phone: string;
    passenger_email?: string;
    passenger_cnib?: string;
    seat_numbers: number[];
    seats_count: number;
    total_price: number;
    status: string;
    payment_status: string;
    payment_method?: string;
    notification_channel?: string;
    booking_date: string;
    qr_code?: string | null;
    can_cancel?: boolean;
    refund_percentage?: number;
    refund_amount?: number;
    refund_policy?: string;
    trip: Trajet | null;
}

export interface ColisItem {
    id: number;
    tracking_number: string;
    expediteur_name: string;
    expediteur_phone: string;
    destinataire_name: string;
    destinataire_phone: string;
    departure_city: string;
    arrival_city: string;
    weight?: number;
    description?: string;
    type: string;
    status: string;
    price: number;
    expedition_date?: string;
}

// Alias compat
export type Colis = ColisItem;

export interface KpiData {
    trajets_aujourdhui: number;
    reservations_aujourdhui: number;
    revenus_aujourdhui: number;
    vehicules_actifs: number;
    chauffeurs_actifs: number;
    reservations_en_attente: number;
}

export interface Fidelite {
    points: number;
    tier: { key: string; label: string; discount: number };
    next: { key: string; label: string; needed: number } | null;
    progress: number;
}
