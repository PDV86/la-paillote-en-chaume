// Liens internes compatibles avec un sous-dossier (préversion GitHub Pages : /la-paillote-en-chaume/).
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
export const u = (path: string) => (path.startsWith('http') || path.startsWith('#') || path.startsWith('tel:') || path.startsWith('mailto:') ? path : BASE + path);
export const PREVIEW = import.meta.env.PREVIEW === '1' || process.env.PREVIEW === '1';
// Notices PDF : conservées à la même adresse (/pics/…) lors de la bascule ; en préversion, servies par le site actuel.
export const PDF_BASE = process.env.PDF_BASE || '';
export const pdf = (file: string) => (PDF_BASE ? `${PDF_BASE}/pics/${file}` : u(`/pics/${file}`));
