// Boutique côté navigateur : affichage TTC / HT, panier, calculateur, visionneuse, formulaires.
// Le panier vit dans le navigateur du visiteur (localStorage) ; les prix sont recalculés par le serveur à la commande.

type Prod = { id: string; name: string; unitHT: number | null; tier: { min: number; unitHT: number } | null; url: string; img: string | null };
type Line = { id: string; qty: number };
const DATA = JSON.parse(document.getElementById('shop-data')!.textContent || '{}') as { base: string; tva: number; preview: boolean; products: Prod[] };
const P = Object.fromEntries(DATA.products.map((p) => [p.id, p])) as Record<string, Prod>;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const fmt = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const ttc = (ht: number) => Math.round(ht * (1 + DATA.tva) * 100) / 100;
const store = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* navigation privée */ } },
};
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const todo = (s: string) => `<span class="todo">${s}</span>`;

/* ---------- Particulier (TTC) / Professionnel (HT) ---------- */
let mode: 'part' | 'pro' = store.get('serepi-mode', 'part');
function setMode(m: 'part' | 'pro') {
  mode = m; store.set('serepi-mode', m);
  document.documentElement.dataset.mode = m;
  $$('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  $$<HTMLInputElement>('input[name="client"]').forEach((i) => (i.checked = i.value === m));
  renderPrices(); renderCart(); renderCalc(); renderCheckout();
}
function priceText(ht: number, per?: string) { return mode === 'pro' ? `${fmt(ht)} HT${per ? ' · ' + per : ''}` : `${fmt(ttc(ht))} TTC${per ? ' · ' + per : ''}`; }
function altText(ht: number) { return mode === 'pro' ? `soit ${fmt(ttc(ht))} TTC` : `soit ${fmt(ht)} HT`; }
function renderPrices() {
  $$('[data-ht]').forEach((el) => { el.textContent = priceText(Number(el.dataset.ht), el.dataset.per); });
  $$('[data-ht-alt]').forEach((el) => { el.textContent = altText(Number(el.dataset.htAlt)); });
  $$('[data-ht-short]').forEach((el) => { const ht = Number(el.dataset.htShort); el.textContent = mode === 'pro' ? `${fmt(ht)} HT` : `${fmt(ttc(ht))} TTC`; });
  $$('[data-buy][data-tier-for]').forEach(lineTotal);
}
function lineTotal(buy: HTMLElement) {
  const id = buy.dataset.tierFor!; const inp = $<HTMLInputElement>('.qty input', buy); const el = $('[data-line-total]', buy);
  if (!inp || !el || !P[id]) return;
  const q = Math.max(1, Number(inp.value) || 1); const u = unit(id, q);
  el.textContent = `${q} × ${mode === 'pro' ? fmt(u) + ' HT' : fmt(ttc(u)) + ' TTC'} = ${mode === 'pro' ? fmt(u * q) + ' HT' : fmt(ttc(u * q)) + ' TTC'}`;
}

/* ---------- Panier ---------- */
let cart: Line[] = store.get<Line[]>('serepi-cart', []).filter((l) => P[l.id] && P[l.id].unitHT != null && l.qty > 0);
const unit = (id: string, qty: number) => { const p = P[id]; return p.tier && qty >= p.tier.min ? p.tier.unitHT : (p.unitHT ?? 0); };
const totals = () => { const ht = Math.round(cart.reduce((s, l) => s + unit(l.id, l.qty) * l.qty, 0) * 100) / 100; const t = ttc(ht); return { ht, tva: Math.round((t - ht) * 100) / 100, ttc: t, n: cart.reduce((s, l) => s + l.qty, 0) }; };
function save() { store.set('serepi-cart', cart); renderCart(); renderCheckout(); }
function add(id: string, qty: number) {
  if (!P[id] || P[id].unitHT == null || !(qty > 0)) return;
  const l = cart.find((x) => x.id === id); if (l) l.qty += qty; else cart.push({ id, qty });
  save();
}
function setQty(id: string, qty: number) { cart = cart.map((l) => (l.id === id ? { ...l, qty: Math.max(0, Math.min(999, Math.round(qty))) } : l)).filter((l) => l.qty > 0); save(); }
function nudge(): string {
  const t = cart.find((l) => l.id === 'tuile'); const p = P.tuile;
  if (!t || !p?.tier || t.qty >= p.tier.min) return t && p?.tier ? `<p class="nudge">Prix dégressif appliqué : <b>${mode === 'pro' ? fmt(p.tier.unitHT) + ' HT' : fmt(ttc(p.tier.unitHT)) + ' TTC'}</b> la tuile dès ${p.tier.min} tuiles.</p>` : '';
  const miss = p.tier.min - t.qty;
  return `<p class="nudge">Plus que <b>${miss} tuile${miss > 1 ? 's' : ''}</b> pour passer à ${mode === 'pro' ? fmt(p.tier.unitHT) + ' HT' : fmt(ttc(p.tier.unitHT)) + ' TTC'} la tuile (au lieu de ${mode === 'pro' ? fmt(p.unitHT!) + ' HT' : fmt(ttc(p.unitHT!)) + ' TTC'}). <button type="button" class="rm" data-cart-fill>Passer à ${p.tier.min} tuiles</button></p>`;
}
function linesHTML(): string {
  if (!cart.length) return `<p class="empty">Votre panier est vide. <a href="${DATA.base}tuiles-de-chaume/">Voir les tuiles de chaume</a></p>`;
  return cart.map((l) => { const p = P[l.id]; const u = unit(l.id, l.qty);
    return `<div class="cline">${p.img ? `<img src="${p.img}" alt="" width="64" height="80">` : '<span></span>'}<div><div class="nm"><a href="${p.url}">${esc(p.name)}</a></div><div class="pu">${mode === 'pro' ? fmt(u) + ' HT' : fmt(ttc(u)) + ' TTC'} l’unité</div><button type="button" class="rm" data-cart-rm="${l.id}">Retirer</button></div><div class="qty" data-line="${l.id}"><button type="button" data-cq="-1" aria-label="Retirer une unité">−</button><input type="number" min="0" max="999" value="${l.qty}" aria-label="Quantité" inputmode="numeric"><button type="button" data-cq="1" aria-label="Ajouter une unité">+</button></div></div>`; }).join('') + nudge();
}
function totalsHTML(): string {
  const t = totals(); if (!t.n) return '';
  const main = mode === 'pro'
    ? `<div class="sumline"><span>Total HT</span><b>${fmt(t.ht)}</b></div><div class="sumline small muted"><span>TVA 20 %</span><span>${fmt(t.tva)}</span></div><div class="sumline big"><span>Total TTC</span><span>${fmt(t.ttc)}</span></div>`
    : `<div class="sumline big"><span>Total TTC</span><span>${fmt(t.ttc)}</span></div><div class="sumline small muted"><span>dont TVA 20 %</span><span>${fmt(t.tva)}</span></div>`;
  return main + `<div class="sumline small"><span>Livraison</span><span>${todo('[À VALIDER : grille de frais de port]')}</span></div><p class="small muted">Expédition sous 8 jours sur palette filmée.</p>`;
}
function renderCart() {
  const t = totals();
  $$('[data-cart-count]').forEach((el) => { el.textContent = String(t.n); el.dataset.n = String(t.n); });
  $$('[data-cart-lines]').forEach((el) => (el.innerHTML = linesHTML()));
  $$('[data-cart-totals]').forEach((el) => (el.innerHTML = totalsHTML()));
  $$<HTMLAnchorElement>('[data-cart-go]').forEach((a) => a.toggleAttribute('hidden', !t.n));
}
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const rm = t.closest<HTMLElement>('[data-cart-rm]'); if (rm) return setQty(rm.dataset.cartRm!, 0);
  const cq = t.closest<HTMLElement>('[data-cq]'); if (cq) { const id = cq.closest<HTMLElement>('[data-line]')!.dataset.line!; const l = cart.find((x) => x.id === id); if (l) setQty(id, l.qty + Number(cq.dataset.cq)); return; }
  if (t.closest('[data-cart-fill]')) { const l = cart.find((x) => x.id === 'tuile'); if (l && P.tuile.tier) setQty('tuile', P.tuile.tier.min); return; }
  const addBtn = t.closest<HTMLElement>('[data-add]');
  if (addBtn) {
    const box = addBtn.closest('[data-buy]') || addBtn.parentElement!;
    const inp = $<HTMLInputElement>('.qty input', box);
    add(addBtn.dataset.add!, inp ? Math.max(1, Number(inp.value) || 1) : 1);
    const msg = $('[data-added]', box); if (msg) msg.textContent = 'Ajouté au panier.';
    openCart(); return;
  }
  const step = t.closest<HTMLElement>('[data-step]');
  if (step) { const inp = $<HTMLInputElement>('input', step.closest('.qty')!)!; inp.value = String(Math.max(1, (Number(inp.value) || 1) + Number(step.dataset.step))); inp.dispatchEvent(new Event('input', { bubbles: true })); return; }
  const m = t.closest<HTMLElement>('[data-mode]'); if (m) return setMode(m.dataset.mode as 'part' | 'pro');
  if (t.closest('[data-open-cart]')) return openCart();
  if (t.closest('[data-close-cart]') || t.matches('[data-drawer]')) return closeCart();
  if (t.closest('[data-open-menu]')) { $('#mnav')!.hidden = false; $('[data-open-menu]')!.setAttribute('aria-expanded', 'true'); return; }
  if (t.closest('[data-close-menu]') || t.closest('#mnav a')) { $('#mnav')!.hidden = true; $('[data-open-menu]')?.setAttribute('aria-expanded', 'false'); }
});
document.addEventListener('change', (e) => {
  const inp = e.target as HTMLInputElement;
  const line = inp.closest<HTMLElement>('[data-line]'); if (line) setQty(line.dataset.line!, Number(inp.value) || 0);
});
document.addEventListener('input', (e) => {
  const inp = e.target as HTMLInputElement;
  const buy = inp.closest<HTMLElement>('[data-buy]');
  if (buy && buy.dataset.tierFor) lineTotal(buy);
});
const drawer = $<HTMLElement>('[data-drawer]');
function openCart() { if (drawer) { renderCart(); drawer.hidden = false; $<HTMLButtonElement>('[data-close-cart]', drawer)?.focus(); } }
function closeCart() { if (drawer) drawer.hidden = true; }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCart(); closeLb(); const mn = $('#mnav'); if (mn) mn.hidden = true; } });

/* ---------- En-tête transparent sur l'accueil ---------- */
// Barre compacte (symbole seul) une fois l'en-tête principal sorti de l'écran.
const hdr = $('[data-hdr]'); const mini = $('[data-hdr-mini]');
if (hdr && mini) {
  const f = () => { const on = hdr.getBoundingClientRect().bottom < 0; mini.classList.toggle('show', on); mini.setAttribute('aria-hidden', String(!on)); $$('a,button', mini).forEach((el) => (on ? el.removeAttribute('tabindex') : el.setAttribute('tabindex', '-1'))); };
  f(); window.addEventListener('scroll', f, { passive: true });
}

/* ---------- Calculateur ---------- */
type Model = { id: string; name: string; tiles: number | null; cones: number };
function renderCalc() {
  $$('[data-calc]').forEach((root) => {
    const models = JSON.parse(root.dataset.calc || '[]') as Model[];
    const st = root as HTMLElement & { _s?: { mode: string; model: string } };
    st._s ||= { mode: 'model', model: 'bora' };
    const s = st._s;
    $$('[data-calc-mode]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.calcMode === s.mode)));
    $$('[data-calc-model]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.calcModel === s.model)));
    $('[data-calc-pane="model"]', root)!.hidden = s.mode !== 'model';
    $('[data-calc-pane="surface"]', root)!.hidden = s.mode !== 'surface';
    const coneBox = $<HTMLInputElement>('[data-calc-cone]', root)!;
    let tiles: number | null = null; let cones = coneBox.checked ? 1 : 0; let note = '';
    if (s.mode === 'model') {
      const m = models.find((x) => x.id === s.model);
      if (m && m.tiles) { tiles = m.tiles; note = `${m.name} : ${m.tiles} tuiles et ${m.cones} cône de faîtage.`; }
      else note = m ? `${m.name} : ${todo('[À COMPLÉTER : nombre de tuiles]')} Envoyez-nous une demande, nous vous indiquons la quantité.` : 'Autre modèle : indiquez la surface de toiture, ou envoyez-nous une photo avec une demande de devis.';
    } else {
      const v = Number(($<HTMLInputElement>('[data-calc-surface]', root)!).value.replace(',', '.'));
      if (v > 0) { tiles = Math.ceil(v * 4); note = `${v.toLocaleString('fr-FR')} m² × 4 tuiles par m² = ${tiles} tuiles ${todo('[À VALIDER : règle]')}`; } else note = 'Indiquez une surface supérieure à 0 m².';
    }
    const out = $('[data-calc-out]', root)!;
    const cone = P.cone; const tile = P.tuile;
    if (!tiles && !cones) { out.innerHTML = `<p class="small">${note}</p>`; root.dataset.ready = ''; return; }
    const tu = tiles ? unit('tuile', tiles) : 0;
    const ht = (tiles ? tu * tiles : 0) + (cones ? (cone.unitHT ?? 0) * cones : 0);
    const show = (n: number) => (mode === 'pro' ? fmt(n) + ' HT' : fmt(ttc(n)) + ' TTC');
    out.innerHTML = `<p class="small">${note}</p>` +
      (tiles ? `<div class="line"><span>${tiles} tuile${tiles > 1 ? 's' : ''} standard × ${show(tu)}</span><b>${show(tu * tiles)}</b></div>` : '') +
      (tiles && tile.tier && tiles < tile.tier.min ? `<p class="nudge">Dès ${tile.tier.min} tuiles : ${show(tile.tier.unitHT)} la tuile.</p>` : '') +
      (tiles && tile.tier && tiles >= tile.tier.min ? `<p class="nudge">Prix dégressif appliqué dès ${tile.tier.min} tuiles.</p>` : '') +
      (cones ? `<div class="line"><span>${cones} cône de faîtage Ø 85 cm</span><b>${show((cone.unitHT ?? 0) * cones)}</b></div>` : '') +
      `<div class="line total"><span>Total ${mode === 'pro' ? 'HT' : 'TTC'}</span><b>${show(ht)}</b></div><p class="small muted">${mode === 'pro' ? 'soit ' + fmt(ttc(ht)) + ' TTC' : 'soit ' + fmt(ht) + ' HT'}, livraison en sus ${todo('[À VALIDER : grille]')}</p>`;
    root.dataset.tiles = String(tiles || 0); root.dataset.cones = String(cones); root.dataset.ready = '1';
  });
}
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement; const root = t.closest<HTMLElement & { _s?: { mode: string; model: string } }>('[data-calc]'); if (!root) return;
  const m = t.closest<HTMLElement>('[data-calc-mode]'); if (m) { root._s!.mode = m.dataset.calcMode!; renderCalc(); }
  const md = t.closest<HTMLElement>('[data-calc-model]'); if (md) { root._s!.model = md.dataset.calcModel!; renderCalc(); }
  if (t.closest('[data-calc-add]')) { const n = Number(root.dataset.tiles || 0), c = Number(root.dataset.cones || 0); if (n) add('tuile', n); if (c) add('cone', c); if (n || c) openCart(); }
});
document.addEventListener('input', (e) => { if ((e.target as HTMLElement).closest('[data-calc]')) renderCalc(); });

/* ---------- Visionneuse photos ---------- */
const lb = $<HTMLElement>('[data-lb]'); let lbItems: HTMLElement[] = []; let lbI = 0;
function showLb(i: number) { if (!lb || !lbItems.length) return; lbI = (i + lbItems.length) % lbItems.length; const it = lbItems[lbI]; const img = $<HTMLImageElement>('[data-lb-img]', lb)!; img.src = it.dataset.full!; img.alt = it.dataset.cap || ''; $('[data-lb-cap]', lb)!.innerHTML = it.dataset.capHtml || esc(it.dataset.cap || ''); }
function closeLb() { if (lb) lb.hidden = true; }
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement; const cell = t.closest<HTMLElement>('[data-full]');
  if (cell && lb) { lbItems = $$('[data-full]', cell.closest('[data-lb-group]') || document); showLb(lbItems.indexOf(cell)); lb.hidden = false; return; }
  if (t.closest('[data-lb-prev]')) showLb(lbI - 1); else if (t.closest('[data-lb-next]')) showLb(lbI + 1); else if (t.closest('[data-lb-close]') || t.matches('[data-lb]')) closeLb();
});
document.addEventListener('keydown', (e) => { if (lb && !lb.hidden) { if (e.key === 'ArrowLeft') showLb(lbI - 1); if (e.key === 'ArrowRight') showLb(lbI + 1); } });

/* ---------- Formulaires (devis, contact) ---------- */
$$<HTMLFormElement>('form[data-form]').forEach((f) => {
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('[data-err]', f)!; const ok = $('[data-ok]', f.parentElement!)!;
    err.textContent = '';
    if (!f.checkValidity()) { err.textContent = 'Merci de compléter les champs obligatoires.'; f.reportValidity(); return; }
    const btn = $<HTMLButtonElement>('button[type="submit"]', f)!; btn.disabled = true;
    try {
      if (!DATA.preview) { const r = await fetch(f.action, { method: 'POST', body: new FormData(f) }); if (!r.ok) throw new Error(String(r.status)); }
      f.hidden = true; ok.hidden = false; ok.scrollIntoView({ block: 'center' });
    } catch { err.textContent = 'L’envoi n’a pas abouti. Appelez-nous ou réessayez dans un instant.'; btn.disabled = false; }
  });
});

/* ---------- Page panier et commande ---------- */
function renderCheckout() {
  const page = $('[data-cart-page]'); if (!page) return;
  const t = totals();
  $$('[data-pro-only]').forEach((el) => { el.hidden = mode !== 'pro'; $$<HTMLInputElement>('input,select', el).forEach((i) => (i.required = mode === 'pro' && i.dataset.req === '1')); });
  const form = $<HTMLFormElement>('[data-checkout]'); if (form && !form.dataset.sent) form.hidden = !t.n;
  $$('[data-empty-msg]').forEach((el) => (el.hidden = t.n > 0));
}
const co = $<HTMLFormElement>('[data-checkout]');
co?.addEventListener('change', (e) => { const i = e.target as HTMLInputElement; if (i.name === 'client') setMode(i.value as 'part' | 'pro'); });
co?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('[data-err]', co)!; err.textContent = '';
  if (!cart.length) { err.textContent = 'Votre panier est vide.'; return; }
  if (!co.checkValidity()) { err.textContent = 'Merci de compléter les champs obligatoires.'; co.reportValidity(); return; }
  const fd = Object.fromEntries(new FormData(co).entries());
  const payload = { client: mode, customer: fd, lines: cart };
  const done = $('[data-done]')!;
  if (DATA.preview) { co.dataset.sent = '1'; co.hidden = true; done.hidden = false; done.innerHTML = `<h2 class="t" style="font-size:22px">Commande de test enregistrée</h2><p>Version de test : aucune commande n’est transmise et aucun paiement n’est demandé.</p><p class="small muted">En production, le paiement par carte s’ouvre sur une page sécurisée ${todo('[À VALIDER : prestataire de paiement]')} ; le virement affiche les coordonnées bancaires ${todo('[À COMPLÉTER : RIB]')}.</p>`; done.scrollIntoView({ block: 'center' }); return; }
  try {
    const r = await fetch(co.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const j = await r.json();
    if (!r.ok || j.error) throw new Error(j.error || 'Erreur');
    if (j.redirect) { location.href = j.redirect; return; }
    co.dataset.sent = '1'; cart = []; save(); co.hidden = true; done.hidden = false; done.innerHTML = j.html || '<p>Commande enregistrée. Un e-mail de confirmation vous a été envoyé.</p>';
  } catch (x) { err.textContent = `La commande n’a pas pu être enregistrée (${(x as Error).message}). Appelez-nous ou réessayez.`; }
});

if (document.querySelector('[data-clear-cart]')) { cart = []; store.set('serepi-cart', cart); }
setMode(mode);
