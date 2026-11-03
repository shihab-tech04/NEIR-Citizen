import React from 'react';
import { ArrowRight, BookOpen, Smartphone, UserRoundPlus } from 'lucide-react';
import type { Language } from '../types.ts';
import { UiButton } from '../ui/index.ts';
import './HomeServiceEntry.css';

type Props = {
  language: Language;
  isLoggedIn: boolean;
  onCreateAccount: () => void;
  onOpenDashboard: () => void;
  onSpecialRegistration: () => void;
  onOpenGuides: () => void;
};

/**
 * Service-discovery panel, separate from the locked IMEI verification hero.
 * Reuses existing routes and modals; owns no registration or identity state.
 */
export const HomeServiceEntry: React.FC<Props> = ({
  language, isLoggedIn, onCreateAccount, onOpenDashboard, onSpecialRegistration, onOpenGuides,
}) => {
  const bn = language === 'bn';
  return (
    <section className="neir-service-entry" aria-labelledby="neir-service-entry-title">
      <div className="neir-service-entry-panel">
        <div className="neir-service-entry-heading">
          <div className="neir-service-entry-heading-copy">
            <h2 id="neir-service-entry-title">
              {bn ? 'কোন সেবাটি প্রয়োজন?' : 'What would you like to do?'}
            </h2>
            <p>{bn
              ? 'নাগরিক অ্যাকাউন্ট এবং মোবাইল ডিভাইসের বিশেষ নিবন্ধন দুটি ভিন্ন প্রক্রিয়া।'
              : 'Citizen account registration and special handset registration are different services.'}</p>
          </div>
          <UiButton variant="link" className="neir-service-guides" onClick={onOpenGuides}>
            <BookOpen size={17} aria-hidden="true" />
            {bn ? 'ব্যবহার নির্দেশিকা' : 'User Guides'}
            <ArrowRight size={16} aria-hidden="true" />
          </UiButton>
        </div>
        <div className="neir-service-entry-grid">
          <article className="neir-service-card">
            <div className="neir-service-card-heading">
              <span className="neir-service-card-icon" aria-hidden="true">
                <UserRoundPlus size={23} strokeWidth={1.9} />
              </span>
              <div className="neir-service-card-copy">
                <h3>{isLoggedIn
                  ? (bn ? 'নাগরিক প্রোফাইল' : 'Citizen account')
                  : (bn ? 'নাগরিক অ্যাকাউন্ট তৈরি' : 'Create a citizen account')}</h3>
                <p>{isLoggedIn
                  ? (bn ? 'আপনি ইতিমধ্যে সাইন ইন করেছেন।' : 'You are already signed in.')
                  : (bn ? 'প্রোফাইল ও নিবন্ধনের আবেদন পরিচালনার জন্য নিবন্ধন করুন।'
                    : 'Sign up to manage your profile and registration applications.')}</p>
              </div>
            </div>
            <UiButton variant="link" className="neir-service-card-action"
              onClick={isLoggedIn ? onOpenDashboard : onCreateAccount}>
              {isLoggedIn
                ? (bn ? 'আমার প্রোফাইল খুলুন' : 'Open my profile')
                : (bn ? 'অ্যাকাউন্ট নিবন্ধন' : 'Create account')}
              <ArrowRight size={18} aria-hidden="true" />
            </UiButton>
          </article>
          <article className="neir-service-card">
            <div className="neir-service-card-heading">
              <span className="neir-service-card-icon" aria-hidden="true">
                <Smartphone size={23} strokeWidth={1.9} />
              </span>
              <div className="neir-service-card-copy">
                <h3>{bn ? 'ডিভাইসের বিশেষ নিবন্ধন' : 'Special Registration for a handset'}</h3>
                <p>{bn
                  ? 'বিদেশ থেকে আনা যোগ্য ডিভাইসের নিবন্ধনের আবেদন করুন।'
                  : 'Apply to register an eligible handset brought from abroad.'}</p>
              </div>
            </div>
            <UiButton variant="primary" className="neir-service-card-action" onClick={onSpecialRegistration}>
              {bn ? 'বিশেষ নিবন্ধনের আবেদন' : 'Apply for Special Registration'}
              <ArrowRight size={18} aria-hidden="true" />
            </UiButton>
          </article>
        </div>
      </div>
    </section>
  );
};
