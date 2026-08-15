import LiveStats from "@/components/LiveStats";

const apps = [
  {
    name: "KSA-Connect",
    tagline: "Find. Connect. Grow.",
    description:
      "Classifieds, housing, cars, and community marketplace for residents and expatriates across 7 Saudi cities.",
    status: "Live",
    href: "/ksa-connect",
    playStore:
      "https://play.google.com/store/apps/details?id=com.riyadhconnect.riyadh_connect",
  },
  {
    name: "Telangana Borewells",
    tagline: "Trusted drilling, made simple.",
    description:
      "Directory of borewell drilling contractors across Telangana, with a built-in service request system.",
    status: "Live",
    href: null,
    playStore: "https://play.google.com/store/apps/details?id=com.telangana.borewells",
  },
  {
    name: "AsSalah",
    tagline: "Your daily companion for prayer.",
    description:
      "Prayer times, Qibla direction, Quran with Tajweed audio, Hijri calendar, and daily Azkaar.",
    status: "Live",
    href: null,
    playStore: null,
  },
  {
    name: "Hajj & Umrah Guide",
    tagline: "Quran & Duas for pilgrims.",
    description:
      "A free companion for Hajj and Umrah — offline Quran, Mina navigation, and multilingual guidance for pilgrims.",
    status: "Live",
    href: null,
    playStore: "https://play.google.com/store/apps/details?id=com.omerali.hajjguide",
  },
  {
    name: "Al-Madinah Sacred Places Guide",
    tagline: "Discover Madinah's sacred sites.",
    description:
      "A guide to the sacred and historical places of Madinah Al-Munawwarah, with maps and multilingual content.",
    status: "Live",
    href: null,
    playStore: "https://play.google.com/store/apps/details?id=com.mohammedomer.madinah",
  },
];

export default function HomePage() {
  return (
    <>
      <nav className="nav container">
        <div className="brand">
          <div className="brand-badge">M</div>
          MOA Apps Developer&apos;s
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <h1>
            Apps built for <span className="gold">Saudi Arabia</span>
          </h1>
          <p>
            We design and build mobile apps for Saudi Arabia&apos;s community —
            from classifieds to Islamic tools. Explore what we&apos;ve shipped so far.
          </p>
          <LiveStats />
        </div>
      </section>

      <main className="container">
        <div className="grid">
          {apps.map((app) => (
            <div className="card" key={app.name}>
              <span className="pill">{app.status}</span>
              <h3 style={{ marginTop: 12 }}>{app.name}</h3>
              <p style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                {app.tagline}
              </p>
              <p>{app.description}</p>
              <div style={{ display: "flex", gap: 10 }}>
                {app.href && (
                  <a href={app.href} className="btn btn-gold">
                    Browse listings
                  </a>
                )}
                {app.playStore && (
                  <a href={app.playStore} className="btn btn-outline" target="_blank">
                    Get the app
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="qr-section">
          <div>
            <p style={{ fontWeight: 800, fontSize: 18, margin: "0 0 6px" }}>
              Scan to install KSA-Connect
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0, maxWidth: 380 }}>
              Point your phone&apos;s camera at the code to open KSA-Connect on Google Play —
              no typing needed.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ksa_connect_qr.png" alt="Scan to install KSA-Connect" className="qr-image" />
        </div>
      </main>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} MOA Apps Developer&apos;s ·{" "}
          <a href="mailto:abuman.moa@gmail.com">abuman.moa@gmail.com</a>
        </p>
      </footer>
    </>
  );
}
