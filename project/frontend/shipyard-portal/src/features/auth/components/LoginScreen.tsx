import { useState, type FormEvent } from "react";
import { tenantConfig } from "../../../config/tenant";

type LoginScreenProps = {
  isSubmitting: boolean;
  errorMessage: string | null;
  onLogin: (username: string, password: string) => Promise<boolean>;
};

export function LoginScreen({ isSubmitting, errorMessage, onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setLocalError("Kullanici adi ve sifre zorunludur.");
      return;
    }

    const success = await onLogin(normalizedUsername, password);
    if (!success) {
      setLocalError("Giris basarisiz. Bilgileri kontrol edip tekrar deneyin.");
    }
  }

  return (
    <div className="auth-screen">
      <section className="auth-card" aria-label="Kullanici girisi">
        <header className="auth-card__header">
          <p className="eyebrow">ERPNext Baglantili Giris</p>
          <h1>{tenantConfig.productName}</h1>
          <p>Devam etmek icin ERPNext kullanici adi ve sifrenizle giris yapin.</p>
        </header>

        {errorMessage ? <div className="auth-card__error">{errorMessage}</div> : null}
        {localError ? <div className="auth-card__error">{localError}</div> : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-form__field">
            <span>Kullanici Adi</span>
            <input
              autoComplete="username"
              disabled={isSubmitting}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="kullanici@firma.com"
              type="text"
              value={username}
            />
          </label>

          <label className="auth-form__field">
            <span>Sifre</span>
            <input
              autoComplete="current-password"
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sifrenizi girin"
              type="password"
              value={password}
            />
          </label>

          <button className="auth-form__submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Giris yapiliyor..." : "Giris Yap"}
          </button>
        </form>
      </section>
    </div>
  );
}
