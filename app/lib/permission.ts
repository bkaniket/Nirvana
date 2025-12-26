type Permissions = {
  [module: string]: string[];
};

export function getPermissions(): Permissions {
  if (typeof window === "undefined") return {};
  const raw = sessionStorage.getItem("permissions");
  return raw ? JSON.parse(raw) : {};
}

export function hasPermission(
  module: string,
  action: string
): boolean {
  const permissions = getPermissions();
  return permissions?.[module]?.includes(action) ?? false;
}
