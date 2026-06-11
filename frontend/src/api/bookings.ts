import api from './client';

export interface Booking {
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
    payment_method: string;
    booking_date: string;
    qr_code?: string;
    can_cancel: boolean;
    refund_percentage: number;
    refund_amount: number;
    refund_policy: string;
    trip?: {
        id: number;
        trip_number: string;
        departure_city: string;
        arrival_city: string;
        departure_date: string;
        departure_time: string;
        arrival_time: string;
        price: number;
        duration?: string;
        vehicle?: { registration_number: string; brand: string; model: string; capacity: number };
    };
}

export interface BookingPayload {
    trip_id: number;
    passenger_name: string;
    passenger_phone: string;
    passenger_email?: string;
    passenger_cnib?: string;
    cnib_date_etablissement?: string;
    cnib_date_expiration?: string;
    seat_numbers: number[];
    payment_method: string;
    notification_channel?: string;
    promo_code?: string;
}

export async function createBooking(payload: BookingPayload): Promise<Booking> {
    const { data } = await api.post<Booking>('/bookings', payload);
    return data;
}

export async function getBooking(id: number): Promise<Booking> {
    const { data } = await api.get<Booking>(`/bookings/${id}`);
    return data;
}

export async function getMyBookings(): Promise<{ billets: Booking[]; colis: any[]; fidelite: any; recent_activity: any[] }> {
    const { data } = await api.get('/my-bookings');
    return data;
}

export async function cancelBooking(id: number): Promise<void> {
    await api.post(`/bookings/${id}/cancel`);
}

export async function rescheduleBooking(id: number, new_trip_id: number): Promise<void> {
    await api.post(`/bookings/${id}/reschedule`, { new_trip_id });
}

export async function changeSeat(id: number, seat_numbers: number[]): Promise<void> {
    await api.post(`/bookings/${id}/change-seat`, { seat_numbers });
}

export function pdfUrl(id: number): string {
    return `/bookings/${id}/pdf`;
}
