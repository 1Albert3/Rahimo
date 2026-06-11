
import { useState } from 'react';
import { AlertTriangle, Eye, Plus, X } from 'lucide-react';
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';
import { storeSecurityAlert, storeIncident } from '@/api/admin';

const SEVERITY_COLORS: Record<string, string> = {
    critical: 'text-status-red-text bg-status-red-bg/30',
    high: 'text-status-yellow-text bg-status-yellow-bg/30',
    medium: 'text-status-blue-text bg-status-blue-bg/30',
    low: 'text-on-surface-variant bg-gris-surface',
};

export default function SecuriteIndex() {
    const { data, loading } = useApi<{ alertes: any[]; incidents: any[]; manifestes: any[]; stats: any }>('/admin/securite');

    const alertes = data?.alertes ?? [];
    const incidents = data?.incidents ?? [];
    const manifestes = data?.manifestes ?? [];
    const stats = data?.stats ?? {};
    const [tab, setTab] = useState<'alertes' | 'incidents' | 'manifestes'>('alertes');
    const [showAlerte, setShowAlerte] = useState(false);
    const [showIncident, setShowIncident] = useState(false);

    const alerteForm = useForm({ alert_type: 'security_threat', severity: 'medium', person_name: '', person_phone: '', description: '' });
    const incidentForm = useForm({ type: 'other', incident_date: new Date().toISOString().slice(0, 10), location: '', description: '', actions_taken: '', injuries: '', damages: '' });

    if (loading) return <div className="flex justify-center py-20 text-on-surface-variant text-sm">Chargement...</div>;
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Sécurité & Police</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Alertes, incidents et manifestes passagers</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowAlerte(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-status-yellow-bg text-status-yellow-text rounded-xl text-sm font-semibold hover:bg-status-yellow-bg/80"
                    ><AlertTriangle size={16} /> Alerte</button>
                    <button onClick={() => setShowIncident(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-on-primary rounded-xl text-sm font-semibold"
                    ><Plus size={16} /> Incident</button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Alertes ouvertes', val: stats?.alertes_ouvertes ?? 0, color: 'text-status-red-text', bg: 'bg-status-red-bg/30' },
                    { label: 'Incidents du mois', val: stats?.incidents_mois ?? 0, color: 'text-status-yellow-text', bg: 'bg-status-yellow-bg/30' },
                    { label: 'Incidents résolus', val: stats?.incidents_resolus ?? 0, color: 'text-status-green-text', bg: 'bg-status-green-bg/30' },
                    { label: 'Départs ajd', val: stats?.departs_aujourdhui ?? 0, color: 'text-status-blue-text', bg: 'bg-status-blue-bg/30' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl border border-outline p-4 text-center`}>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                        <p className="text-xs text-on-surface-variant">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 border-b border-outline">
                {(['alertes', 'incidents', 'manifestes'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 -mb-[1px] ${tab === t ? 'border-primary text-slate-dark' : 'border-transparent text-on-surface-variant hover:text-slate-dark'}`}
                    >{t === 'alertes' ? 'Alertes' : t === 'incidents' ? 'Incidents' : 'Manifestes'}</button>
                ))}
            </div>

            {tab === 'alertes' && (
                <div className="bg-white rounded-xl border border-outline overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                                <tr>
                                    {['Type', 'Personne', 'Description', 'Sévérité', 'Trajet', 'Statut', 'Date'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {alertes.map((a: any) => (
                                    <tr key={a.id} className="hover:bg-gris-surface transition-colors">
                                        <td className="px-4 py-3 capitalize text-slate-dark">{a.alert_type.replace('_', ' ')}</td>
                                        <td className="px-4 py-3 text-on-surface-variant">{a.person_name ?? '—'}</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs max-w-[200px] truncate">{a.description}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${SEVERITY_COLORS[a.severity] ?? ''}`}>{a.severity}</span>
                                        </td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{a.trip_info ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${a.status === 'open' ? 'bg-status-red-bg text-status-red-text' : a.status === 'resolved' ? 'bg-status-green-bg text-status-green-text' : 'bg-status-yellow-bg text-status-yellow-text'}`}>{a.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{a.created_at}</td>
                                    </tr>
                                ))}
                                {alertes.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-on-surface-variant text-sm">Aucune alerte.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'incidents' && (
                <div className="bg-white rounded-xl border border-outline overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gris-surface text-on-surface-variant text-xs uppercase tracking-wider">
                                <tr>
                                    {['Type', 'Date', 'Lieu', 'Véhicule', 'Chauffeur', 'Signalé par', 'Statut'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {incidents.map((i: any) => (
                                    <tr key={i.id} className="hover:bg-gris-surface transition-colors">
                                        <td className="px-4 py-3 capitalize text-slate-dark">{i.type}</td>
                                        <td className="px-4 py-3 font-mono text-on-surface-variant">{i.incident_date}</td>
                                        <td className="px-4 py-3 text-on-surface-variant text-xs">{i.location}</td>
                                        <td className="px-4 py-3 text-on-surface-variant font-mono">{i.vehicle ?? '—'}</td>
                                        <td className="px-4 py-3 text-on-surface-variant">{i.driver ?? '—'}</td>
                                        <td className="px-4 py-3 text-on-surface-variant">{i.reported_by ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${i.status === 'resolved' ? 'bg-status-green-bg text-status-green-text' : i.status === 'investigating' ? 'bg-status-yellow-bg text-status-yellow-text' : 'bg-status-red-bg text-status-red-text'}`}>{i.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {incidents.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-on-surface-variant text-sm">Aucun incident.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'manifestes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {manifestes.map((m: any) => (
                        <div key={m.id} className="bg-white rounded-xl border border-outline p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="font-semibold text-slate-dark text-sm">{m.route}</p>
                                    <p className="text-xs text-on-surface-variant font-mono">{m.departure}</p>
                                </div>
                                <span className="text-xs text-on-surface-variant">{m.passengers} passager(s)</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-on-surface-variant">
                                <span>{m.vehicle} · {m.driver}</span>
                                <button onClick={() => window.location.href = '/admin/securite/manifeste/' + m.id}
                                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                                ><Eye size={12} /> Voir manifeste</button>
                            </div>
                        </div>
                    ))}
                    {manifestes.length === 0 && <div className="col-span-full text-center py-8 text-on-surface-variant text-sm">Aucun départ programmé.</div>}
                </div>
            )}

            {/* Alerte Modal */}
            {showAlerte && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAlerte(false)}>
                    <div className="bg-white rounded-xl border border-outline p-6 w-full max-w-lg mx-2" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-dark">Nouvelle Alerte de Sécurité</h2>
                            <button onClick={() => setShowAlerte(false)} className="text-on-surface-variant hover:text-slate-dark"><X size={20} /></button>
                        </div>
                        <form onSubmit={e => { e.preventDefault(); (async () => { await storeSecurityAlert(alerteForm.data as Record<string, unknown>); setShowAlerte(false); alerteForm.reset(); })(); }} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Type</label>
                                    <select value={alerteForm.data.alert_type} onChange={e => alerteForm.setData('alert_type', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="security_threat">Menace</option>
                                        <option value="wanted_person">Personne recherchée</option>
                                        <option value="stolen_vehicle">Véhicule volé</option>
                                        <option value="accident">Accident</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Sévérité</label>
                                    <select value={alerteForm.data.severity} onChange={e => alerteForm.setData('severity', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary"
                                    ><option value="low">Faible</option><option value="medium">Moyenne</option><option value="high">Haute</option><option value="critical">Critique</option></select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Nom de la personne</label>
                                    <input type="text" value={alerteForm.data.person_name} onChange={e => alerteForm.setData('person_name', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Téléphone</label>
                                    <input type="text" value={alerteForm.data.person_phone} onChange={e => alerteForm.setData('person_phone', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Description</label>
                                <textarea value={alerteForm.data.description} onChange={e => alerteForm.setData('description', e.target.value)} rows={3} required
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <button type="submit" disabled={alerteForm.processing}
                                className="w-full py-2.5 bg-status-yellow-bg text-status-yellow-text rounded-xl font-semibold text-sm hover:bg-status-yellow-bg/80 disabled:opacity-50"
                            >Enregistrer l'alerte</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Incident Modal */}
            {showIncident && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowIncident(false)}>
                    <div className="bg-white rounded-xl border border-outline p-6 w-full max-w-lg mx-2 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-dark">Signaler un Incident</h2>
                            <button onClick={() => setShowIncident(false)} className="text-on-surface-variant hover:text-slate-dark"><X size={20} /></button>
                        </div>
                        <form onSubmit={e => { e.preventDefault(); (async () => { await storeIncident(incidentForm.data as Record<string, unknown>); setShowIncident(false); incidentForm.reset(); })(); }} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Type</label>
                                    <select value={incidentForm.data.type} onChange={e => incidentForm.setData('type', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="accident">Accident</option><option value="breakdown">Panne</option>
                                        <option value="assault">Agression</option><option value="theft">Vol</option>
                                        <option value="harassment">Harcèlement</option><option value="other">Autre</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Date</label>
                                    <input type="date" value={incidentForm.data.incident_date} onChange={e => incidentForm.setData('incident_date', e.target.value)}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Lieu</label>
                                <input type="text" value={incidentForm.data.location} onChange={e => incidentForm.setData('location', e.target.value)}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" required />
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Description</label>
                                <textarea value={incidentForm.data.description} onChange={e => incidentForm.setData('description', e.target.value)} rows={3} required
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <div>
                                <label className="text-xs text-on-surface-variant mb-1 block">Actions entreprises</label>
                                <textarea value={incidentForm.data.actions_taken} onChange={e => incidentForm.setData('actions_taken', e.target.value)} rows={2}
                                    className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Blessures</label>
                                    <textarea value={incidentForm.data.injuries} onChange={e => incidentForm.setData('injuries', e.target.value)} rows={2}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant mb-1 block">Dégâts matériels</label>
                                    <textarea value={incidentForm.data.damages} onChange={e => incidentForm.setData('damages', e.target.value)} rows={2}
                                        className="w-full bg-gris-surface border border-outline rounded-xl px-3 py-2 text-slate-dark text-sm focus:outline-none focus:border-primary" />
                                </div>
                            </div>
                            <button type="submit" disabled={incidentForm.processing}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-semibold text-sm disabled:opacity-50"
                            >Signaler l'incident</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
