import React from 'react';
import { Mail, Phone, ExternalLink } from 'lucide-react';

export default function HelpCenter() {
    const contacts = [
        { name: 'Sarah Jenkins', role: 'Support Lead', phone: '+1 (555) 123-4567', email: 'sarah.j@optivon.com' },
        { name: 'Michael Chen', role: 'Technical Account Manager', phone: '+1 (555) 987-6543', email: 'michael.c@optivon.com' },
        { name: 'Emma Watson', role: 'Billing Specialist', phone: '+1 (555) 456-7890', email: 'emma.w@optivon.com' }
    ];

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-2">Help Center</h1>
                <p className="text-gray-400">Get assistance and learn more about the platform.</p>
            </div>

            {/* About Optivon Section */}
            <div className="bg-[#1F1F35] rounded-2xl p-8 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lime/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />

                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-1 h-6 bg-brand-lime rounded-full"></span>
                    What is Optivon?
                </h2>

                <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
                    <p>
                        Optivon is a premier <strong className="text-white">High-Frequency Simulation Environment</strong> designed to identify and fund the world's most talented traders. We provide a simulated trading infrastructure that mirrors real-market conditions with zero latency, allowing you to prove your skills without risking your own capital.
                    </p>
                    <p>
                        Our platform offers institutional-grade tools, including our proprietary <span className="font-mono text-brand-lime">WebTrader Terminal</span>, deep market depth analysis, and real-time execution metrics. Traders who successfully pass our evaluation challenges are granted access to funded accounts, scaling up to <strong className="text-white">₹50,00,000</strong> in buying power.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                            <h4 className="text-brand-lime font-bold text-lg">Zero Risk</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Capital Coverage</p>
                        </div>
                        <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                            <h4 className="text-brand-lime font-bold text-lg">80/20</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Profit Split</p>
                        </div>
                        <div className="px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                            <h4 className="text-brand-lime font-bold text-lg">Instant</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Payouts</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map((contact, i) => (
                    <div key={i} className="bg-[#1F1F35] p-6 rounded-xl border border-white/5 hover:border-brand-lime/30 transition-all group">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-lime text-brand-lime group-hover:text-brand-dark transition-colors">
                            <span className="font-display font-bold text-lg">{contact.name.charAt(0)}</span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-1">{contact.name}</h3>
                        <p className="text-xs font-mono text-brand-lime uppercase tracking-widest mb-6">{contact.role}</p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-200">
                                <Phone size={14} />
                                <span>{contact.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-200">
                                <Mail size={14} />
                                <span>{contact.email}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
