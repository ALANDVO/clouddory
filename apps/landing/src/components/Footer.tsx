'use client';

import Link from 'next/link';
import Logo from './Logo';

const footerLinks = {
  Products: [
    { label: 'Features', href: '/features' },
    { label: 'FinOps', href: '/products/finops' },
    { label: 'Security', href: '/products/security' },
    { label: 'Intelligence', href: '/products/intelligence' },
    { label: 'Automation', href: '/products/automation' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
  ],
  Resources: [
    { label: 'Docs', href: '/resources/docs' },
    { label: 'API', href: '/resources/api' },
    { label: 'Status', href: '/resources/status' },
    { label: 'Changelog', href: '/resources/changelog' },
  ],
  Legal: [
    { label: 'Privacy', href: '/legal/privacy' },
    { label: 'Terms', href: '/legal/terms' },
    { label: 'Security', href: '/legal/security' },
    { label: 'DPA', href: '/legal/dpa' },
  ],
};

const partnerBadges: { label: string; href: string }[] = [];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-5">
              <Logo className="w-7 h-7" />
              <span className="font-display font-bold text-lg text-white">
                Cloud<span className="text-cyan-500">Dory</span>
              </span>
            </a>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Find what your cloud is hiding. AI-powered cloud operations for modern teams.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-sm text-white mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-cyan-400 transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Partner & Compliance Badges — clickable */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-8 border-t border-white/5 mb-8">
          {partnerBadges.map((badge) => (
            <Link
              key={badge.label}
              href={badge.href}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] text-xs text-slate-400 hover:border-cyan-500/20 hover:bg-cyan-500/5 hover:text-cyan-400 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              {badge.label}
            </Link>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} CloudDory, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
