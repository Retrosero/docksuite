export type SessionUser = {
  fullName: string
  roleLabel: string
}

export async function getSessionUser(): Promise<SessionUser> {
  return {
    fullName: 'Demo Kullanici',
    roleLabel: 'Muhasebe Sorumlusu',
  }
}
