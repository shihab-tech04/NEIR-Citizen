import React from 'react';
import type { Language } from '../types.ts';

type Props = { language: Language; onContactUs: () => void };
export const Footer: React.FC<Props> = ({language,onContactUs}) => {
  const bn=language==='bn';
  return <footer className="neir-original-footer">
    <div className="neir-original-footer-inner">
      <p>{bn
        ? 'কপিরাইট © ২০২৬ বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (বিটিআরসি)'
        : 'Copyright © 2026 Bangladesh Telecommunication Regulatory Commission (BTRC)'}</p>
      <div className="neir-footer-links">
        <p>{bn?'সেবার শর্তাবলি':'Terms of Service'}</p>
        <p>{bn?'গোপনীয়তা নীতি':'Privacy Policy'}</p>
        <button type="button" onClick={onContactUs}>{bn?'যোগাযোগ':'Contact Us'}</button>
      </div>
    </div>
  </footer>;
};
