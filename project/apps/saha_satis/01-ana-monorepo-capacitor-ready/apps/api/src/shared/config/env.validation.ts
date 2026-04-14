const REQUIRED_ENV_KEYS = ["AUTH_TOKEN_SECRET"] as const;

export function validateEnv(env: NodeJS.ProcessEnv): void {
  const missingKeys = REQUIRED_ENV_KEYS.filter((key) => !env[key]?.trim());

  if (missingKeys.length > 0) {
    throw new Error(`Eksik ortam değişkenleri: ${missingKeys.join(", ")}`);
  }
}
