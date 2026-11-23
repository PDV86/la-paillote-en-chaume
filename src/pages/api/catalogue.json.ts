// Catalogue servi à l'API de commande (public/api/commande.php) : le serveur recalcule les prix, il ne fait jamais confiance au navigateur.
import { PRODUCTS, TVA, SHIPPING } from '../../data/catalogue';
export const GET = () =>
  new Response(JSON.stringify({ tva: TVA, shippingReady: SHIPPING.ready, products: PRODUCTS.filter((p) => p.unitHT != null).map((p) => ({ id: p.id, name: p.cartName, unitHT: p.unitHT, tier: p.tier ?? null })) }, null, 1), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
