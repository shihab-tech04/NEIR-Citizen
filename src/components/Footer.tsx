import React from 'react';
import type { Language } from '../types.ts';

export const Footer: React.FC<{language: Language}> = () => (
  <footer className="bg-white w-full border-t border-slate-100 py-6 px-4 text-center">
    <p className="text-xs sm:text-sm text-slate-700">Copyright © 2026 Bangladesh Telecommunication Regulatory Commission (BTRC)</p>
  </footer>
);
