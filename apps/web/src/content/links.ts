export interface ContactLink {
  label: string;
  href: string;
}

/** Public profiles only. A personal email address stays off the site. */
export const CONTACT_LINKS: ContactLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/gabriel-diem' },
  { label: 'GitHub', href: 'https://github.com/gabrieldiem' },
  { label: 'dev.to', href: 'https://dev.to/gabrieldiem' },
];
