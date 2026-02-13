import React, { useState } from 'react';
import { CreditCard, HelpCircle, Mail } from 'lucide-react';
import TabSwitcher from '../../components/Dashboard/TabSwitcher';

export default function Withdrawals() {
    const [activeFilter, setActiveFilter] = useState('All');

    return (
        <div className="flex gap-6 h-full">
            <div className="flex-1 min-w-0 flex flex-col gap-6">

                {/* STATS CARD */}
                <div className="bg-[#1F1F35] rounded-xl p-8 shadow-sm border border-white/5">
                    <p className="text-gray-400 font-medium mb-2">Total Earnings</p>
                    <h1 className="text-4xl font-bold text-white">$0</h1>
                </div>

                {/* FILTERS */}
                {/* FILTERS */}
                <TabSwitcher
                    tabs={['All', 'Submitted', 'Approved', 'Rejected']}
                    activeTab={activeFilter}
                    onTabChange={setActiveFilter}
                />

                {/* EMPTY STATE */}
                <div className="flex-1 bg-[#1F1F35] rounded-2xl shadow-sm border border-white/5 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-brand-lime mb-6">
                        <CreditCard size={40} />
                    </div>
                    <p className="text-lg font-medium text-white">No Payouts Found</p>
                </div>
            </div>

            {/* SIDEBAR WIDGET */}
            <div className="w-80 flex-shrink-0">
                <div className="bg-[#1F1F35] rounded-xl p-6 shadow-sm border border-white/5 h-64 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Optivon Support</h3>
                        <p className="text-sm text-gray-400 mb-6">Our Customer Service is fully at your disposal</p>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors flex items-center justify-center gap-2">
                            Help Center & Support
                        </button>
                        <button className="w-full py-2.5 px-4 bg-brand-lime hover:bg-brand-lime/90 text-brand-dark text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                            <Mail size={16} />
                            support@optivon.com
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

