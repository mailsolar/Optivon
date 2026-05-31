import React, { useState, useEffect } from 'react';
import { ArrowLeft, Target, BrainCircuit, AlertTriangle, Lightbulb, BookOpen, Clock, Activity, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

export default function AIReport() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();
    
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/ai/report/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                if (res.status === 404) {
                    setError("No AI report found for this node.");
                } else {
                    setError("Failed to fetch AI report.");
                }
                return;
            }
            
            const data = await res.json();
            if (data.status === 'none' || data.status === 'pending') {
                setError("AI report is currently generating. Please check back in a few minutes.");
            } else if (data.status === 'failed') {
                setError("AI analysis failed: " + data.failure_reason);
            } else {
                setReport(data);
            }
        } catch (err) {
            setError("Connection error while fetching AI report.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                <div className="relative">
                    <BrainCircuit size={48} className="text-accent animate-pulse" />
                    <div className="absolute inset-0 bg-accent blur-xl opacity-20 animate-pulse"></div>
                </div>
                <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] animate-pulse">
                    Synthesizing Neural Matrix
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 flex flex-col gap-6 items-center justify-center h-[60vh]">
                <AlertTriangle size={32} className="text-red-400" />
                <div className="text-center text-muted font-bold text-sm">{error}</div>
                <button onClick={() => navigate(-1)} className="px-6 py-3 bg-surface border border-black/15 text-primary rounded-instrument font-bold text-[10px] uppercase tracking-[0.2em] hover:border-accent/30 transition-all mt-4">
                    Return to Node
                </button>
            </div>
        );
    }

    const { core_metrics, behavioral_flags, psychology_profile, coaching_output, created_at } = report;
    const coaching = coaching_output || {};

    const radarData = [
        { subject: 'Greed', A: (psychology_profile?.greed_score || 0) * 100, fullMark: 100 },
        { subject: 'Fear', A: (psychology_profile?.fear_score || 0) * 100, fullMark: 100 },
        { subject: 'Tilt', A: (psychology_profile?.tilt_score || 0) * 100, fullMark: 100 },
        { subject: 'Discipline', A: (psychology_profile?.discipline_score || 0) * 100, fullMark: 100 },
        { subject: 'Confidence', A: (psychology_profile?.overconfidence_score || 0) * 100, fullMark: 100 },
    ];

    return (
        <div className="flex flex-col gap-10 font-sans pb-20">
            {/* Header */}
            <div className="flex items-center gap-6">
                <button onClick={() => navigate(-1)} className="p-4 bg-surface border border-black/15 rounded-full hover:border-accent/50 transition-all group">
                    <ArrowLeft size={20} className="text-secondary group-hover:text-accent transition-colors" />
                </button>
                <div>
                    <div className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-1 flex items-center gap-2">
                        <BrainCircuit size={12} /> Neural Analysis Complete
                    </div>
                    <h1 className="text-3xl font-bold text-primary uppercase tracking-tight flex items-center gap-4">
                        Post-Mortem: Node #{id.toString().padStart(6, '0')}
                    </h1>
                </div>
            </div>

            {/* AI Summary Card */}
            <div className="bg-surface p-10 rounded-premium border border-accent/20 shadow-[0_0_40px_rgba(197,160,89,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
                <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.4em] mb-6">AI Executive Summary</h3>
                <p className="text-xl md:text-2xl font-medium text-primary leading-relaxed relative z-10">
                    "{coaching.summary || 'No summary generated.'}"
                </p>
                <div className="mt-8 flex items-center gap-6 border-t border-black/15 pt-6 relative z-10">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Dominant Profile</span>
                        <span className="text-sm font-bold text-accent uppercase tracking-tight">
                            {psychology_profile?.risk_profile?.replace('_', ' ') || 'Unknown'}
                        </span>
                    </div>
                    <div className="w-px h-8 bg-black/15" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Analysis Date</span>
                        <span className="text-sm font-bold text-primary uppercase tracking-tight">
                            {new Date(created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Psychology Radar */}
                <div className="bg-surface p-10 rounded-premium border border-black/15 shadow-2xl flex flex-col">
                    <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                        <Activity size={14} className="text-accent" /> Psychological Matrix
                    </h3>
                    <div className="h-[300px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#646466', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Trader" dataKey="A" stroke="#C5A059" fill="#C5A059" fillOpacity={0.2} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 text-sm text-secondary leading-relaxed bg-black/20 p-6 rounded-instrument border border-black/15">
                        {coaching.psychology_analysis || 'No psychology breakdown available.'}
                    </div>
                </div>

                {/* Behavioral Flags */}
                <div className="bg-surface p-10 rounded-premium border border-black/15 shadow-2xl flex flex-col">
                    <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-red-400" /> Detected Behaviors
                    </h3>
                    <div className="space-y-6 flex-1">
                        {behavioral_flags && behavioral_flags.length > 0 ? (
                            behavioral_flags.map((flag, idx) => (
                                <div key={idx} className="bg-background/40 p-5 rounded-instrument border border-black/15">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-bold text-primary uppercase tracking-tight">
                                            {flag.behavior.replace(/_/g, ' ')}
                                        </span>
                                        <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest border
                                            ${flag.severity > 0.7 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                              flag.severity > 0.4 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                              'bg-accent/10 text-accent border-accent/20'}`}>
                                            {(flag.severity * 100).toFixed(0)}% Severity
                                        </span>
                                    </div>
                                    <p className="text-xs text-secondary leading-relaxed mb-4">
                                        {flag.description || 'Behavioral anomaly detected.'}
                                    </p>
                                    {flag.evidence && flag.evidence.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            {flag.evidence.slice(0,2).map((ev, i) => (
                                                <div key={i} className="text-[10px] font-mono text-muted bg-black/20 px-3 py-2 rounded border border-black/10 flex items-center gap-2">
                                                    <Zap size={10} className="text-accent/50" /> {ev}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted text-sm py-10">No critical behavioral anomalies detected.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Improvement Plan */}
            <div className="bg-surface p-10 rounded-premium border border-black/15 shadow-2xl">
                <h3 className="text-[10px] font-bold text-muted uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                    <Target size={14} className="text-emerald-400" /> Protocol Adjustments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coaching.improvement_plan && coaching.improvement_plan.length > 0 ? (
                        coaching.improvement_plan.map((item, idx) => (
                            <div key={idx} className="bg-background/30 p-6 rounded-instrument border border-black/15 hover:border-emerald-500/30 transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs mb-4 group-hover:scale-110 transition-transform">
                                    {idx + 1}
                                </div>
                                <p className="text-sm text-primary leading-relaxed font-medium">
                                    {item}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-muted text-sm col-span-full">No plan generated.</div>
                    )}
                </div>
            </div>

            {/* Recovery Course */}
            {coaching.recovery_course && coaching.recovery_course.modules && (
                <div className="bg-surface p-10 rounded-premium border border-accent/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-accent/50" />
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h3 className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                                <BookOpen size={14} /> Assigned Coursework
                            </h3>
                            <h2 className="text-2xl font-bold text-primary uppercase tracking-tight">
                                {coaching.recovery_course.title}
                            </h2>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {coaching.recovery_course.modules.map((module, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-6 p-6 bg-black/20 rounded-instrument border border-black/15 hover:bg-black/30 transition-colors">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface border border-accent/20 flex items-center justify-center text-accent font-bold">
                                    M{idx + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-primary uppercase tracking-tight mb-2">{module.topic}</h4>
                                    <p className="text-sm text-secondary leading-relaxed">{module.reasoning}</p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest bg-surface px-4 py-2 rounded-full border border-black/15 self-start md:self-center">
                                    <Clock size={12} /> Pending
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
