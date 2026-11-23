// Les mentions « [À VALIDER : …] » / « [À COMPLÉTER : …] » deviennent des étiquettes jaunes visibles sur le site de test.
export const rich = (s: string) => s.replace(/\[(À (?:VALIDER|COMPLÉTER)[^\]]*)\]/g, '<span class="todo">[$1]</span>');
export const plain = (s: string) => s.replace(/\s*\[À (?:VALIDER|COMPLÉTER)[^\]]*\]/g, '').replace(/<[^>]+>/g, '').trim();
