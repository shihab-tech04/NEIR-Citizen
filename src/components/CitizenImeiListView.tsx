import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Info, MoreVertical } from 'lucide-react';
import type { Language, UserSession } from '../types.ts';
import { ProfileSpecialRegistrationModal } from './ProfileSpecialRegistrationModal.tsx';
import { NeirModalFrame } from './NeirModalFrame.tsx';
import './CitizenImeiListView.css';

type DeviceStatus = 'Registered' | 'Applied for registration' | 'Registration Pending' | 'Restricted (demo)';
type Device = { imei: string; status: DeviceStatus };
// Exact prototype device list from NEIR_Special_Registration_Progressive_Modal_v7.html.
// These are display fixtures, NOT records retrieved from BTRC or an identity database.
const referenceDevices: Device[] = [
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

type Props = {
  language: Language;
  session: UserSession;
  registrationOnly?: boolean;
  registrationTrigger?: number | null;
  onRegistrationHandled?: () => void;
  onRegistrationComplete?: (message: string) => void;
};
export const CitizenImeiListView: React.FC<Props> = ({
  session, registrationOnly = false, registrationTrigger = null,
  onRegistrationHandled, onRegistrationComplete,
}) => {
  const [devices, setDevices] = useState<Device[]>(referenceDevices);
  const [actionRow, setActionRow] = useState<string | null>(null);
  const [detail, setDetail] = useState<Device | null>(null);
  const [stolenTarget, setStolenTarget] = useState<Device | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(session.name);
  const [wizard, setWizard] = useState<{ source: 'home' | 'profile'; imei: string } | null>(null);
  const [result, setResult] = useState('');
  const observedRegistrationTrigger = useRef<number | null>(null);

  // Both homepage and My Profile use the same progressive registration modal after authentication.
  useEffect(() => {
    if (registrationTrigger === null) { observedRegistrationTrigger.current = null; return; }
    if (registrationOnly && registrationTrigger !== observedRegistrationTrigger.current) {
      observedRegistrationTrigger.current = registrationTrigger;
      setResult('');
      setWizard({ source: 'home', imei: '' });
      onRegistrationHandled?.();
    }
  }, [registrationOnly, registrationTrigger, onRegistrationHandled]);

  useEffect(() => {
    if (!actionRow) return;
    const close = (event: PointerEvent) => {
      if (!(event.target as Element).closest('.neir-profile-menu-anchor')) setActionRow(null);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setActionRow(null); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, [actionRow]);

  const startProfileRegistration = (imei: string) => {
    setResult(''); setActionRow(null); setDetail(null);
    setWizard({ source: 'profile', imei });
  };
  const completeRegistration = (message: string) => {
    setResult(message);
    onRegistrationComplete?.(message);
  };

  return <>
    {!registrationOnly && <section className="neir-profile-reference" aria-label="Citizen IMEI list">
      <div className="neir-profile-table-wrap">
        <table className="neir-profile-device-table">
          <thead><tr><th scope="col">Sl No.</th><th scope="col">IMEI Number</th><th scope="col">Device Status</th><th scope="col">Actions</th></tr></thead>
          <tbody>{devices.map((device, index) => <tr key={device.imei}>
            <td data-label="Sl No.">{index + 1}</td>
            <td data-label="IMEI Number" className="neir-profile-imei">{device.imei}</td>
            <td data-label="Device Status"><span className={'neir-profile-status neir-profile-status-' + device.status.toLowerCase().replace(/[^a-z]+/g, '-')}>{device.status}</span></td>
            <td data-label="Actions" className="neir-profile-actions-cell">
              <button type="button" className="neir-profile-pill" aria-label={'Details for IMEI ' + device.imei} onClick={() => setDetail(device)}>
                Details <Info size={15} aria-hidden="true" />
              </button>
              <span className="neir-profile-menu-anchor">
                <button type="button" className="neir-profile-pill" aria-label={'Actions for IMEI ' + device.imei}
                  aria-haspopup="menu" aria-expanded={actionRow === device.imei}
                  onClick={() => setActionRow(actionRow === device.imei ? null : device.imei)}>
                  Actions <MoreVertical size={17} aria-hidden="true" />
                </button>
                {actionRow === device.imei && <span className="neir-profile-actions-menu" role="menu" aria-label={'Device actions for ' + device.imei}>
                  {device.status === 'Registration Pending' && <button type="button" role="menuitem" onClick={() => startProfileRegistration(device.imei)}>Special Registration</button>}
                  <button type="button" role="menuitem" onClick={() => { setStolenTarget(device); setActionRow(null); }}>Mark as Stolen</button>
                </span>}
              </span>
            </td>
          </tr>)}</tbody>
        </table>
        <div className="neir-profile-secondary-actions">
          <span>Reference device data only; no live NEIR records have been retrieved.</span>
          <button type="button" onClick={() => setProfileOpen(true)}>Edit Profile Informations</button>
        </div>
        {result && <p role="status" className="neir-profile-feedback">{result}</p>}
      </div>
    </section>}

    {detail && <NeirModalFrame title="IMEI Details" ariaLabel="IMEI details" size="medium" closeLabel="Close details"
      onClose={() => setDetail(null)} footer={detail.status === 'Registration Pending' ?
      <button type="button" className="neir-shared-button" onClick={() => startProfileRegistration(detail.imei)}>Special Registration</button> : undefined}>
      <dl className="neir-shared-kv"><dt>IMEI Number</dt><dd>{detail.imei}</dd><dt>Device Status</dt><dd>{detail.status}</dd></dl>
      <p className="neir-shared-note" style={{ marginTop: 16 }}>Reference data only. No government record has been retrieved.</p>
    </NeirModalFrame>}
    {stolenTarget && <NeirModalFrame title="Mark as Stolen" ariaLabel="Mark IMEI as stolen" role="alertdialog" size="compact"
      closeLabel="Close stolen status confirmation" onClose={() => setStolenTarget(null)} footer={<>
      <button type="button" className="neir-shared-button neir-shared-button--text" onClick={() => setStolenTarget(null)}>Cancel</button>
      <button type="button" className="neir-shared-button neir-shared-button--danger" onClick={() => {
        setDevices(previous => previous.map(item => item.imei === stolenTarget.imei ? { ...item, status: 'Restricted (demo)' } : item));
        setStolenTarget(null); setResult('Local-only status updated. No device was reported to NEIR.');
      }}>Confirm demo action</button>
    </>}>
      <p>This changes only the sample status for IMEI <strong>{stolenTarget.imei}</strong>. It does not report a device to BTRC.</p>
    </NeirModalFrame>}
    {profileOpen && <NeirModalFrame title="Edit Profile Informations" ariaLabel="Edit profile information" size="compact"
      closeLabel="Close profile" onClose={() => setProfileOpen(false)} footer={<button type="button" className="neir-shared-button" onClick={() => setProfileOpen(false)}>Save demo changes</button>}>
      <label className="block text-sm" htmlFor="neir-profile-name-field">Full Name</label>
      <input id="neir-profile-name-field" className="neir-shared-field" value={profileName} onChange={event => setProfileName(event.target.value)} />
      <p className="neir-shared-note" style={{ marginTop: 14 }}>Demonstration-only profile label. No identity data is updated on a server.</p>
    </NeirModalFrame>}
    {wizard && <ProfileSpecialRegistrationModal initialImei={wizard.imei}
      onClose={() => setWizard(null)} onComplete={completeRegistration} />}
  </>;
};