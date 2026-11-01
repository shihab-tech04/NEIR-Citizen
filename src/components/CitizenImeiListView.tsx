import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileSearch2, Info, Mail, Phone, Search, ShieldAlert, Smartphone, UserRound } from 'lucide-react';
import type { Language, UserSession } from '../types.ts';
import { SAMPLE_HANDSETS, type HandsetRecord } from '../utils/imei.ts';
import { ProfileSpecialRegistrationModal } from './ProfileSpecialRegistrationModal.tsx';
import { listCitizenSpecialRegistrations, type SpecialApplication } from '../utils/neirSpecialRegistrationApi.ts';
import { NeirModalFrame } from './NeirModalFrame.tsx';
import { UiButton, UiInput, UiDataTable, UiStatusBadge } from '../ui/index.ts';
import type { UiColumn } from '../ui/index.ts';
import './CitizenImeiListView.css';

type DeviceStatus =
  | 'Registered' | 'Applied for registration' | 'Registration Pending' | 'Restricted (demo)'
  | 'Whitelisted' | 'Greylisted' | 'Unregistered' | 'Blacklisted';

type Device = { imei: string; status: DeviceStatus; brand?: string; model?: string; explanation?: string };

// Historical HTML v7 prototype records. These are fixtures, not verified NEIR account records.
const referenceDevices: Device[] = [
  { imei: '12345678901234', status: 'Registered', brand:'Sample', model:'Handset A' },
  { imei: '23456789012345', status: 'Greylisted', brand:'Sample', model:'Handset B' },
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
    en: 'This device is shown as registered in the reference data. No special registration action is required.',
    bn: 'রেফারেন্স তথ্যে ডিভাইসটি নিবন্ধিত। বিশেষ নিবন্ধন প্রয়োজন নেই।',
  },
  'Applied for registration': {
    en: 'A registration application is already shown for this reference device.',
    bn: 'এই রেফারেন্স ডিভাইসের জন্য নিবন্ধনের আবেদন রয়েছে।',
  },
  'Registration Pending': {
    en: 'Registration is pending in the reference data. You can continue with Special Registration.',
    bn: 'রেফারেন্স তথ্যে নিবন্ধন অপেক্ষমাণ। বিশেষ নিবন্ধন চালিয়ে যেতে পারেন।',
  },
  'Restricted (demo)': {
    en: 'The reference device was locally marked as restricted. No report was sent to NEIR.',
    bn: 'এই রেফারেন্স ডিভাইসটি শুধু স্থানীয়ভাবে সীমাবদ্ধ করা হয়েছে। NEIR-এ কোনো রিপোর্ট পাঠানো হয়নি।',
  },
  Whitelisted: {
    en: 'The sample record shows an authorized handset. Special Registration is not needed.',
    bn: 'নমুনা তথ্য অনুযায়ী ডিভাইসটি অনুমোদিত। বিশেষ নিবন্ধন প্রয়োজন নেই।',
  },
  Greylisted: {
    en: 'The sample record shows a greylisted handset. Special Registration is required to complete its registration.',
    bn: 'নমুনা তথ্যে ডিভাইসটি গ্রেলিস্টেড। নিবন্ধন সম্পূর্ণ করতে বিশেষ নিবন্ধন প্রয়োজন।',
  },
  Unregistered: {
    en: 'The sample record is unregistered. Check with the appropriate help desk; this is not proof of greylisting.',
    bn: 'নমুনা তথ্যে ডিভাইসটি অনিবন্ধিত। সহায়তা কেন্দ্রে যাচাই করুন; এটি গ্রেলিস্টেড হওয়ার প্রমাণ নয়।',
  },
  Blacklisted: {
    en: 'The sample record is blacklisted. Contact the responsible authority rather than applying for Special Registration.',
    bn: 'নমুনা তথ্যে ডিভাইসটি ব্ল্যাকলিস্টেড। বিশেষ নিবন্ধনের বদলে সংশ্লিষ্ট কর্তৃপক্ষের সাথে যোগাযোগ করুন।',
  },
};
const bnStatus: Partial<Record<DeviceStatus, string>> = {
  Registered: 'নিবন্ধিত', 'Applied for registration': 'আবেদন করা হয়েছে',
  'Registration Pending': 'নিবন্ধন অপেক্ষমাণ', Whitelisted: 'হোয়াইটলিস্টেড',
  Greylisted: 'গ্রেলিস্টেড', Unregistered: 'অনিবন্ধিত', Blacklisted: 'ব্ল্যাকলিস্টেড',
  'Restricted (demo)': 'সীমাবদ্ধ (স্থানীয়)',
};
const statusClass = (status: DeviceStatus) => {
  if (status === 'Whitelisted' || status === 'Registered') return 'is-approved';
  if (status === 'Greylisted' || status === 'Registration Pending') return 'is-warning';
  if (status === 'Blacklisted' || status === 'Restricted (demo)') return 'is-danger';
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
  const [statusOverrides, setStatusOverrides] = useState<Record<string, DeviceStatus>>({});
  const [detail, setDetail] = useState<Device | null>(null);
  const [stolenTarget, setStolenTarget] = useState<Device | null>(null);
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

  useEffect(() => { setProfileName(session.name); setProfileDraft(session.name); }, [session.name]);
  useEffect(() => {
    if (!session.specialToken) { setSpecialApplications([]); return; }
    let active = true;
    listCitizenSpecialRegistrations(session.specialToken).then(records => {
      if (active) { setSpecialApplications(records); setApplicationError(''); }
    }).catch(error => { if (active) setApplicationError(error instanceof Error ? error.message : 'Unable to load applications.'); });
    return () => { active = false; };
  }, [session.specialToken, result]);
  const refreshApplications = async () => {
    if (!session.specialToken) return;
    try { setSpecialApplications(await listCitizenSpecialRegistrations(session.specialToken)); setApplicationError(''); }
    catch (error) { setApplicationError(error instanceof Error ? error.message : 'Unable to load applications.'); }
  };

  // Homepage and My Profile share the same progressive registration modal.
  useEffect(() => {
    if (registrationTrigger === null) { observedRegistrationTrigger.current = null; return; }
    if (registrationOnly && registrationTrigger !== observedRegistrationTrigger.current) {
      observedRegistrationTrigger.current = registrationTrigger;
      setResult('');
      setWizard({ source: 'home', imei: '' });
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
      : statusOverrides[originalDevice.imei] ?? originalDevice.status,
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
    setResult(''); setDetail(null);
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
      : 'Profile name updated for this page only. No server changes were made.');
  };
  const statusLabel = (status: DeviceStatus) => isBn ? (bnStatus[status] ?? status) : status;
  const note = isBn
    ? 'শুধু রেফারেন্স তথ্য দেখানো হচ্ছে। এটি সরকারি NEIR ডাটাবেজের সরাসরি যাচাই নয়।'
    : 'Reference records only. This is not a live government NEIR status check.';
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
        <section className="neir-profile-identity" aria-labelledby="neir-profile-title">
          <span className="neir-profile-avatar" role="img" aria-label={isBn ? 'প্রোফাইল ছবির স্থান' : 'Profile photo placeholder'}>
            <UserRound size={40} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <div className="neir-profile-identity-copy">
            <p className="neir-profile-eyebrow">{isBn ? 'আমার প্রোফাইল' : 'My Profile'}</p>
            <h1 id="neir-profile-title">{profileName}</h1>
            <div className="neir-profile-contact">
              {session.mobile && <span><Phone size={16} aria-hidden="true" /> {session.mobile}</span>}
              {session.email && !session.email.endsWith('.invalid') && <span><Mail size={16} aria-hidden="true" /> {session.email}</span>}
            </div>
          </div>
          <button type="button" className="neir-profile-edit" onClick={editProfile}>
            {isBn ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile Informations'}
          </button>
        </section>

        <section className="neir-profile-search-panel" aria-labelledby="neir-device-search-title">
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
              <button className="neir-profile-search-button" type="submit" disabled={!imeiQuery.trim()}>
                <Search size={18} aria-hidden="true" />
                {isBn ? 'খুঁজুন' : 'Search device'}
              </button>
            </div>
            {searchError && <p id="neir-profile-search-error" className="neir-profile-search-error" role="alert">{searchError}</p>}
          </form>

          <div className="neir-profile-search-outcome" aria-live="polite">
            {searchedImei === null ? <div className="neir-profile-empty-state">
              <span className="neir-profile-empty-icon"><FileSearch2 size={32} aria-hidden="true" /></span>
              <h3>{isBn ? 'এখানে আপনার ডিভাইসের তথ্য দেখা যাবে' : 'Your device information will appear here'}</h3>
              <p>{isBn ? 'উপরের অনুসন্ধান বক্সে IMEI নম্বর লিখে খুঁজুন।' : 'Enter an IMEI number above to view its details and status.'}</p>
            </div> : matchedDevice ? <article className="neir-profile-device-result" aria-label={isBn ? 'ডিভাইসের অনুসন্ধান ফলাফল' : 'Device search result'}>
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
                  <button type="button" className="neir-profile-primary-action"
                    onClick={() => startProfileRegistration(matchedDevice.imei)}>
                    {isBn ? 'বিশেষ নিবন্ধনের আবেদন করুন' : 'Apply for Special Registration'}
                  </button>}
                <button type="button" className="neir-profile-secondary-action" onClick={() => setDetail(matchedDevice)}>
                  <Info size={17} aria-hidden="true" /> {isBn ? 'বিস্তারিত দেখুন' : 'View details'}
                </button>
                <button type="button" className="neir-profile-secondary-action" onClick={() => setStolenTarget(matchedDevice)}>
                  {isBn ? 'হারানো / চুরি রিপোর্ট' : 'Mark as Stolen'}
                </button>
              </div>
            </article> : <div className="neir-profile-empty-state neir-profile-no-match">
              <span className="neir-profile-empty-icon"><FileSearch2 size={32} aria-hidden="true" /></span>
              <h3>{isBn ? 'রেফারেন্স তথ্যে IMEI পাওয়া যায়নি' : 'No matching device in reference records'}</h3>
              <p>{isBn
                ? 'এই নম্বরের অবস্থা যাচাই করা যায়নি। অজানা IMEI-কে হোয়াইটলিস্টেড বা গ্রেলিস্টেড ধরা হচ্ছে না।'
                : 'We could not verify this IMEI from the available reference records. An unknown IMEI is not classified as whitelisted or greylisted.'}</p>
              <p className="neir-profile-unmatched-imei">IMEI: {searchedImei}</p>
            </div>}
          </div>
          <p className="neir-profile-data-note">{note}</p>
          {applicationError && <p role="alert" className="neir-profile-search-error">{applicationError}
            <button type="button" className="neir-profile-retry" onClick={refreshApplications}>Retry</button></p>}
          {result && <p role="status" className="neir-profile-feedback">{result}</p>}
        </section>
        {specialApplications.length > 0 && <section className="neir-special-applications" aria-labelledby="neir-special-applications-title">
          <div className="neir-special-table-heading">
            <h2 id="neir-special-applications-title">{isBn ? 'বিশেষ নিবন্ধনের আবেদন' : 'Special Registration applications'} ({specialApplications.length})</h2>
            <button type="button" className="neir-profile-secondary-action" onClick={refreshApplications}>{isBn ? 'হালনাগাদ' : 'Refresh status'}</button>
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
            emptyText={isBn ? 'কোনো আবেদন পাওয়া যায়নি' : 'No matching applications'}
          />
        </section>}
      </div>
    </section>}

    {detail && <NeirModalFrame title={isBn ? 'IMEI বিস্তারিত' : 'IMEI Details'} ariaLabel="IMEI details" size="medium" closeLabel="Close details"
      onClose={() => setDetail(null)} footer={requiresSpecialRegistration(detail.status) ?
      <UiButton variant="secondary" className="neir-shared-button" onClick={() => startProfileRegistration(detail.imei)}>Special Registration</UiButton> : undefined}>
      <dl className="neir-shared-kv"><dt>IMEI Number</dt><dd>{detail.imei}</dd>
        {detail.brand && <><dt>Brand</dt><dd>{detail.brand}</dd></>}
        {detail.model && <><dt>Model</dt><dd>{detail.model}</dd></>}
        <dt>Device Status</dt><dd>{statusLabel(detail.status)}</dd></dl>
      <p className="neir-shared-note" style={{ marginTop: 16 }}>{note}</p>
    </NeirModalFrame>}
    {stolenTarget && <NeirModalFrame title="Mark as Stolen" ariaLabel="Mark IMEI as stolen" role="alertdialog" size="compact"
      closeLabel="Close stolen status confirmation" onClose={() => setStolenTarget(null)} footer={<>
      <UiButton variant="quiet" className="neir-shared-button neir-shared-button--text" onClick={() => setStolenTarget(null)}>Cancel</UiButton>
      <UiButton variant="danger" className="neir-shared-button neir-shared-button--danger" onClick={() => {
        setStatusOverrides(previous => ({ ...previous, [stolenTarget.imei]: 'Restricted (demo)' }));
        setStolenTarget(null);
        setResult('Local-only status updated. No device was reported to NEIR.');
      }}>Confirm demo action</UiButton>
    </>}>
      <p>This changes only the sample status for IMEI <strong>{stolenTarget.imei}</strong>. It does not report a device to BTRC.</p>
    </NeirModalFrame>}
    {profileOpen && <NeirModalFrame title="Edit Profile Informations" ariaLabel="Edit profile information" size="compact"
      closeLabel="Close profile" onClose={() => setProfileOpen(false)}
      footer={<UiButton variant="secondary" className="neir-shared-button" onClick={saveProfile}>Save demo changes</UiButton>}>
      <label className="block text-sm" htmlFor="neir-profile-name-field">Full Name</label>
      <UiInput id="neir-profile-name-field" className="neir-shared-field" value={profileDraft}
        onChange={event => { setProfileDraft(event.target.value); setProfileError(''); }} />
      {profileError && <p role="alert" className="neir-profile-search-error">{profileError}</p>}
      <p className="neir-shared-note" style={{ marginTop: 14 }}>This updates the profile name locally for this page; no identity data is updated on a server.</p>
    </NeirModalFrame>}
    {applicationDetail && <NeirModalFrame title="Special Registration details" ariaLabel="Special Registration details" size="medium" onClose={() => setApplicationDetail(null)}>
      <dl className="neir-shared-kv"><dt>Reference</dt><dd>{applicationDetail.id}</dd><dt>IMEI</dt><dd>{applicationDetail.imei}</dd><dt>Status</dt><dd>{applicationDetail.status}</dd><dt>Applied on</dt><dd>{applicationDetail.appliedAt ? new Date(applicationDetail.appliedAt).toLocaleString() : '—'}</dd><dt>Arrival date</dt><dd>{applicationDetail.arrivalDate}</dd><dt>Remarks</dt><dd>{applicationDetail.remarks || '—'}</dd></dl>
    </NeirModalFrame>}
    {wizard && <ProfileSpecialRegistrationModal specialToken={session.specialToken} initialImei={wizard.imei}
      onClose={() => setWizard(null)} onComplete={completeRegistration} />}
  </>;
};
