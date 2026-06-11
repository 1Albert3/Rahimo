
import { motion } from 'framer-motion';
import { Bell, CheckCircle, MessageSquare, Send, Smartphone, Users } from 'lucide-react';
import { useForm } from '@/hooks/useForm';
import { sendNotification } from '@/api/admin';
export default function Notifications() {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        canal: 'sms',
        message: '',
        cible: 'tous_clients',
    });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendNotification({ canal: data.canal, message: data.message, cible: data.cible });
    };

    return (
        <div className="w-full max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-dark">Notifications</h1>
                    <p className="text-on-surface-variant text-sm mt-0.5">Envoyer des notifications en masse aux clients</p>
                </div>
            </div>

            {recentlySuccessful && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-status-green-bg/30 border border-status-green-ring rounded-xl p-4 flex items-center gap-3"
                >
                    <CheckCircle size={20} className="text-status-green-text shrink-0" />
                    <p className="text-slate-dark text-sm font-semibold">Notification envoyée avec succès.</p>
                </motion.div>
            )}

            <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-outline shadow-sm p-6 space-y-5"
            >
                {/* Canal */}
                <div>
                    <label className="text-xs text-on-surface-variant mb-2 block font-semibold">Canal de diffusion</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { key: 'sms', label: 'SMS', icon: Smartphone },
                            { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                            { key: 'email', label: 'Email', icon: Bell },
                        ].map(c => (
                            <button key={c.key} type="button" onClick={() => setData('canal', c.key)}
                                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                                    data.canal === c.key
                                        ? 'border-primary bg-primary/20 text-white'
                                        : 'border-outline text-on-surface-variant hover:text-slate-dark hover:border-white/20'
                                }`}
                            >
                                <c.icon size={16} />
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cible */}
                <div>
                    <label className="text-xs text-on-surface-variant mb-2 block font-semibold">Cible</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { key: 'tous_clients', label: 'Tous les clients', icon: Users },
                            { key: 'clients_actifs', label: 'Clients actifs', icon: Users },
                            { key: 'clients_inactifs', label: 'Clients inactifs', icon: Users },
                        ].map(c => (
                            <button key={c.key} type="button" onClick={() => setData('cible', c.key)}
                                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                                    data.cible === c.key
                                        ? 'border-primary bg-primary/20 text-white'
                                        : 'border-outline text-on-surface-variant hover:text-slate-dark hover:border-white/20'
                                }`}
                            >
                                <c.icon size={16} />
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label className="text-xs text-on-surface-variant mb-2 block font-semibold">Message</label>
                    <textarea value={data.message} onChange={e => setData('message', e.target.value)} required
                        rows={5} maxLength={500}
                        className="w-full bg-gris-surface border border-outline rounded-xl px-4 py-3 text-slate-dark text-sm focus:outline-none focus:border-primary resize-none"
                        placeholder="Rédigez votre message ici..."
                    />
                    <p className="text-xs text-on-surface-variant mt-1 text-right">{data.message.length}/500</p>
                </div>

                <button type="submit" disabled={processing || !data.message}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {processing ? 'Envoi en cours...' : <><Send size={16} /> Envoyer la notification</>}
                </button>
            </motion.form>

            <div className="bg-white rounded-xl border border-outline shadow-sm p-4">
                <p className="text-xs text-on-surface-variant">
                    <Bell size={12} className="inline mr-1" />
                    Les notifications sont envoyées via le fournisseur SMS configuré. Actuellement en mode <span className="font-mono text-primary">log</span> (aucun envoi réel).
                </p>
            </div>
        </div>
    );
}
