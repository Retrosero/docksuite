export default function GirisPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16,
        background:
          "linear-gradient(180deg, rgba(239,246,255,1) 0%, rgba(255,255,255,1) 100%)"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 20
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>Saha Satış Giriş</h1>
        <p style={{ marginTop: 0, color: "#4b5563" }}>
          Bu ekran Faz 1 için Türkçe placeholder olarak eklendi.
        </p>

        <form>
          <label htmlFor="tenant" style={{ display: "block", marginBottom: 6 }}>
            Tenant
          </label>
          <input
            id="tenant"
            placeholder="örn: demo"
            style={{ width: "100%", padding: 10, marginBottom: 12 }}
          />

          <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>
            E-posta
          </label>
          <input
            id="email"
            type="email"
            placeholder="admin@demo.local"
            style={{ width: "100%", padding: 10, marginBottom: 12 }}
          />

          <label htmlFor="password" style={{ display: "block", marginBottom: 6 }}>
            Şifre
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            style={{ width: "100%", padding: 10, marginBottom: 16 }}
          />

          <button type="button" style={{ width: "100%", padding: 12 }}>
            Giriş Yap
          </button>
        </form>
      </section>
    </main>
  );
}
