import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/Components/LoadingSpinner';

// ── Layouts (importés directement pour éviter les erreurs de chunk) ──────────
import GuestLayout      from '@/Layouts/GuestLayout';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import DriverLayout     from '@/Layouts/DriverLayout';

// ── Auth ──────────────────────────────────────────────────────────────────────
const Login       = lazy(() => import('@/Pages/Auth/Login'));
const Register    = lazy(() => import('@/Pages/Auth/Register'));
const ForgotPw    = lazy(() => import('@/Pages/Auth/ForgotPassword'));
const ResetPw     = lazy(() => import('@/Pages/Auth/ResetPassword'));

// ── Public ───────────────────────────────────────────────────────────────────
const Welcome       = lazy(() => import('@/Pages/Welcome'));
const Search        = lazy(() => import('@/Pages/Trips/Search'));
const SeatSelection = lazy(() => import('@/Pages/Trips/SeatSelection'));
const Checkout      = lazy(() => import('@/Pages/Trips/Checkout'));
const Confirmation  = lazy(() => import('@/Pages/Trips/Confirmation'));
const ColisTrack    = lazy(() => import('@/Pages/Colis/Track'));
const ColisSend     = lazy(() => import('@/Pages/Colis/Send'));
const ServicesIndex = lazy(() => import('@/Pages/Services/Index'));
const SvcParking    = lazy(() => import('@/Pages/Services/Parking'));
const SvcLocation   = lazy(() => import('@/Pages/Services/Location'));
const SvcHeberg     = lazy(() => import('@/Pages/Services/Hebergement'));
const SvcMoto       = lazy(() => import('@/Pages/Services/MotoTransport'));
const SvcReclam     = lazy(() => import('@/Pages/Services/Reclamations'));
const LostFound     = lazy(() => import('@/Pages/Services/LostAndFound'));

// ── Client ───────────────────────────────────────────────────────────────────
const ClientDashboard = lazy(() => import('@/Pages/Client/Dashboard'));

// ── Admin ─────────────────────────────────────────────────────────────────────
const AdminDashboard   = lazy(() => import('@/Pages/Admin/Dashboard'));
const AdminGuichet     = lazy(() => import('@/Pages/Admin/Guichet'));
const AdminColis       = lazy(() => import('@/Pages/Admin/Colis'));
const AdminManifeste   = lazy(() => import('@/Pages/Admin/Manifeste'));
const AdminFlotte      = lazy(() => import('@/Pages/Admin/Flotte'));
const AdminGpsMap      = lazy(() => import('@/Pages/Admin/GpsMap'));
const AdminMaintenance = lazy(() => import('@/Pages/Admin/Maintenance'));
const AdminSpeedAlerts = lazy(() => import('@/Pages/Admin/SpeedAlerts'));
const AdminTrajets     = lazy(() => import('@/Pages/Admin/Trajets'));
const AdminPlanning    = lazy(() => import('@/Pages/Admin/Planning'));
const AdminEmbarquement= lazy(() => import('@/Pages/Admin/Embarquement'));
const AdminAlertes     = lazy(() => import('@/Pages/Admin/Alertes'));
const AdminRapports    = lazy(() => import('@/Pages/Admin/Rapports'));
const AdminNotifs      = lazy(() => import('@/Pages/Admin/Notifications'));
const AdminReclamations= lazy(() => import('@/Pages/Admin/Reclamations'));
const AdminLostItems   = lazy(() => import('@/Pages/Admin/LostItems'));
const AdminUtilisateurs= lazy(() => import('@/Pages/Admin/Utilisateurs'));
const AdminCompta      = lazy(() => import('@/Pages/Admin/Comptabilite'));
const AdminPaiements   = lazy(() => import('@/Pages/Admin/Paiements/Index'));
const AdminFormations  = lazy(() => import('@/Pages/Admin/Formations'));
const AdminFormDetail  = lazy(() => import('@/Pages/Admin/FormationDetail'));
const AdminCertificats = lazy(() => import('@/Pages/Admin/Formations/Certificats'));
const AdminSecurite    = lazy(() => import('@/Pages/Admin/Securite'));
const AdminSecManifeste= lazy(() => import('@/Pages/Admin/Securite/Manifeste'));
const AdminPolice      = lazy(() => import('@/Pages/Admin/Police/Index'));
const AdminWatchlist   = lazy(() => import('@/Pages/Admin/Police/Watchlist'));
const AdminCheckLogs   = lazy(() => import('@/Pages/Admin/Police/CheckLogs'));
const AdminFraude      = lazy(() => import('@/Pages/Admin/Fraude/Index'));
const AdminBagages     = lazy(() => import('@/Pages/Admin/Bagages/Index'));
const AdminBagManifest = lazy(() => import('@/Pages/Admin/Bagages/Manifest'));
const AdminParkingSvc  = lazy(() => import('@/Pages/Admin/Services/Parking'));
const AdminLocationSvc = lazy(() => import('@/Pages/Admin/Services/Location'));
const AdminHeberg      = lazy(() => import('@/Pages/Admin/Services/Hebergement'));
const AdminMotoSvc     = lazy(() => import('@/Pages/Admin/Services/MotoTransport'));
const AdminVilles      = lazy(() => import('@/Pages/Admin/Cities/Index'));
const AdminCompagnies  = lazy(() => import('@/Pages/Admin/Companies/Index'));
const AdminStations    = lazy(() => import('@/Pages/Admin/Stations/Index'));
// Finance
const AdminDepenses    = lazy(() => import('@/Pages/Admin/Finance/Expenses'));
const AdminFactures    = lazy(() => import('@/Pages/Admin/Finance/Factures'));
const AdminGrandLivre  = lazy(() => import('@/Pages/Admin/Finance/GrandLivre'));
const AdminBilan       = lazy(() => import('@/Pages/Admin/Finance/Bilan'));
const AdminBudgets     = lazy(() => import('@/Pages/Admin/Finance/Budgets'));
// RH
const RhDashboard  = lazy(() => import('@/Pages/Admin/Rh/Dashboard'));
const RhPersonnel  = lazy(() => import('@/Pages/Admin/Rh/Personnel'));
const RhContrats   = lazy(() => import('@/Pages/Admin/Rh/Contrats'));
const RhConges     = lazy(() => import('@/Pages/Admin/Rh/Conges'));
const RhPointage   = lazy(() => import('@/Pages/Admin/Rh/Pointage'));
const RhPaie       = lazy(() => import('@/Pages/Admin/Rh/Paie'));

// ── Driver ────────────────────────────────────────────────────────────────────
const DriverTrips = lazy(() => import('@/Pages/Driver/Trips'));

// ── Profile ───────────────────────────────────────────────────────────────────
const ProfileEdit = lazy(() => import('@/Pages/Profile/Edit'));

// ── Guards ────────────────────────────────────────────────────────────────────
const ADMIN_ROLES = ['directeur_general','responsable_flotte','comptable','chef_garde','guichetiere','agent_police','bagagiste'];

function R(C: React.LazyExoticComponent<React.ComponentType<any>>) {
    return <Suspense fallback={<LoadingSpinner />}><C /></Suspense>;
}

function RequireAuth({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    return user ? children : <Navigate to="/login" replace />;
}

function RequireRole({ roles, children }: { roles: string[]; children: JSX.Element }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" replace />;
    if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
    return children;
}

function DashboardRedirect() {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (!user) return <Navigate to="/login" replace />;
    if (ADMIN_ROLES.includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'chauffeur') return <Navigate to="/chauffeur/trajets" replace />;
    return <Navigate to="/mon-espace" replace />;
}

function GuestOutlet() {
    return <GuestLayout><Outlet /></GuestLayout>;
}

function AdminOutlet() {
    return <BackOfficeLayout><Outlet /></BackOfficeLayout>;
}

function DriverOutlet() {
    return <DriverLayout><Outlet /></DriverLayout>;
}

export default function AppRoutes() {
    return (
        <Routes>
            {/* ── Public pages (with GuestLayout = Header + Footer) ── */}
            <Route element={<GuestOutlet />}>
                <Route path="/" element={R(Welcome)} />
                <Route path="/voyages" element={R(Search)} />
                <Route path="/voyages/:id/sieges" element={R(SeatSelection)} />
                <Route path="/paiement" element={R(Checkout)} />
                <Route path="/reservation/:id" element={R(Confirmation)} />
                <Route path="/colis/suivi" element={R(ColisTrack)} />
                <Route path="/colis/envoyer" element={R(ColisSend)} />
                <Route path="/services" element={R(ServicesIndex)} />
                <Route path="/services/parking" element={R(SvcParking)} />
                <Route path="/services/location" element={R(SvcLocation)} />
                <Route path="/services/hebergement" element={R(SvcHeberg)} />
                <Route path="/services/moto-transport" element={R(SvcMoto)} />
                <Route path="/services/reclamations" element={R(SvcReclam)} />
                <Route path="/services/objets-trouves" element={R(LostFound)} />
                <Route path="/mon-espace" element={<RequireRole roles={['client']}>{R(ClientDashboard)}</RequireRole>} />
            </Route>

            {/* ── Auth pages (no layout, they embed GuestLayout themselves) ── */}
            <Route path="/login" element={R(Login)} />
            <Route path="/register" element={R(Register)} />
            <Route path="/mot-de-passe-oublie" element={R(ForgotPw)} />
            <Route path="/reset-password" element={R(ResetPw)} />

            {/* ── Dashboard redirect ── */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* ── Profile ── */}
            <Route path="/profile" element={<RequireAuth>{R(ProfileEdit)}</RequireAuth>} />

            {/* ── Driver pages (with DriverLayout = sidebar) ── */}
            <Route element={<RequireRole roles={['chauffeur']}><DriverOutlet /></RequireRole>}>
                <Route path="/chauffeur/trajets" element={R(DriverTrips)} />
            </Route>

            {/* ── Admin pages (with BackOfficeLayout = sidebar) ── */}
            <Route element={<RequireRole roles={ADMIN_ROLES}><AdminOutlet /></RequireRole>}>
                <Route path="/admin/dashboard" element={R(AdminDashboard)} />
                <Route path="/admin/guichet" element={R(AdminGuichet)} />
                <Route path="/admin/colis" element={R(AdminColis)} />
                <Route path="/admin/departs" element={R(AdminManifeste)} />
                <Route path="/admin/flotte" element={R(AdminFlotte)} />
                <Route path="/admin/carte-gps" element={R(AdminGpsMap)} />
                <Route path="/admin/maintenance" element={R(AdminMaintenance)} />
                <Route path="/admin/alertes-vitesse" element={R(AdminSpeedAlerts)} />
                <Route path="/admin/trajets" element={R(AdminTrajets)} />
                <Route path="/admin/planning" element={R(AdminPlanning)} />
                <Route path="/admin/embarquement" element={R(AdminEmbarquement)} />
                <Route path="/admin/alertes" element={R(AdminAlertes)} />
                <Route path="/admin/rapports" element={R(AdminRapports)} />
                <Route path="/admin/notifications" element={R(AdminNotifs)} />
                <Route path="/admin/reclamations" element={R(AdminReclamations)} />
                <Route path="/admin/objets-trouves" element={R(AdminLostItems)} />
                <Route path="/admin/utilisateurs" element={R(AdminUtilisateurs)} />
                <Route path="/admin/comptabilite" element={R(AdminCompta)} />
                <Route path="/admin/formations" element={R(AdminFormations)} />
                <Route path="/admin/formations/:id" element={R(AdminFormDetail)} />
                <Route path="/admin/bagages" element={R(AdminBagages)} />
                <Route path="/admin/bagages/manifeste" element={R(AdminBagManifest)} />
                <Route path="/admin/services/parking" element={R(AdminParkingSvc)} />
                <Route path="/admin/services/location" element={R(AdminLocationSvc)} />
                <Route path="/admin/services/hebergement" element={R(AdminHeberg)} />
                <Route path="/admin/services/moto-transport" element={R(AdminMotoSvc)} />
            </Route>

            {/* Admin routes with limited roles */}
            <Route element={<RequireRole roles={['directeur_general','comptable']}><AdminOutlet /></RequireRole>}>
                <Route path="/admin/paiements" element={R(AdminPaiements)} />
                <Route path="/admin/finance/depenses" element={R(AdminDepenses)} />
                <Route path="/admin/finance/factures" element={R(AdminFactures)} />
                <Route path="/admin/finance/grand-livre" element={R(AdminGrandLivre)} />
                <Route path="/admin/finance/bilan" element={R(AdminBilan)} />
                <Route path="/admin/finance/budgets" element={R(AdminBudgets)} />
            </Route>

            <Route element={<RequireRole roles={['directeur_general','responsable_flotte']}><AdminOutlet /></RequireRole>}>
                <Route path="/admin/rh/dashboard" element={R(RhDashboard)} />
                <Route path="/admin/rh/personnel" element={R(RhPersonnel)} />
                <Route path="/admin/rh/contrats" element={R(RhContrats)} />
                <Route path="/admin/rh/conges" element={R(RhConges)} />
                <Route path="/admin/rh/pointage" element={R(RhPointage)} />
                <Route path="/admin/rh/paie" element={R(RhPaie)} />
            </Route>

            <Route element={<RequireRole roles={['directeur_general']}><AdminOutlet /></RequireRole>}>
                <Route path="/admin/certificats" element={R(AdminCertificats)} />
                <Route path="/admin/securite" element={R(AdminSecurite)} />
                <Route path="/admin/securite/manifeste/:id" element={R(AdminSecManifeste)} />
                <Route path="/admin/villes" element={R(AdminVilles)} />
                <Route path="/admin/compagnies" element={R(AdminCompagnies)} />
                <Route path="/admin/gares" element={R(AdminStations)} />
                <Route path="/admin/fraude" element={R(AdminFraude)} />
            </Route>

            <Route element={<RequireRole roles={['directeur_general','agent_police']}><AdminOutlet /></RequireRole>}>
                <Route path="/admin/police" element={R(AdminPolice)} />
                <Route path="/admin/police/surveillance" element={R(AdminWatchlist)} />
                <Route path="/admin/police/verifications" element={R(AdminCheckLogs)} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
