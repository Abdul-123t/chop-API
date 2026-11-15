export interface TabDefinition {
  title: string;
  headers: readonly string[];
}

export const CUSTOMER_TAB: TabDefinition = {
  title: 'Customer Waitlist',
  headers: [
    'Registration ID',
    'Submission date and time',
    'First name',
    'WhatsApp number',
    'Email',
    'Launch location',
    'Preferred food categories',
    'Contact consent',
    'Consent timestamp',
    'Registration status',
  ],
};

export const VENDOR_TAB: TabDefinition = {
  title: 'Vendor Applications',
  headers: [
    'Application ID',
    'Submission date and time',
    'Business name',
    'Contact person',
    'WhatsApp number',
    'Email',
    'Business category',
    'Other category',
    'Operating model',
    'Operating locations',
    'Business description',
    'Food categories',
    'Fulfilment options',
    'Social media link',
    'Additional comments',
    'Contact consent',
    'Application status',
    'Admin notes',
    'Review date',
  ],
};

export const PREFERENCES_TAB: TabDefinition = {
  title: 'Email Preferences',
  headers: ['Email', 'Status', 'Updated at', 'Source'],
};

export const NEWSLETTER_LOG_TAB: TabDefinition = {
  title: 'Newsletter Log',
  headers: ['Newsletter ID', 'Sent at', 'Subject', 'Audience', 'Recipients', 'Delivered', 'Failed'],
};

export function columnLetter(index: number): string {
  let value = index;
  let letters = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    value = Math.floor((value - 1) / 26);
  }
  return letters;
}

export function tabRange(tab: TabDefinition, fromRow = 1): string {
  return `'${tab.title}'!A${fromRow}:${columnLetter(tab.headers.length)}`;
}
