import React from 'react';
import { Mail, Phone, ExternalLink, ShieldCheck } from 'lucide-react';

export default function HelpCenter() {
    const contacts = [
        { name: 'Sarah Jenkins', role: 'Protocol Lead', phone: '+1 (555) 123-4567', email: 'sarah.j@optivon.com' },
        { name: 'Michael Chen', role: 'System Architect', phone: '+1 (555) 987-6543', email: 'michael.c@optivon.com' },
        { name: 'Emma Watson', role: 'Financial Node Manager', phone: '+1 (555) 456-7890', email: 'emma.w@optivon.com' }
    ];

    return (
        <div className="flex flex-col gap-12 max-w-5xl mx-auto font-sans">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Resource Node</div>
                <h1 className="text-3xl font-bold text-primary uppercase tracking-tight">Institutional Intelligence</h1>
                <p className="text-secondary font-medium text-sm">Access technical documentation and primary contact points.</p>
            </div>

            {/* About Section */}
            <div className="bg-surface rounded-premium p-12 border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -mr-16 -mt-16 pointer-events-none" />

                <div className="flex flex-col gap-8 relative z-10">
                    <h2 className="text-xl font-bold text-primary uppercase tracking-tight flex items-center gap-4">
                        <span className="w-1.5 h-6 bg-accent rounded-full"></span>
                        Optivon Infrastructure
                    </h2>

                    <div className="prose prose-invert max-w-none text-secondary font-medium text-base space-y-6">
                        <p>
                            Optivon is a specialized <strong className="text-primary font-bold">Institutional Simulation Environment</strong> designed to identifying and funding elite capital allocators. We provide a proprietary matrix that mirrors actual market dynamics with zero-latency synchronization.
                        </p>
                        <p>
                            Our platform integrates premium toolsets, including the <span className="text-accent font-bold uppercase tracking-widest text-xs">Institutional Terminal</span>, precision risk analytics, and institutional settlement layers. Authorized nodes can scale up to <strong className="text-primary font-bold uppercase tracking-tighter">₹50L Allocation</strong>.
                        </p>
                        <div className="flex flex-wrap gap-6 pt-6">
                            <CapabilityCard label="Zero Exposure" sub="Protocol Risk Coverage" />
                            <CapabilityCard label="80/20 Yield" sub="Performance Inversion" />
                            <CapabilityCard label="T+0 Settlement" sub="Rapid Disbursement" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                {contacts.map((contact, i) => (
                    <div key={i} className="bg-surface p-8 rounded-premium border border-white/5 hover:border-accent/30 transition-all group shadow-xl">
                        <div className="w-14 h-14 bg-background border border-white/5 rounded-full flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-background transition-all shadow-soft">
                            <span className="font-bold text-xl">{contact.name.charAt(0)}</span>
                        </div>

                        <h3 className="text-lg font-bold text-primary mb-1 uppercase tracking-tight">{contact.name}</h3>
                        <p className="text-[9px] font-bold text-accent uppercase tracking-[0.3em] mb-8">{contact.role}</p>

                        <div className="space-y-4">
                            <ContactItem icon={Phone} text={contact.phone} />
                            <ContactItem icon={Mail} text={contact.email} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CapabilityCard({ label, sub }) {
    return (
        <div className="px-6 py-4 bg-background/50 rounded-instrument border border-white/5 backdrop-blur-sm min-w-[160px] shadow-inner">
            <h4 className="text-accent font-bold text-lg tracking-tighter">{label}</h4>
            <p className="text-[9px] text-muted font-bold uppercase tracking-[0.2em] mt-1">{sub}</p>
        </div>
    );
}

function ContactItem({ icon: Icon, text }) {
    return (
        <div className="flex items-center gap-4 text-xs font-bold text-muted group-hover:text-secondary transition-colors">
            <Icon size={14} className="text-accent/60" />
            <span className="tracking-widest">{text}</span>
        </div>
    );
}
