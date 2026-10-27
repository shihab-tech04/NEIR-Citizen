/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'bn' | 'en';

export type AppRoute = 'home' | 'guides' | 'faq' | 'contact' | 'proposed';

export interface UserSession {
  isLoggedIn: boolean;
  name: string;
  nameBangla: string;
  nid: string;
  mobile: string;
  email: string;
  registeredHandsets: {
    imei: string;
    brand: string;
    model: string;
    registeredOn: string;
    status: 'Active' | 'Under Review' | 'Flagged';
  }[];
}
