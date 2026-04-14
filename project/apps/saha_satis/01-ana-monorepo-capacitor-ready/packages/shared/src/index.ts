export function assertTenant(tenantId: string): string {
  if (!tenantId?.trim()) {
    throw new Error("Tenant kimliği zorunludur.");
  }
  return tenantId;
}
