import { useEffect, useState } from "react";
import type { CreateAdminUserInput, UserAccessContext } from "../types";
import { createAdminUser, fetchUserAccessContext, setUserEnabled, updateUserRoles } from "../services/userAccessService";

const INITIAL_ADMIN_FORM: CreateAdminUserInput = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

export function UserAccessScreen() {
  const [context, setContext] = useState<UserAccessContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState<CreateAdminUserInput>(INITIAL_ADMIN_FORM);
  const [pendingRoles, setPendingRoles] = useState<Record<string, string[]>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchUserAccessContext();
      setContext(next);
      setPendingRoles(
        next.users.reduce<Record<string, string[]>>((map, user) => {
          map[user.id] = [...user.roles];
          return map;
        }, {})
      );
    } catch {
      setError("Kullanici yetki verileri alinamadi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <section className="screen-card">
        <p className="eyebrow">Kullanici Yetki</p>
        <p>Yukleniyor...</p>
      </section>
    );
  }

  if (!context?.is_system_manager) {
    return (
      <section className="screen-card">
        <p className="eyebrow">Kullanici Yetki</p>
        <p>Bu sayfa yalnizca Sistem Yoneticisi rolu ile goruntulenebilir.</p>
      </section>
    );
  }

  async function handleCreateAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminForm.email.trim() || !adminForm.password.trim()) {
      setError("Yonetici kullanicisi icin e-posta ve sifre zorunludur.");
      return;
    }

    setSaving("create-admin");
    setError(null);
    setSuccess(null);
    try {
      await createAdminUser(adminForm);
      setSuccess("Yonetici kullanicisi olusturuldu.");
      setAdminForm(INITIAL_ADMIN_FORM);
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Yonetici kullanicisi olusturulamadi.");
    } finally {
      setSaving(null);
    }
  }

  async function handleRoleSave(userId: string) {
    const roles = pendingRoles[userId] ?? [];
    setSaving(`roles:${userId}`);
    setError(null);
    setSuccess(null);
    try {
      await updateUserRoles(userId, roles);
      setSuccess(`${userId} icin roller guncellendi.`);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Roller guncellenemedi.");
    } finally {
      setSaving(null);
    }
  }

  async function handleToggleEnabled(userId: string, enabled: boolean) {
    setSaving(`enabled:${userId}`);
    setError(null);
    setSuccess(null);
    try {
      await setUserEnabled(userId, enabled);
      setSuccess(`${userId} kullanici durumu guncellendi.`);
      await load();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Kullanici durumu guncellenemedi.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="user-access-stack">
      <section className="screen-card user-access-card">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Yonetici Islemi</p>
            <h3>Yeni Yonetici Kullanici Olustur</h3>
          </div>
        </div>

        <form className="user-access-create-form" onSubmit={(event) => void handleCreateAdmin(event)}>
          <label>
            <span>E-posta</span>
            <input
              type="email"
              value={adminForm.email}
              onChange={(event) => setAdminForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="serhan@kalay.com"
            />
          </label>
          <label>
            <span>Sifre</span>
            <input
              type="password"
              value={adminForm.password}
              onChange={(event) => setAdminForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Sifre"
            />
          </label>
          <label>
            <span>Ad</span>
            <input
              type="text"
              value={adminForm.firstName}
              onChange={(event) => setAdminForm((current) => ({ ...current, firstName: event.target.value }))}
              placeholder="Serhan"
            />
          </label>
          <label>
            <span>Soyad</span>
            <input
              type="text"
              value={adminForm.lastName}
              onChange={(event) => setAdminForm((current) => ({ ...current, lastName: event.target.value }))}
              placeholder="Kalay"
            />
          </label>
          <button className="btn btn--primary" disabled={saving === "create-admin"} type="submit">
            {saving === "create-admin" ? "Olusturuluyor..." : "Yonetici Olustur"}
          </button>
        </form>
      </section>

      {error ? <p className="user-access-message user-access-message--error">{error}</p> : null}
      {success ? <p className="user-access-message user-access-message--success">{success}</p> : null}

      <section className="screen-card user-access-card">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Yetki Yonetimi</p>
            <h3>Kullanicilar ve Rol Tanimlari</h3>
          </div>
        </div>

        <div className="user-access-users">
          {context.users.map((user) => {
            const editableRoles = pendingRoles[user.id] ?? [];
            return (
              <article className="user-access-user-row" key={user.id}>
                <header className="user-access-user-head">
                  <div>
                    <strong>{user.fullName}</strong>
                    <p>{user.id}</p>
                  </div>
                  <label className="user-access-switch">
                    <input
                      type="checkbox"
                      checked={user.enabled}
                      onChange={(event) => void handleToggleEnabled(user.id, event.target.checked)}
                      disabled={saving === `enabled:${user.id}`}
                    />
                    <span>{user.enabled ? "Aktif" : "Pasif"}</span>
                  </label>
                </header>

                <div className="user-access-roles-grid">
                  {context.available_roles.map((roleName) => {
                    const checked = editableRoles.includes(roleName);
                    return (
                      <label key={`${user.id}:${roleName}`} className="user-access-role-item">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setPendingRoles((current) => {
                              const currentRoles = current[user.id] ?? [];
                              const nextRoles = event.target.checked
                                ? [...currentRoles, roleName]
                                : currentRoles.filter((value) => value !== roleName);
                              return {
                                ...current,
                                [user.id]: Array.from(new Set(nextRoles)).sort(),
                              };
                            });
                          }}
                        />
                        <span>{roleName}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="user-access-row-actions">
                  <button
                    className="btn btn--secondary"
                    type="button"
                    onClick={() =>
                      setPendingRoles((current) => ({
                        ...current,
                        [user.id]: [...user.roles],
                      }))
                    }
                  >
                    Geri Al
                  </button>
                  <button
                    className="btn btn--primary"
                    type="button"
                    disabled={saving === `roles:${user.id}`}
                    onClick={() => void handleRoleSave(user.id)}
                  >
                    {saving === `roles:${user.id}` ? "Kaydediliyor..." : "Rolleri Kaydet"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
