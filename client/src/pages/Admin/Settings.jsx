import React from 'react';

export default function Settings() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black font-display text-primary">System Settings</h1>

            <div className="bg-surface border border-border rounded-xl p-8 text-center">
                <p className="text-secondary">Global trading configuration settings will appear here.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                    <div className="p-4 border border-border rounded-lg">
                        <label className="block text-xs font-bold text-secondary uppercase mb-2">Max Allocation per User</label>
                        <input type="text" value="$600,000" disabled className="w-full bg-background p-2 rounded text-sm text-secondary" />
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                        <label className="block text-xs font-bold text-secondary uppercase mb-2">Risk Free Trade Mode</label>
                        <input type="text" value="Disabled" disabled className="w-full bg-background p-2 rounded text-sm text-secondary" />
                    </div>
                </div>
            </div>
        </div>
    );
}

