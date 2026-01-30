import React, { useState, useEffect } from 'react';
import { Zap, ZapOff } from 'lucide-react';

export default function OneClickOrderToggle({ enabled, onToggle }) {
    const [showWarning, setShowWarning] = useState(false);

    const handleToggle = () => {
        if (!enabled && !localStorage.getItem('oneClickWarningShown')) {
            setShowWarning(true);
        } else {
            onToggle(!enabled);
        }
    };

    const confirmEnable = () => {
        localStorage.setItem('oneClickWarningShown', 'true');
        onToggle(true);
        setShowWarning(false);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={handleToggle}
                className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all
          ${enabled
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-[#1a1e2e] text-gray-400 border-white/5'
                    }
          border hover:border-white/10
        `}
            >
                {enabled ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                <span className="text-xs font-bold">One Click Order</span>
                {enabled && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
            </button>

            {/* Warning Modal */}
            {showWarning && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-[#1a1e2e] border border-yellow-500/30 rounded-xl p-6 max-w-md shadow-2xl">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Enable One-Click Orders?</h3>
                                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                                    One-click orders will <strong className="text-yellow-500">execute instantly without confirmation</strong>.
                                    Make sure you understand the risks before enabling this feature.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={confirmEnable}
                                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Enable
                                    </button>
                                    <button
                                        onClick={() => setShowWarning(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
