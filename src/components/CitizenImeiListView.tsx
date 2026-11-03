import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileSearch2, Info, Mail, Phone, Search, ShieldAlert, Smartphone, UserRound } from 'lucide-react';
import type { Language, UserSession } from '../types.ts';
import { SAMPLE_HANDSETS, type HandsetRecord } from '../utils/imei.ts';
import { ProfileSpecialRegistrationModal } from './ProfileSpecialRegistrationModal.tsx';
import { listCitizenSpecialRegistrations, type SpecialApplication } from '../utils/neirSpecialRegistrationApi.ts';
import { UiButton, UiInput, UiDataTable, UiStatusBadge, UiDialog } from '../ui/index.ts';
import type { UiColumn } from '../ui/index.ts';
import './CitizenImeiListView.css';

type DeviceStatus =
  | 'Registered' | 'Applied for registration' | 'Registration Pending' | 'Restricted'
  | 'Whitelisted' | 'Greylisted' | 'Unregistered' | 'Blacklisted';

type Device = { imei: string; status: DeviceStatus; brand?: string; model?: string; explanation?: string };

// Device entries for the IMEI search examples.
const referenceDevices: Device[] = [
  { imei: '12345678901234', status: 'Registered', brand:'', model:'Handset A' },
  { imei: '23456789012345', status: 'Greylisted', brand:'', model:'Handset B' },
  { imei: '49115420325851', status: 'Registered' },
  { imei: '12104089900331', status: 'Applied for registration' },
  { imei: '12304089900331', status: 'Registered' },
  { imei: '12004089900331', status: 'Registration Pending' },
  { imei: '49015420323754', status: 'Registered' },
  { imei: '49015420323753', status: 'Registered' },
  { imei: '49015420323752', status: 'Registered' },
  { imei: '49015420323762', status: 'Registered' },
  { imei: '49015420323751', status: 'Registered' },
  { imei: '33904089900331', status: 'Registered' },
];

const statusFromSample: Record<HandsetRecord['registrationStatus'], DeviceStatus> = {
  valid: 'Whitelisted',
  grey_market: 'Greylisted',
  unregistered: 'Unregistered',
  blacklisted: 'Blacklisted',
};
const requiresSpecialRegistration = (status: DeviceStatus) =>
  status === 'Greylisted' || status === 'Registration Pending';

const explanations: Record<DeviceStatus, { en: string; bn: string }> = {
  Registered: {
    en: 'This device is registered. No further registration is required.',
    bn: 'ডিভাইসটি নিবন্ধিত। বিশেষ নিবন্ধনের প্রয়োজন নেই।',
  },
  'Applied for registration': {
    en: 'A Special Registration application has already been submitted for this device.',
    bn: 'এই ডিভাইসের জন্য বিশেষ নিবন্ধনের আবেদন জমা দেওয়া হয়েছে।',
  },
  'Registration Pending': {
    en: 'Registration is pending. Continue with Special Registration.',
    bn: 'নিবন্ধন অপেক্ষমাণ। বিশেষ নিবন্ধন চালিয়ে যেতে পারেন।',
  },
  'Restricted': {
    en: 'This device is marked as restricted.',
    bn: 'এই ডিভাইসটি সীমাবদ্ধ হিসেবে চিহ্নিত।',
  },
  Whitelisted: {
    en: 'This handset is registered. Special Registration is not needed.',
    bn: 'ডিভাইসটি অনুমোদিত। বিশেষ নিবন্ধনের প্রয়োজন নেই।',
  },
  Greylisted: {
    en: 'This handset is greylisted. Apply for Special Registration to complete registration.',
    bn: 'ডিভাইসটি গ্রেলিস্টেড। নিবন্ধন সম্পূর্ণ করতে বিশেষ নিবন্ধন প্রয়োজন।',
  },
  Unregistered: {
    en: 'This handset is unregistered. Please check the IMEI and registration details.',
    bn: 'ডিভাইসটি অনিবন্ধিত। আইএমইআই ও নিবন্ধনের তথ্য যাচাই করুন।',
  },
  Blacklisted: {
    en: 'This handset is blacklisted. Contact the responsible authority.',
    bn: 'নমুনা তথ্যে ডিভাইসটি ব্ল্যাকলিস্টেড। বিশেষ নিবন্ধনের বদলে সংশ্লিষ্ট কর্তৃপক্ষের সাথে যোগাযোগ করুন।',
  },
};
const bnStatus: Partial<Record<DeviceStatus, string>> = {
  Registered: 'নিবন্ধিত', 'Applied for registration': 'আবেদন করা হয়েছে',
  'Registration Pending': 'নিবন্ধন অপেক্ষমাণ', Whitelisted: 'হোয়াইটলিস্টেড',
  Greylisted: 'গ্রেলিস্টেড', Unregistered: 'অনিবন্ধিত', Blacklisted: 'ব্ল্যাকলিস্টেড',
  'Restricted': 'সীমাবদ্ধ',
};
const statusClass = (status: DeviceStatus) => {
  if (status === 'Whitelisted' || status === 'Registered') return 'is-approved';
  if (status === 'Greylisted' || status === 'Registration Pending') return 'is-warning';
  if (status === 'Blacklisted' || status === 'Restricted') return 'is-danger';
  return 'is-neutral';
};

type Props = {
  language: Language;
  session: UserSession;
  registrationOnly?: boolean;
  registrationTrigger?: number | null;
  onRegistrationHandled?: () => void;
  onRegistrationComplete?: (message: string) => void;
};
export const CitizenImeiListView: React.FC<Props> = ({
  language, session, registrationOnly = false, registrationTrigger = null,
  onRegistrationHandled, onRegistrationComplete,
}) => {
  const isBn = language === 'bn';
  const [imeiQuery, setImeiQuery] = useState('');
  const [searchedImei, setSearchedImei] = useState<string | null>(null);
  const [searchError, setSearchError] = useState('');
  const [detail, setDetail] = useState<Device | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(session.name);
  const [profileDraft, setProfileDraft] = useState(session.name);
  const [profileError, setProfileError] = useState('');
  const [wizard, setWizard] = useState<{ source: 'home' | 'profile'; imei: string } | null>(null);
  const [result, setResult] = useState('');
  const [specialApplications, setSpecialApplications] = useState<SpecialApplication[]>([]);
  const [applicationError, setApplicationError] = useState('');
  const [applicationDetail, setApplicationDetail] = useState<SpecialApplication | null>(null);
  const observedRegistrationTrigger = useRef<number | null>(null);
  // Only acceptance releases a slot; rejected submissions remain in the counted history.
  const activeApplicationCount = specialApplications.filter(application => application.status !== 'Accepted').length;
  const availableSlots = Math.max(0, 20 - activeApplicationCount);
  const reachedLimit = availableSlots === 0;

  useEffect(() => { setProfileName(session.name); setProfileDraft(session.name); }, [session.name]);
  useEffect(() => {
    let active = true;
    listCitizenSpecialRegistrations(session.mobile).then(records => {
      if (active) { setSpecialApplications(records); setApplicationError(''); }
    }).catch(error => { if (active) setApplicationError(error instanceof Error ? error.message : 'Unable to load applications.'); });
    return () => { active = false; };
  }, [result, session.mobile]);
  const refreshApplications = async () => {
    try { setSpecialApplications(await listCitizenSpecialRegistrations(session.mobile)); setApplicationError(''); }
    catch (error) { setApplicationError(error instanceof Error ? error.message : 'Unable to load applications.'); }
  };
  // Admin decisions are reflected without a full profile reload. Keep the
  // explicit Refresh control and recheck when returning to this tab.
  useEffect(() => {
    const sync = () => { if (document.visibilityState === 'visible') void refreshApplications(); };
    const onFocus = () => { void refreshApplications(); };
    const timer = window.setInterval(sync, 30000);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [session.mobile]);


  // Homepage and My Profile share the same progressive registration modal.
  useEffect(() => {
    if (registrationTrigger === null) { observedRegistrationTrigger.current = null; return; }
    if (registrationOnly && registrationTrigger !== observedRegistrationTrigger.current) {
      observedRegistrationTrigger.current = registrationTrigger;
      if (reachedLimit) {
        setResult(isBn ? '২০টি আবেদন পূর্ণ হয়েছে। নতুন আবেদন করতে একটি আবেদন গ্রহণ হওয়া পর্যন্ত অপেক্ষা করুন।' : '20 applications are in use. A new slot opens after an application is accepted.');
      } else {
        setResult('');
        setWizard({ source: 'home', imei: '' });
      }
      onRegistrationHandled?.();
    }
  }, [registrationOnly, registrationTrigger, onRegistrationHandled]);

  const exactReference = searchedImei
    ? referenceDevices.find(device => device.imei === searchedImei)
    : undefined;
  const sample = searchedImei ? SAMPLE_HANDSETS[searchedImei] : undefined;
  const originalDevice: Device | null = exactReference ?? (sample ? {
    imei: sample.imei, brand: sample.brand, model: sample.model,
    status: statusFromSample[sample.registrationStatus],
    explanation: isBn ? sample.detailsBangla : sample.detailsEnglish,
  } : null);
  const applicationForSearch = specialApplications.find(app => app.imei === searchedImei);
  const matchedDevice = originalDevice && {
    ...originalDevice,
    status: applicationForSearch?.status === 'Accepted' ? 'Registered'
      : applicationForSearch?.status === 'Pending' || applicationForSearch?.status === 'In Progress' ? 'Applied for registration'
      : originalDevice.status,
  };

  const searchDevice = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchError('');
    setResult('');
    const clean = imeiQuery.replace(/[\s-]/g, '');
    if (!/^\d{14,15}$/.test(clean)) {
      setSearchedImei(null);
      setSearchError(isBn
        ? '১৪ বা ১৫ সংখ্যার বৈধ IMEI নম্বর লিখুন।'
        : 'Enter a valid 14- or 15-digit numeric IMEI number.');
      return;
    }
    setSearchedImei(clean);
  };
  const startProfileRegistration = (imei: string) => {
    setDetail(null);
    if (reachedLimit) {
      setResult(isBn ? '২০টি আবেদন পূর্ণ হয়েছে। নতুন আবেদন করতে একটি আবেদন গ্রহণ হওয়া পর্যন্ত অপেক্ষা করুন।' : '20 applications are in use. A new slot opens after an application is accepted.');
      return;
    }
    setResult('');
    setWizard({ source: 'profile', imei });
  };
  const completeRegistration = (message: string) => {
    setResult(message);
    setWizard(null);
    void refreshApplications();
    onRegistrationComplete?.(message);
  };
  const editProfile = () => {
    setProfileDraft(profileName);
    setProfileError('');
    setProfileOpen(true);
  };
  const saveProfile = () => {
    const trimmed = profileDraft.trim();
    if (!trimmed) { setProfileError(isBn ? 'নাম লিখুন।' : 'Enter a name.'); return; }
    setProfileName(trimmed);
    setProfileOpen(false);
    setResult(isBn
      ? 'এই পৃষ্ঠায় নাম আপডেট হয়েছে। সার্ভারে কোনো পরিবর্তন পাঠানো হয়নি।'
      : 'Profile name updated.');
  };
  const statusLabel = (status: DeviceStatus) => isBn ? (bnStatus[status] ?? status) : status;
  const note = isBn
    ? ''
    : '';
  const applicationColumns: UiColumn<SpecialApplication>[] = [
    { key: 'number', heading: '#', numeric: true, render: (_, index) => index + 1 },
    { key: 'imei', heading: 'IMEI Number', sortValue: row => row.imei,
      render: row => <span className="neir-special-imei">{row.imei}</span> },
    { key: 'device', heading: isBn ? 'ডিভাইস' : 'Device',
      render: row => row.reason === 'airmail' ? 'Air Mail' : row.reason === 'gift' ? 'Gift' : 'Foreign Tour' },
    { key: 'status', heading: isBn ? 'আবেদনের অবস্থা' : 'Status', sortValue: row => row.status,
      render: row => <UiStatusBadge
        tone={row.status === 'Accepted' ? 'success' : row.status === 'Rejected' ? 'danger'
          : row.status === 'In Progress' ? 'info' : 'warning'}
        className={'neir-special-table-status is-' + row.status.toLowerCase().replace(/\s+/g, '-')}>
        {row.status}
      </UiStatusBadge> },
    { key: 'date', heading: isBn ? 'আবেদনের তারিখ' : 'Applied on',
      sortValue: row => row.appliedAt || '',
      render: row => row.appliedAt ? new Date(row.appliedAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-GB') : '—' },
    { key: 'action', heading: isBn ? 'বিস্তারিত' : 'Action',
      render: row => <UiButton variant="secondary" size="compact" className="neir-special-details-button"
        onClick={event => { event.stopPropagation(); setApplicationDetail(row); }}>
        {isBn ? 'বিস্তারিত' : 'Details'}
      </UiButton> },
  ];

  return <>
    {!registrationOnly && <section className="neir-profile-page" aria-label={isBn ? 'আমার প্রোফাইল' : 'My Profile'}>
      <div className="neir-profile-content">
        <div className="neir-profile-overview">
          <section className="neir-profile-identity" aria-labelledby="neir-profile-title">
            <div className="neir-profile-person">
              <span className="neir-profile-avatar" role="img" aria-label={isBn ? 'প্রোফাইল ছবির স্থান' : 'Profile photo placeholder'}>
                <UserRound size={36} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <div className="neir-profile-identity-copy">
                <p className="neir-profile-eyebrow">{isBn ? 'আমার প্রোফাইল' : 'My Profile'}</p>
                <h1 id="neir-profile-title">{profileName}</h1>
                <div className="neir-profile-contact">
                  {session.mobile && <span><Phone size={16} aria-hidden="true" /> {session.mobile}</span>}
                  {session.email && !session.email.endsWith('.invalid') && <span><Mail size={16} aria-hidden="true" /> {session.email}</span>}
                </div>
              </div>
            </div>
            <div className="neir-profile-actions">
              <UiButton variant="secondary" type="button" className="neir-profile-edit" onClick={editProfile}>
                {isBn ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile Informations'}
              </UiButton>
            </div>
          </section>
          <section className="neir-profile-registration-card" aria-labelledby="neir-profile-registration-heading">
            <div className="neir-profile-registration-heading">
              <span className="neir-profile-registration-icon" aria-hidden="true"><FileSearch2 size={24} strokeWidth={1.8} /></span>
              <div>
                <h2 id="neir-profile-registration-heading">{isBn ? 'বিশেষ নিবন্ধন' : 'Special Registration'}</h2>
                <p>{isBn ? 'যোগ্য ডিভাইসের নিবন্ধনের জন্য আবেদন করুন।' : 'Apply to register an eligible handset.'}</p>
              </div>
            </div>
            <div className="neir-profile-registration-action">
              <p className="neir-profile-registration-capacity" role="status">
                <strong>{isBn ? availableSlots.toLocaleString('bn-BD') : availableSlots}</strong>
                {isBn ? ' / ২০টি আবেদন স্লট খালি' : ' of 20 application slots available'}
              </p>
              <UiButton variant="primary" type="button" className="neir-profile-apply"
                onClick={() => startProfileRegistration('')} disabled={reachedLimit}>
                {isBn ? 'বিশেষ নিবন্ধনের আবেদন' : 'Apply for Special Registration'}
              </UiButton>
            </div>
          </section>
        </div>

        <section className={'neir-profile-search-panel' + (searchedImei === null ? ' is-search-idle' : '')} aria-labelledby="neir-device-search-title">
          <div className="neir-profile-search-header">
            <div>
              <h2 id="neir-device-search-title">{isBn ? 'আপনার ডিভাইসের তথ্য খুঁজুন' : 'Search your device info'}</h2>
              <p>{isBn ? 'IMEI নম্বর দিয়ে ডিভাইসের তথ্য ও নিবন্ধনের অবস্থা দেখুন।' : 'Search by IMEI to see the device information and registration status.'}</p>
            </div>
          </div>
          <form role="search" className="neir-profile-search-form" onSubmit={searchDevice} noValidate>
            <label htmlFor="neir-profile-imei-search">{isBn ? 'ডিভাইসের IMEI নম্বর' : 'Device IMEI number'}</label>
            <div className="neir-profile-search-controls">
              <div className="neir-profile-search-input">
                <Search size={20} aria-hidden="true" />
                <UiInput id="neir-profile-imei-search" type="text" inputMode="numeric" autoComplete="off"
                  maxLength={17} value={imeiQuery}
                  placeholder={isBn ? '১৪ বা ১৫ সংখ্যার IMEI লিখুন' : 'Enter 14- or 15-digit IMEI'}
                  aria-invalid={!!searchError} aria-describedby={searchError ? 'neir-profile-search-error' : undefined}
                  onChange={event => {
                    setImeiQuery(event.target.value);
                    setSearchedImei(null);
                    setSearchError('');
                  }} />
              </div>
              <UiButton variant="primary" className="neir-profile-search-button" type="submit" disabled={!imeiQuery.trim()}>
                <Search size={18} aria-hidden="true" />
                {isBn ? 'খুঁজুন' : 'Search device'}
              </UiButton>
            </div>
            {searchError && <p id="neir-profile-search-error" className="neir-profile-search-error" role="alert">{searchError}</p>}
          </form>

          {searchedImei !== null && <div className="neir-profile-search-outcome" aria-live="polite">
            {matchedDevice ? <article className="neir-profile-device-result" aria-label={isBn ? 'ডিভাইসের অনুসন্ধান ফলাফল' : 'Device search result'}>
              <div className="neir-profile-result-top">
                <span className="neir-profile-device-icon"><Smartphone size={26} aria-hidden="true" /></span>
                <div className="neir-profile-result-title">
                  <h3>{matchedDevice.brand && matchedDevice.model ? matchedDevice.brand + ' · ' + matchedDevice.model : (isBn ? 'ডিভাইসের তথ্য' : 'Device information')}</h3>
                  <p><span>IMEI</span> <strong>{matchedDevice.imei}</strong></p>
                </div>
                <span className={'neir-profile-status ' + statusClass(matchedDevice.status)}>
                  {matchedDevice.status === 'Whitelisted' || matchedDevice.status === 'Registered'
                    ? <CheckCircle2 size={17} aria-hidden="true" />
                    : matchedDevice.status === 'Greylisted' || matchedDevice.status === 'Registration Pending'
                      ? <AlertTriangle size={17} aria-hidden="true" />
                      : <ShieldAlert size={17} aria-hidden="true" />}
                  {statusLabel(matchedDevice.status)}
                </span>
              </div>
              <div className={'neir-profile-status-description ' + statusClass(matchedDevice.status)}>
                <p>{explanations[matchedDevice.status][isBn ? 'bn' : 'en']}</p>
              </div>
              <div className="neir-profile-result-actions">
                {requiresSpecialRegistration(matchedDevice.status) && !applicationForSearch &&
                  <UiButton variant="primary" type="button" className="neir-profile-primary-action"
                    onClick={() => startProfileRegistration(matchedDevice.imei)}>
                    {isBn ? 'বিশেষ নিবন্ধনের আবেদন করুন' : 'Apply for Special Registration'}
                  </UiButton>}
                <UiButton variant="secondary" type="button" className="neir-profile-secondary-action" onClick={() => setDetail(matchedDevice)}>
                  <Info size={17} aria-hidden="true" /> {isBn ? 'বিস্তারিত দেখুন' : 'View details'}
                </UiButton>
              </div>
            </article> : <div className="neir-profile-empty-state neir-profile-no-match">
              <span className="neir-profile-empty-icon"><FileSearch2 size={32} aria-hidden="true" /></span>
              <h3>{isBn ? 'রেফারেন্স তথ্যে IMEI পাওয়া যায়নি' : 'No matching device found'}</h3>
              <p>{isBn
                ? 'এই নম্বরের অবস্থা যাচাই করা যায়নি। অজানা IMEI-কে হোয়াইটলিস্টেড বা গ্রেলিস্টেড ধরা হচ্ছে না।'
                : 'The entered IMEI does not match available device information.'}</p>
              <p className="neir-profile-unmatched-imei">IMEI: {searchedImei}</p>
            </div>}
          </div>}
          {note && <p className="neir-profile-data-note">{note}</p>}
          {applicationError && <p role="alert" className="neir-profile-search-error">{applicationError}
            <UiButton variant="quiet" type="button" className="neir-profile-retry" onClick={refreshApplications}>Retry</UiButton></p>}
          {result && <p role="status" className="neir-profile-feedback">{result}</p>}
        </section>
        {<section className="neir-special-applications" aria-labelledby="neir-special-applications-title">
          <div className="neir-special-table-heading">
            <div>
              <h2 id="neir-special-applications-title">{isBn ? 'বিশেষ নিবন্ধনের আবেদন' : 'Special Registration applications'} ({specialApplications.length})</h2>
              <p className="neir-special-quota" role="status">{isBn ? `${activeApplicationCount}/২০টি আবেদন ব্যবহৃত · ${availableSlots}টি খালি` : `${activeApplicationCount}/20 applications in use · ${availableSlots} available`}</p>
              {reachedLimit && <p className="neir-special-quota-warning">{isBn ? 'একটি আবেদন গ্রহণ হলে নতুন IMEI যোগ করতে পারবেন।' : 'You can apply for another IMEI after an application is accepted.'}</p>}
            </div>
            <UiButton variant="secondary" type="button" className="neir-profile-secondary-action" onClick={refreshApplications}>{isBn ? 'হালনাগাদ' : 'Refresh status'}</UiButton>
          </div>
          <UiDataTable
            rows={specialApplications}
            columns={applicationColumns}
            rowKey={row => row.id}
            onRowClick={setApplicationDetail}
            rowLabel={row => 'View Special Registration application for IMEI ' + row.imei}
            className="neir-special-table"
            scrollClassName="neir-special-table-scroll"
            searchPlaceholder={isBn ? 'IMEI বা অবস্থা অনুসন্ধান করুন' : 'Search by IMEI, device or status'}
            searchable={(row, query) => [row.imei, row.status, row.reason].some(value => value.toLowerCase().includes(query))}
            renderMobileCard={row => <article className="neir-special-mobile-card" aria-label={(isBn ? 'আবেদন' : 'Application') + ' ' + row.imei}>
              <header className="neir-special-mobile-card-heading">
                <div className="neir-special-mobile-card-title">
                  <p className="neir-special-mobile-label">{isBn ? 'ডিভাইস IMEI' : 'Device IMEI'}</p>
                  <h3>{row.imei}</h3>
                  <p className="neir-special-mobile-category">
                    {row.reason === 'airmail' ? (isBn ? 'এয়ার মেইল' : 'Air Mail') :
                      row.reason === 'gift' ? (isBn ? 'উপহার' : 'Gift') : (isBn ? 'বিদেশ ভ্রমণ' : 'Foreign Tour')}
                  </p>
                </div>
                <UiStatusBadge tone={row.status === 'Accepted' ? 'success' : row.status === 'Rejected' ? 'danger'
                  : row.status === 'In Progress' ? 'info' : 'warning'}>{row.status}</UiStatusBadge>
              </header>
              <div className="neir-special-mobile-card-fields">
                <p>{isBn ? 'আবেদন করা হয়েছে' : 'Applied on'}</p>
                <p>{row.appliedAt ? new Date(row.appliedAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-GB') : '—'}</p>
              </div>
              <footer className="neir-special-mobile-card-footer">
                <p>{isBn ? 'বিস্তারিত দেখতে কার্ডে চাপুন' : 'Tap the card to view details'}</p>
                <UiButton variant="secondary" size="compact" className="neir-special-details-button"
                  onClick={event => { event.stopPropagation(); setApplicationDetail(row); }}>
                  {isBn ? 'বিস্তারিত' : 'Details'}
                </UiButton>
              </footer>
            </article>}
            emptyText={isBn ? 'কোনো আবেদন পাওয়া যায়নি' : 'No matching applications'}
          />
        </section>}
      </div>
    </section>}

    {detail && <UiDialog title={isBn ? 'IMEI বিস্তারিত' : 'IMEI Details'} ariaLabel="IMEI details"
      size="medium" onClose={() => setDetail(null)}
      footer={requiresSpecialRegistration(detail.status) ? <UiButton variant="primary"
        onClick={() => startProfileRegistration(detail.imei)}>
        {isBn ? 'বিশেষ নিবন্ধনের আবেদন' : 'Apply for Special Registration'}
      </UiButton> : undefined}>
      <div className="neir-profile-detail">
        <div className="neir-profile-detail-hero">
          <span className="neir-profile-detail-icon" aria-hidden="true"><Smartphone size={26} /></span>
          <div className="neir-profile-detail-heading">
            <p className="neir-profile-detail-eyebrow">{isBn ? 'ডিভাইস যাচাই' : 'Device verification'}</p>
            <h3>{detail.brand && detail.model ? detail.brand + ' · ' + detail.model : (isBn ? 'ডিভাইসের তথ্য' : 'Device information')}</h3>
            <p>IMEI {detail.imei}</p>
          </div>
          <span className={'neir-profile-status ' + statusClass(detail.status)}>{statusLabel(detail.status)}</span>
        </div>
        <div className="neir-profile-detail-grid">
          <div className="neir-profile-detail-field">
            <p className="neir-profile-detail-label">{isBn ? 'IMEI নম্বর' : 'IMEI Number'}</p>
            <p className="neir-profile-detail-value">{detail.imei}</p>
          </div>
          {detail.brand && <div className="neir-profile-detail-field">
            <p className="neir-profile-detail-label">{isBn ? 'ব্র্যান্ড' : 'Brand'}</p>
            <p className="neir-profile-detail-value">{detail.brand}</p>
          </div>}
          {detail.model && <div className="neir-profile-detail-field">
            <p className="neir-profile-detail-label">{isBn ? 'মডেল' : 'Model'}</p>
            <p className="neir-profile-detail-value">{detail.model}</p>
          </div>}
          <div className="neir-profile-detail-field">
            <p className="neir-profile-detail-label">{isBn ? 'অবস্থা' : 'Registration status'}</p>
            <p className="neir-profile-detail-value">{statusLabel(detail.status)}</p>
          </div>
        </div>
        <div className={'neir-profile-detail-message ' + statusClass(detail.status)}>
          <Info size={20} aria-hidden="true" />
          <p>{detail.explanation || explanations[detail.status][isBn ? 'bn' : 'en']}</p>
        </div>
      </div>
    </UiDialog>}
    {profileOpen && <UiDialog title="Edit Profile Informations" ariaLabel="Edit profile information" size="compact"
      closeLabel="Close profile" onClose={() => setProfileOpen(false)}
      footer={<UiButton variant="secondary" className="neir-shared-button" onClick={saveProfile}>Save changes</UiButton>}>
      <label className="block text-sm" htmlFor="neir-profile-name-field">Full Name</label>
      <UiInput id="neir-profile-name-field" className="neir-shared-field" value={profileDraft}
        onChange={event => { setProfileDraft(event.target.value); setProfileError(''); }} />
      {profileError && <p role="alert" className="neir-profile-search-error">{profileError}</p>}
      <p className="neir-shared-note" style={{ marginTop: 14 }}>Review your profile information before saving.</p>
    </UiDialog>}
    {applicationDetail && <UiDialog title={isBn ? 'বিশেষ নিবন্ধনের বিস্তারিত' : 'Special Registration details'}
      ariaLabel="Special Registration details" size="medium" onClose={() => setApplicationDetail(null)}>
      <div className="neir-profile-detail">
        <div className="neir-profile-detail-hero">
          <span className="neir-profile-detail-icon" aria-hidden="true"><FileSearch2 size={26} /></span>
          <div className="neir-profile-detail-heading">
            <p className="neir-profile-detail-eyebrow">{isBn ? 'আবেদনের সারসংক্ষেপ' : 'Application summary'}</p>
            <h3>{applicationDetail.imei}</h3>
            <p>{applicationDetail.reason === 'airmail' ? (isBn ? 'এয়ার মেইল' : 'Air Mail') :
              applicationDetail.reason === 'gift' ? (isBn ? 'উপহার' : 'Gift') : (isBn ? 'বিদেশ ভ্রমণ' : 'Foreign Tour')}</p>
          </div>
          <UiStatusBadge tone={applicationDetail.status === 'Accepted' ? 'success' :
            applicationDetail.status === 'Rejected' ? 'danger' : applicationDetail.status === 'In Progress' ? 'info' : 'warning'}>
            {applicationDetail.status}
          </UiStatusBadge>
        </div>
        <div className="neir-profile-detail-grid">
          <div className="neir-profile-detail-field neir-profile-detail-field--wide">
            <p className="neir-profile-detail-label">{isBn ? 'আবেদনের রেফারেন্স' : 'Application reference'}</p>
            <p className="neir-profile-detail-value">{applicationDetail.id}</p>
          </div>
          <div className="neir-profile-detail-field">
            <p className="neir-profile-detail-label">{isBn ? 'IMEI নম্বর' : 'IMEI Number'}</p>
            <p className="neir-profile-detail-value">{applicationDetail.imei}</p>
          </div>
          <div className="neir-profile-detail-field">
            <p className="neir-profile-detail-label">{isBn ? 'আবেদনের অবস্থা' : 'Application status'}</p>
            <p className="neir-profile-detail-value">{applicationDetail.status}</p>
          </div>
          <div className="neir-profile-detail-field">
            <p className="neir-profile-detail-label">{isBn ? 'আবেদনের তারিখ' : 'Applied on'}</p>
            <p className="neir-profile-detail-value">{applicationDetail.appliedAt ?
              new Date(applicationDetail.appliedAt).toLocaleString(isBn ? 'bn-BD' : 'en-GB') : '—'}</p>
          </div>
          <div className="neir-profile-detail-field">
            <p className="neir-profile-detail-label">{isBn ? 'আগমনের তারিখ' : 'Arrival date'}</p>
            <p className="neir-profile-detail-value">{applicationDetail.arrivalDate || '—'}</p>
          </div>
          <div className="neir-profile-detail-field neir-profile-detail-field--wide">
            <p className="neir-profile-detail-label">{isBn ? 'মন্তব্য' : 'Remarks'}</p>
            <p className="neir-profile-detail-value">{applicationDetail.remarks || '—'}</p>
          </div>
        </div>
      </div>
    </UiDialog>}
    {wizard && <ProfileSpecialRegistrationModal initialImei={wizard.imei} citizenMobile={session.mobile}
      onClose={() => setWizard(null)} onComplete={completeRegistration} />}
  </>;
};
