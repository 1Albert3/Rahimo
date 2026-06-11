import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-dark w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 px-4 sm:px-8 py-10 sm:py-16 w-full max-w-7xl mx-auto text-white">
                <div>
                    <span className="text-2xl font-black mb-6 block">Rahimo Transport</span>
                    <p className="text-white/70 leading-relaxed text-sm">Leader du transport routier de personnes et de marchandises au Burkina Faso. Connectons nos régions en toute sécurité.</p>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-6">Liens Utiles</h4>
                    <ul className="space-y-4 text-white/70 text-sm">
                        {['À propos', 'Agences', 'Contact', 'FAQ'].map((l) => (
                            <li key={l}><a href="#" className="hover:text-white transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />{l}</a></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-6">Services</h4>
                    <ul className="space-y-4 text-white/70 text-sm">
                        {['Acheter un ticket', 'Suivi de colis', 'Location de bus', 'Transport de motos'].map((l) => (
                            <li key={l}><a href="#" className="hover:text-white transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />{l}</a></li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-6">Contact</h4>
                    <ul className="space-y-5 text-white/70 text-sm">
                        <li className="flex items-start gap-4"><MapPin size={18} className="text-white/60 shrink-0 mt-0.5" /><span>Gare de Ouagadougou, Secteur 10</span></li>
                        <li className="flex items-center gap-4"><Phone size={18} className="text-white/60 shrink-0" /><span className="font-mono">+226 25 00 00 00</span></li>
                        <li className="flex items-center gap-4"><Mail size={18} className="text-white/60 shrink-0" /><span>contact@rahimo.bf</span></li>
                    </ul>
                    <Link to="/login" className="mt-8 inline-block text-xs text-white/30 hover:text-white/60 transition-colors">Accès personnel →</Link>
                </div>
            </div>
            <div className="border-t border-white/5 text-center py-6 sm:py-8 px-4 text-white/40 text-xs sm:text-sm font-mono">© {new Date().getFullYear()} Rahimo Transport. Tous droits réservés.</div>
        </footer>
    );
}
