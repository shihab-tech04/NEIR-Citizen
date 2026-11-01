import React from 'react';
import type {Language} from '../types.ts';

type Props = { language: Language; onContactUs: () => void };
export const Footer:React.FC<Props> = ({onContactUs}) => (
  <footer className="neir-original-footer">
    <div className="neir-original-footer-inner">
      <p>Copyright © 2026 Bangladesh Telecommunication Regulatory Commission (BTRC)</p>
      <nav aria-label="Footer">
        <span>Terms of Service</span>
        <span>Privacy Policy</span>
        <button type="button" onClick={onContactUs}>Contact Us</button>
      </nav>
    </div>
  </footer>
);
