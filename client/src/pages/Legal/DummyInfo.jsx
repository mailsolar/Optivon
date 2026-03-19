import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Shield, Clock, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DummyInfo({ title, subtitle, content }) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-primary font-sans p-6 md:p-12 selection:bg-accent/30">
            <div className="max-w-[1200px] mx-auto">
                
                {/* Header / Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-20 border-b border-white/10 pb-8 gap-8">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-4 text-[12px] font-bold text-secondary hover:text-white uppercase tracking-[0.3em] transition-all group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                        RETURN TO HUB
                    </button>
                    
                    <div className="text-right">
                        <div className="text-[12px] font-display font-black text-accent uppercase tracking-[0.4em] mb-2">OPTIVON MASTER DIRECTIVE</div>
                        <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{new Date().toLocaleDateString()} SYNC</div>
                    </div>
                </div>

                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-24 max-w-4xl"
                >
                    <h1 className="text-7xl md:text-[8vw] font-display font-black tracking-tighter mb-8 leading-[0.85] uppercase text-white">
                        {title}
                    </h1>
                    <p className="text-xl md:text-2xl text-secondary font-medium leading-relaxed mt-8 border-l-4 border-accent pl-6 bg-accent/5 py-4">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-40">
                    
                    <div className="lg:col-span-8 space-y-12">
                        {content.map((block, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-12 bg-surface border border-white/10"
                            >
                                <div className="text-[12px] font-display font-black text-accent uppercase tracking-[0.3em] mb-4">APPENDIX 0{i+1}</div>
                                <h2 className="text-3xl font-display font-black text-white mb-6 uppercase tracking-tighter">{block.header}</h2>
                                <p className="text-secondary leading-relaxed font-medium text-lg">
                                    {block.text}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="lg:col-span-4 flex flex-col gap-8">
                        <div className="p-10 bg-accent text-background">
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                                <Zap size={14} /> Quick Action
                            </h3>
                            <button className="w-full py-5 bg-black text-white font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-4">
                                Initialize Protocol <ArrowUpRight size={14} />
                            </button>
                        </div>

                        <div className="p-10 bg-surface border border-white/10">
                            <h3 className="text-[11px] font-bold text-secondary uppercase tracking-[0.4em] mb-8">Related Directives</h3>
                            <div className="space-y-4">
                                {['Strategic Mandate', 'Capital Allocations', 'Security Tier 01'].map(ref => (
                                    <div key={ref} className="group flex items-center justify-between py-4 border-b border-white/5 cursor-pointer">
                                        <span className="text-sm font-bold text-white group-hover:text-accent transition-colors uppercase tracking-widest">{ref}</span>
                                        <ArrowUpRight size={14} className="text-secondary group-hover:text-accent transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Insight */}
                <div className="pt-12 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
                            <Shield size={12} /> Encrypted
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
                            <Globe size={12} /> Decentralized
                        </div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted">
                        v2.4.0 INSTITUTIONAL ARCHITECTURE
                    </div>
                </div>
            </div>
        </div>
    );
}
