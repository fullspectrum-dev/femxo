import axe from "axe-core";

/**
 * Accessibility violations inside a rendered component. "region" is off
 * because a lone component isn't a whole page; colour contrast can't be
 * measured in jsdom (no layout), so tokens.test.ts covers it instead.
 */
export async function axeViolations(container: Element) {
  const results = await axe.run(container, { rules: { region: { enabled: false }, "color-contrast": { enabled: false } } });
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}
