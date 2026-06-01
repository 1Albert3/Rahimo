import { Link } from '@inertiajs/react';
import { Award, Download, FileText } from 'lucide-react';
import BackOfficeLayout from '@/Layouts/BackOfficeLayout';
import type { PageProps, PaginatedData } from '@/types';

interface CertItem {
    id: number; employe: string; formation: string; numero: string;
    score: number; emis_le: string; expire_le: string; pdf_url: string | null;
}

interface Props extends PageProps {
    certificates: PaginatedData<CertItem>;
}

export default function Certificats({ certificates }: Props) {
    return (
        <div className="w-full max-w-7xl space-y-6">
            <div>
                <h1 className="text-xl font-bold text-white">Certificats de Formation</h1>
                <p className="text-admin-muted text-sm mt-0.5">Certificats délivrés aux employés</p>
            </div>

            <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
                            <tr>
                                {['Employé', 'Formation', 'N° Certificat', 'Score', 'Émis le', 'Expire le', 'PDF'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.data.map(c => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-white">{c.employe}</td>
                                    <td className="px-4 py-3 text-admin-muted">{c.formation}</td>
                                    <td className="px-4 py-3 text-admin-muted font-mono text-xs">{c.numero}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-mono font-bold ${c.score >= 80 ? 'text-status-green-text' : 'text-status-yellow-text'}`}>
                                            {c.score}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-admin-muted text-xs font-mono">{c.emis_le}</td>
                                    <td className="px-4 py-3 text-admin-muted text-xs font-mono">{c.expire_le}</td>
                                    <td className="px-4 py-3">
                                        {c.pdf_url ? (
                                            <a href={c.pdf_url} target="_blank" rel="noopener noreferrer"
                                                className="text-status-blue-text hover:underline text-xs flex items-center gap-1"
                                            ><Download size={12} /> PDF</a>
                                        ) : (
                                            <span className="text-admin-muted text-xs">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {certificates.data.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-8 text-admin-muted text-sm">Aucun certificat délivré.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

Certificats.layout = (page: React.ReactNode) => (
    <BackOfficeLayout title="Certificats" breadcrumbs={[{ label: 'Formations', href: route('admin.formations.cours') }, { label: 'Certificats' }]}>
        {page}
    </BackOfficeLayout>
);