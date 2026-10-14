// Dynamic elements must inherit the page's Astro scope to receive its styles.
export function getAstroScope(element: Element): string | undefined {
  return Array.from(element.attributes).find((attribute) => attribute.name.startsWith("data-astro-cid-"))?.name;
}

export function getAstroScopeHtml(element: Element): string {
  const scope = getAstroScope(element);
  return scope ? ` ${scope}=""` : "";
}
