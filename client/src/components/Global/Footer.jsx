import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const sections = [
        { title: 'Protocol', links: [
            { label: 'Evaluation', href: '/' }, { label: 'Rulebook', href: '/rules' },
            { label: 'Trading Terms', href: '/rules' }, { label: 'FAQ', href: '/faq' },
        ]},
        { title: 'Company', links: [
            { label: 'About Optivon', href: '/about' }, { label: 'Capital Tiers', href: '/capital-tiers' },
            { label: 'Affiliates', href: '/dashboard/affiliates' }, { label: 'Contact', href: 'mailto:Optivonincorp@gmail.com' },
        ]},
        { title: 'Legal', links: [
            { label: 'Privacy Policy', href: '/legal/privacy' }, { label: 'Terms of Service', href: '/legal/terms' },
            { label: 'Cookie Policy', href: '/legal/cookies' }, { label: 'Risk Disclosure', href: '/legal/risk' },
        ]}
    ];

    return (
        <footer className="bg-background border-t border-black/15 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[50vh]">
                
                {/* Brand / Info Segment */}
                <div className="p-12 md:p-16 border-b md:border-b-0 md:border-r border-black/15 md:col-span-5 flex flex-col justify-between">
                    <div>
                        <div className="font-display text-4xl tracking-tighter text-primary mb-2">Optivon.</div>
                        <div className="text-caption text-secondary">Institutional Capital</div>
                    </div>
                    <div className="mt-24">
                        <p className="text-secondary leading-relaxed max-w-sm font-sans mb-8">
                            Architecting the next generation of institutional trading talent through precision risk management and capital access.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-caption text-secondary hover:text-primary transition-colors">Twitter</a>
                            <a href="#" className="text-caption text-secondary hover:text-primary transition-colors">Instagram</a>
                            <a href="#" className="text-caption text-secondary hover:text-primary transition-colors">Global</a>
                        </div>
                    </div>
                </div>

                {/* Links / Navigation Segment */}
                <div className="p-12 md:p-16 md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-12">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-caption text-secondary mb-12">{section.title}</h4>
                            <ul className="space-y-6">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} className="text-base text-primary hover:text-secondary transition-colors flex items-center group gap-2">
                                            {link.label}
                                            <ArrowUpRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

            </div>

            {/* Bottom Bar Segment */}
            <div className="border-t border-black/15 p-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-caption text-secondary">© {currentYear} OPTIVON INCORP. ALL RIGHTS RESERVED.</div>
                <div className="flex items-center gap-8">
                    <div className="text-caption text-secondary">SSL Secured Node</div>
                    <div className="text-caption text-primary">v2.4.0 Institutional</div>
                </div>
            </div>
        </footer>
    );
}
