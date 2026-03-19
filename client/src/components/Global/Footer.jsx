import React from 'react';
import { Mail, Shield, Twitter, Instagram, ArrowUpRight, Globe, Lock } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const sections = [
        {
            title: 'Protocol',
            links: [
                { label: 'Evaluation', href: '/' },
                { label: 'Rulebook', href: '/rules' },
                { label: 'Trading Terms', href: '/rules' },
                { label: 'FAQ', href: '/faq' },
            ]
        },
        {
            title: 'Company',
            links: [
                { label: 'About Optivon', href: '/about' },
                { label: 'Capital Tiers', href: '/capital-tiers' },
                { label: 'Affiliates', href: '/dashboard/affiliates' },
                { label: 'Contact', href: 'mailto:Optivonincorp@gmail.com' },
            ]
        },
        {
            title: 'Legal',
            links: [
                { label: 'Privacy Policy', href: '/legal/privacy' },
                { label: 'Terms of Service', href: '/legal/terms' },
                { label: 'Cookie Policy', href: '/legal/cookies' },
                { label: 'Risk Disclosure', href: '/legal/risk' },
            ]
        }
    ];

    return (
        <footer className="bg-background border-t border-white/[0.05] pt-24 pb-12 px-6 md:px-12 font-sans">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-24">
                    
                    {/* Brand Section */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <div className="text-2xl font-bold tracking-[-0.04em] text-primary mb-2">OPTIVON</div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Institutional Funding</div>
                        </div>
                        <p className="text-sm text-secondary leading-relaxed max-w-xs">
                            Architecting the next generation of institutional trading talent through precision risk management and capital access.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Twitter size={18} />} />
                            <SocialIcon icon={<Instagram size={18} />} />
                            <SocialIcon icon={<Globe size={18} />} />
                        </div>
                    </div>

                    {/* Links Sections */}
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-8">{section.title}</h4>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a 
                                            href={link.href} 
                                            className="text-sm text-secondary hover:text-accent transition-colors flex items-center group gap-1"
                                        >
                                            {link.label}
                                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Support & Emails */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 border-y border-white/[0.05] mb-12">
                    <div className="flex items-center gap-6 group">
                        <div className="w-12 h-12 rounded-instrument bg-primary/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                            <Mail size={20} className="text-secondary group-hover:text-accent transition-colors" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-1">Corporate Inquiries</div>
                            <a href="mailto:Optivonincorp@gmail.com" className="text-primary font-medium hover:text-accent transition-colors text-sm">
                                Optivonincorp@gmail.com
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 group">
                        <div className="w-12 h-12 rounded-instrument bg-primary/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                            <Shield size={20} className="text-secondary group-hover:text-accent transition-colors" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-1">System Alerts</div>
                            <a href="mailto:Optivon.alerts@gmail.com" className="text-primary font-medium hover:text-accent transition-colors text-sm">
                                Optivon.alerts@gmail.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                        © {currentYear} OPTIVON INCORP. ALL RIGHTS RESERVED.
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                            <Lock size={12} />
                            SSL Secured
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                            v2.4.0 INSTITUTIONAL
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ icon }) {
    return (
        <a href="#" className="w-10 h-10 rounded-instrument border border-white/[0.05] flex items-center justify-center text-secondary hover:text-accent hover:border-accent/50 hover:bg-accent/5 transition-all">
            {icon}
        </a>
    );
}
