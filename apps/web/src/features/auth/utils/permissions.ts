/**
 * Mirrors PERMISSIONS in femxo-backend modules/access/src/permissions.ts, so
 * the account page can say what each permission lets someone do. Unknown
 * names (added to the backend later) are shown by name.
 */
export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  "role.view": "View roles and their permissions",
  "role.manage": "Create, edit, and delete roles",
  "role.assign": "Change which roles a user has",
  "territory.assign": "Change which territories a user covers",
  "territory.view": "View sales territories",
  "territory.manage": "Create, edit, and delete sales territories",
  "user.view": "View users",
  "user.manage": "Create users, edit them, disable them, and reset their passwords",
};

const MODULE_LABELS: Record<string, string> = {
  user: "People",
  role: "Roles",
  territory: "Territories",
};

/** Groups `module.action` names by module, in a stable order. */
export function groupPermissions(permissions: readonly string[]) {
  const groups = new Map<string, string[]>();
  for (const name of [...permissions].sort()) {
    const moduleName = name.split(".")[0] ?? name;
    groups.set(moduleName, [...(groups.get(moduleName) ?? []), name]);
  }
  return [...groups].map(([moduleName, names]) => ({
    label: MODULE_LABELS[moduleName] ?? moduleName,
    permissions: names.map((name) => ({
      name,
      description: PERMISSION_DESCRIPTIONS[name] ?? name,
    })),
  }));
}

const TERRITORY_TYPE_LABELS: Record<string, string> = {
  state: "State",
  district: "District",
  subdivision: "Sub-division",
  block: "Block",
  gram_panchayat: "Gram panchayat",
  village: "Village",
  urban_body: "Urban body",
  sales: "Sales territory",
};

/** "district:230" → "District", "sales:…" → "Sales territory". */
export function territoryTypeLabel(id: string) {
  const type = id.split(":")[0] ?? "";
  return TERRITORY_TYPE_LABELS[type] ?? type;
}
