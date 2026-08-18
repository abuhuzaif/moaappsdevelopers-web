import LiveStats from "@/components/LiveStats";
import MobileNav from "@/components/MobileNav";
import KsaConnectPage from "./ksa-connect/page";

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
  // This lets the SAME codebase power two independent Vercel projects/domains:
  // - moaappsdevelopers-web (SITE_MODE unset)         -> normal MOA homepage
  // - a second Vercel project for myksaconnect.com     -> set SITE_MODE=ksaconnect
  //   in that project's Environment Variables, and its root "/" will render
  //   the KSA-Connect page directly. No hostname-based rewriting involved —
  //   each deployment simply renders what its own env var tells it to.
  if (process.env.SITE_MODE === "ksaconnect") {
    return <KsaConnectPage />;
  }

  return (
    <>
      <div className="hero-outer">
        <div className="hero-photo-box">
          <div
            className="hero-photo-inner hero-photo-inner-global"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(6,11,22,0.8) 0%, rgba(6,11,22,0.35) 90px, rgba(6,11,22,0.15) 140px, transparent 200px), linear-gradient(90deg, rgba(6,11,22,0.88) 0%, rgba(6,11,22,0.72) 30%, rgba(6,11,22,0.35) 55%, rgba(6,11,22,0.1) 75%, rgba(6,11,22,0.05) 100%), url('/images/moa-global-hero.jpg')",
            }}
          >
            <nav className="hero-nav-overlay container">
              <a href="/" className="brand hero-nav-brand">
                <div className="brand-badge">M</div>
                <div>
                  MOA Apps Developer&apos;s
                  <div className="brand-subtitle hero-nav-subtitle">Smart Apps. Digital Solutions.</div>
                </div>
              </a>
              <div className="nav-links">
                <a href="/" className="nav-link nav-link-active">
                  Home
                </a>
                <a href="#apps" className="nav-link">
                  Apps
                </a>
                <a href="#services" className="nav-link">
                  Services
                </a>
                <a href="#about" className="nav-link">
                  About Us
                </a>
                <a href="#apps" className="nav-link">
                  Our Work
                </a>
                <a href="#contact" className="nav-link">
                  Contact Us
                </a>
              </div>
              <a href="mailto:abuman.moa@gmail.com" className="btn btn-gold nav-cta">
                Get in Touch
              </a>
              <MobileNav />
            </nav>

            <div className="container" style={{ margin: "0 auto 0 0", padding: "104px 24px 40px" }}>
              <span className="hero-eyebrow">⭐ Building Digital Experiences That Connect the World</span>
              <h1 style={{ textAlign: "left", maxWidth: 460, margin: "16px 0 12px" }}>
                Smart Apps. Powerful Solutions.
                <br />
                Built for a <span className="gold">Better Life.</span>
              </h1>
              <p style={{ textAlign: "left", maxWidth: 460, marginBottom: 20 }}>
                We design and develop mobile apps, websites, and digital marketing solutions
                that help businesses grow, connect, and succeed globally.
              </p>

              <div className="feature-badges">
                <div className="feature-badge">
                  <span>📱</span>
                  <span>
                    Mobile Apps
                    <small>Android &amp; iOS</small>
                  </span>
                </div>
                <div className="feature-badge">
                  <span>🌐</span>
                  <span>
                    Websites
                    <small>Modern &amp; Responsive</small>
                  </span>
                </div>
                <div className="feature-badge">
                  <span>📣</span>
                  <span>
                    Digital Marketing
                    <small>Grow &amp; Reach More</small>
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "20px 0" }}>
                <a href="#apps" className="btn btn-gold">
                  Explore Our Apps
                </a>
                <a href="#" className="btn btn-outline">
                  ▶ Watch Intro Video
                </a>
              </div>

              <div className="stats-row" style={{ justifyContent: "flex-start", gap: 40, marginTop: 8 }}>
                <div className="stat">
                  <p className="stat-value">20+</p>
                  <p className="stat-label">Apps Live</p>
                </div>
                <div className="stat">
                  <p className="stat-value">7+</p>
                  <p className="stat-label">Countries</p>
                </div>
                <div className="stat">
                  <p className="stat-value">50K+</p>
                  <p className="stat-label">Happy Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container" id="apps">
        <section id="services" className="content-section">
          <p className="section-eyebrow">What We Do</p>
          <h2 className="section-heading">Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <span className="service-icon">📱</span>
              <h3>Mobile App Development</h3>
              <p>
                Native-quality Android &amp; iOS apps built with Flutter and Firebase —
                from idea to Play Store launch.
              </p>
            </div>
            <div className="service-card">
              <span className="service-icon">🌐</span>
              <h3>Website Development</h3>
              <p>
                Modern, responsive websites and web portals built with Next.js, connected
                to real-time backends when needed.
              </p>
            </div>
            <div className="service-card">
              <span className="service-icon">📣</span>
              <h3>Digital Marketing</h3>
              <p>
                Organic social media strategy and content support to help your app or
                business reach the right audience.
              </p>
            </div>
          </div>
        </section>

        <section id="about" className="content-section">
          <p className="section-eyebrow">Who We Are</p>
          <h2 className="section-heading">About Us</h2>
          <p style={{ maxWidth: 680, color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7 }}>
            MOA Apps Developer&apos;s is an independent app and web development studio
            focused on building smart, reliable digital tools — from community
            marketplaces to Islamic content apps. Every product is designed, built, and
            maintained end-to-end using modern technology like Flutter, Firebase, and
            Next.js.
          </p>
          <div className="about-stats-wrap">
            <LiveStats />
          </div>
        </section>

        <p className="section-eyebrow" style={{ marginTop: 28 }}>
          Our Work
        </p>
        <h2 className="section-heading">Apps We&apos;ve Built</h2>
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

      <footer className="footer footer-rich" id="contact">
        <div className="footer-row">
          <span className="footer-item">🌐 www.moaappsdevelopers.com</span>
          <span className="footer-item">
            ✉️ <a href="mailto:abuman.moa@gmail.com">abuman.moa@gmail.com</a>
          </span>
          <span className="footer-item">📍 Hyderabad, Telangana, India</span>
          <div className="footer-social">
            <span className="footer-social-icon" title="Facebook (coming soon)">
              f
            </span>
            <span className="footer-social-icon" title="Instagram (coming soon)">
              📷
            </span>
            <span className="footer-social-icon" title="LinkedIn (coming soon)">
              in
            </span>
            <span className="footer-social-icon" title="YouTube (coming soon)">
              ▶
            </span>
          </div>
        </div>
        <p className="footer-copyright">
          © {new Date().getFullYear()} MOA Apps Developer&apos;s. All rights reserved.
        </p>
      </footer>
    </>
  );
}
