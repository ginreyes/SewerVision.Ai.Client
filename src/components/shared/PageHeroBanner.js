'use client';

import React from 'react';

/**
 * Background image map – matches files in /public/background_pictures/
 *
 * Usage:
 *   <PageHeroBanner
 *     role="operator"
 *     title="Device Assignments"
 *     subtitle="Assign operators and QC technicians to your fleet"
 *     icon={<Cpu className="w-6 h-6" />}
 *   />
 */

const BG_MAP = {
  customer:       '/background_pictures/customer_background.jpg',
  operator:       '/background_pictures/operator_background.jpg',
  'qc-technician': '/background_pictures/qc-technician_background.jpg',
  user:           '/background_pictures/user-team_background.jpg',
  team:           '/background_pictures/user-team_background.jpg',
  improvement:    '/background_pictures/improvement_pictures.jpg',
  empty:          '/background_pictures/no_updates_illustration.jpg',
};

/**
 * Accent color per role – used for the icon badge and subtle tint on the overlay.
 */
const ACCENT_MAP = {
  customer:        { from: 'from-cyan-600',    to: 'to-sky-700',     ring: 'ring-cyan-400/30',    glow: 'shadow-cyan-500/20' },
  operator:        { from: 'from-amber-600',   to: 'to-orange-700',  ring: 'ring-amber-400/30',   glow: 'shadow-amber-500/20' },
  'qc-technician': { from: 'from-violet-600',  to: 'to-purple-700',  ring: 'ring-violet-400/30',  glow: 'shadow-violet-500/20' },
  user:            { from: 'from-indigo-600',  to: 'to-blue-700',    ring: 'ring-indigo-400/30',  glow: 'shadow-indigo-500/20' },
  team:            { from: 'from-emerald-600', to: 'to-teal-700',    ring: 'ring-emerald-400/30', glow: 'shadow-emerald-500/20' },
  improvement:     { from: 'from-rose-600',    to: 'to-pink-700',    ring: 'ring-rose-400/30',    glow: 'shadow-rose-500/20' },
};

export default function PageHeroBanner({
  role = 'user',
  title,
  subtitle,
  icon,
  children,        // optional extra content (stats, badges, etc.)
  className = '',
  overlayOpacity = 'opacity-60',
}) {
  const bg = BG_MAP[role] || BG_MAP.user;
  const accent = ACCENT_MAP[role] || ACCENT_MAP.user;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        ${className}
      `}
    >
      {/* ── Background image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* ── Dark gradient overlay ── */}
      <div className={`absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/70 to-slate-900/50 ${overlayOpacity}`} />

      {/* ── Subtle noise / grain texture overlay ── */}
      <div
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Decorative blurred circles ── */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

      {/* ── Content ── */}
      <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10 flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Icon badge */}
        {icon && (
          <div
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
              bg-gradient-to-br ${accent.from} ${accent.to}
              text-white shadow-lg ${accent.glow}
              ring-1 ${accent.ring}
            `}
          >
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Optional extra content rendered below subtitle */}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
}