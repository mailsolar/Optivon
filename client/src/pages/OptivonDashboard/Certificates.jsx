import React, { useState } from 'react';
import { Award, CheckCircle } from 'lucide-react';
import TabSwitcher from '../../components/Dashboard/TabSwitcher';

export default function Certificates() {
    const [activeTab, setActiveTab] = useState('All');

    return (
        <div className="flex flex-col gap-8 h-full">

            {/* HEADER ACTIONS */}
            <div className="flex justify-between items-center">
                {/* TABS */}
                {/* TABS */}
                <TabSwitcher
                    tabs={['All', 'Funded', 'Payout']}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <button className="flex items-center gap-2 bg-brand-lime text-brand-dark px-6 py-2.5 rounded-lg font-bold text-sm shadow-[0_0_20px_rgba(245,255,171,0.2)] hover:scale-105 transition-transform">
                    <Award size={18} />
                    GET YOUR CERTIFICATE MADE!
                </button>
            </div>

            {/* EMPTY STATE */}
            <div className="flex-1 bg-[#1F1F35] rounded-2xl shadow-sm border border-white/5 flex flex-col items-center justify-center p-12 text-center">

                <div className="w-24 h-24 bg-brand-lime/10 text-brand-lime border border-brand-lime/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,255,171,0.1)]">
                    <CheckCircle size={48} strokeWidth={2} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">No Certificates Found</h2>
                <p className="max-w-md text-gray-400 leading-relaxed">
                    Embrace our challenges and when you succeed, your personalized certificates will be waiting to celebrate your accomplishments.
                </p>
            </div>
        </div>
    );
}

