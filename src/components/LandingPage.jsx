// components/LandingPage.jsx
import { useState, useEffect } from "react";

const FEATURES = [
  {
    icon: "📸",
    title: "Scan Your Fridge",
    desc: "Point your camera at your fridge. AI identifies every ingredient and generates recipes instantly.",
    color: "#ff6b35",
  },
  {
    icon: "🤖",
    title: "AI Recipe Generation",
    desc: "Tell us what you have. We'll create a recipe you've never seen before — perfectly matched to your pantry.",
    color: "#c4622d",
  },
  {
    icon: "📅",
    title: "Weekly Meal Planner",
    desc: "Plan your whole week in seconds. Auto-generates your shopping list for everything you're missing.",
    color: "#e67e22",
  },
  {
    icon: "🎤",
    title: "Voice Navigation",
    desc: "Fully accessible voice control. Built for blind users from the ground up — a world first.",
    color: "#ff6b35",
  },
  {
    icon: "☁️",
    title: "Cloud Sync",
    desc: "Your recipes, pantry and shopping list sync across every device. Always with you.",
    color: "#c4622d",
  },
  {
    icon: "🔗",
    title: "Import Any Recipe",
    desc: "Found a recipe online? Paste the URL and it's saved instantly — scaled to your serving size.",
    color: "#e67e22",
  },
];

const STEPS = [
  { num: "01", title: "Sign up free", desc: "No credit card. No catch. Just create an account." },
  { num: "02", title: "Add your pantry", desc: "Scan your fridge or type what you have in seconds." },
  { num: "03", title: "Cook like you know", desc: "AI generates recipes perfectly matched to your ingredients." },
];

export default function LandingPage({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{
      background: "#0a0a0a",
      color: "#f5f0e8",
      minHeight: "100vh",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(52px, 12vw, 120px);
          font-weight: 900;
          line-height: 0.92;
          letter-spacing: -2px;
          color: #f5f0e8;
        }
        .hero-title em {
          font-style: italic;
          color: #c4622d;
        }
        .body-font {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 300;
        }
        .nav-fixed {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.3s;
        }
        .nav-scrolled {
          background: rgba(10,10,10,0.95);
          border-bottom: 1px solid rgba(196,98,45,0.2);
          backdrop-filter: blur(12px);
        }
        .cta-btn {
          background: #c4622d;
          color: #fff;
          border: none;
          padding: 14px 32px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: all 0.2s;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
        }
        .cta-btn:hover {
          background: #e07535;
          transform: translateY(-1px);
        }
        .cta-btn-lg {
          padding: 18px 48px;
          font-size: 17px;
          clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
        }
        .cta-btn-outline {
          background: transparent;
          border: 1px solid rgba(196,98,45,0.5);
          color: #c4622d;
        }
        .cta-btn-outline:hover {
          background: rgba(196,98,45,0.1);
          border-color: #c4622d;
        }
        .feature-card {
          border: 1px solid rgba(245,240,232,0.08);
          padding: 28px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,0.02);
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #c4622d, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-card:hover {
          border-color: rgba(196,98,45,0.3);
          background: rgba(196,98,45,0.04);
          transform: translateY(-2px);
        }
        .badge-pill {
          display: inline-block;
          border: 1px solid rgba(196,98,45,0.4);
          color: #c4622d;
          padding: 6px 16px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .divider-line {
          width: 60px;
          height: 1px;
          background: #c4622d;
          margin: 24px 0;
        }
        .step-num {
          font-family: 'Playfair Display', serif;
          font-size: 72px;
          font-weight: 900;
          color: rgba(196,98,45,0.15);
          line-height: 1;
          position: absolute;
          top: -10px;
          left: 0;
        }
        .hero-fade-in {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-fade-in.visible { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.1s; }
        .delay-2 { transition-delay: 0.25s; }
        .delay-3 { transition-delay: 0.4s; }
        .delay-4 { transition-delay: 0.55s; }
        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
        }
        .pioneer-bar {
          background: linear-gradient(90deg, #c4622d, #e07535, #c4622d);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
          padding: 10px 0;
          text-align: center;
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .big-quote {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 5vw, 48px);
          font-weight: 400;
          font-style: italic;
          line-height: 1.3;
          color: rgba(245,240,232,0.7);
        }
        .big-quote strong {
          color: #f5f0e8;
          font-style: normal;
          font-weight: 900;
        }
        @media (max-width: 600px) {
          .feature-grid { grid-template-columns: 1fr !important; }
          .hero-section { padding: 120px 24px 80px !important; }
        }
      `}</style>

      {/* Grain overlay */}
      <div className="grain" />

      {/* Pioneer bar */}
      <div className="pioneer-bar">
        <p className="body-font" style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
          🌟 First 200 users get <strong>Pro FREE forever</strong> + Pioneer badge — only {" "}
          <strong>limited spots left</strong>
        </p>
      </div>

      {/* Nav */}
      <nav className={`nav-fixed ${scrolled ? "nav-scrolled" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/icon-192.png" alt="Che AF" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: "#f5f0e8" }}>
            Che <em style={{ color: "#c4622d" }}>AF</em>
          </span>
        </div>
        <button className="cta-btn" onClick={onGetStarted} style={{ padding: "10px 24px", fontSize: 13 }}>
          Get Started Free
        </button>
      </nav>

      {/* Hero */}
      <section className="hero-section" style={{ padding: "140px 24px 100px", maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div className={`hero-fade-in ${visible ? "visible" : ""}`}>
          <div className="badge-pill">Cook Like You Know</div>
        </div>
        <h1 className={`hero-title hero-fade-in delay-1 ${visible ? "visible" : ""}`}>
          Your fridge.<br />
          <em>Your recipes.</em><br />
          Your way.
        </h1>
        <div className="divider-line" style={{ margin: "32px 0" }} />
        <p className={`body-font hero-fade-in delay-2 ${visible ? "visible" : ""}`}
          style={{ fontSize: 18, color: "rgba(245,240,232,0.65)", lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
          Scan your fridge. AI generates recipes from exactly what you have.
          No wasted food. No missing ingredients. No excuses.
        </p>
        <div className={`hero-fade-in delay-3 ${visible ? "visible" : ""}`}
          style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="cta-btn cta-btn-lg" onClick={onGetStarted}>
            🍳 Start Cooking Free
          </button>
          <button className="cta-btn cta-btn-outline cta-btn-lg" onClick={onGetStarted}>
            See how it works
          </button>
        </div>
        <p className={`body-font hero-fade-in delay-4 ${visible ? "visible" : ""}`}
          style={{ marginTop: 20, fontSize: 13, color: "rgba(245,240,232,0.35)" }}>
          No credit card · Free forever for first 200 users · Works on any device
        </p>

        {/* Floating badge */}
        <div style={{
          position: "absolute", top: 140, right: 0,
          width: 140, height: 140,
          borderRadius: "50%",
          border: "1px solid rgba(196,98,45,0.3)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center",
          background: "rgba(196,98,45,0.06)",
          backdropFilter: "blur(8px)",
        }}>
          <span style={{ fontSize: 28 }}>👑</span>
          <span className="body-font" style={{ fontSize: 11, color: "#c4622d", fontWeight: 500, marginTop: 4, lineHeight: 1.3 }}>
            Founding<br />Member<br />Perks
          </span>
        </div>
      </section>

      {/* Big quote */}
      <section style={{ padding: "60px 24px", borderTop: "1px solid rgba(245,240,232,0.06)", borderBottom: "1px solid rgba(245,240,232,0.06)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <p className="big-quote">
            "Stop googling recipes.<br />
            Start cooking with <strong>what you already have.</strong>"
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "100px 24px", maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 60 }}>
          <div className="badge-pill">Everything you need</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, lineHeight: 1.1, color: "#f5f0e8" }}>
            Built for real kitchens.<br />
            <em style={{ color: "#c4622d", fontStyle: "italic" }}>Not recipe blogs.</em>
          </h2>
        </div>
        <div className="feature-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(245,240,232,0.06)" }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <span style={{ fontSize: 32, display: "block", marginBottom: 16 }}>{f.icon}</span>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, marginBottom: 10, color: "#f5f0e8" }}>{f.title}</h3>
              <p className="body-font" style={{ fontSize: 14, color: "rgba(245,240,232,0.55)", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "80px 24px", background: "rgba(196,98,45,0.04)", borderTop: "1px solid rgba(196,98,45,0.1)", borderBottom: "1px solid rgba(196,98,45,0.1)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ marginBottom: 60, textAlign: "center" }}>
            <div className="badge-pill">Simple as that</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, color: "#f5f0e8" }}>
              From fridge to fork<br />in 3 steps
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 40, alignItems: "flex-start", position: "relative", paddingLeft: 20 }}>
                <div style={{ position: "relative", minWidth: 80 }}>
                  <span className="step-num">{s.num}</span>
                </div>
                <div style={{ paddingTop: 8 }}>
                  <div className="divider-line" style={{ margin: "0 0 16px" }} />
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 8, color: "#f5f0e8" }}>{s.title}</h3>
                  <p className="body-font" style={{ fontSize: 16, color: "rgba(245,240,232,0.55)", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility callout */}
      <section style={{ padding: "80px 24px", maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ border: "1px solid rgba(196,98,45,0.3)", padding: "48px", background: "rgba(196,98,45,0.04)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, fontSize: 120, opacity: 0.06 }}>🎤</div>
          <div className="badge-pill">Accessibility first</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: "#f5f0e8", marginBottom: 16, lineHeight: 1.2 }}>
            Built for <em style={{ color: "#c4622d", fontStyle: "italic" }}>everyone.</em><br />
            Including blind users.
          </h2>
          <p className="body-font" style={{ fontSize: 16, color: "rgba(245,240,232,0.6)", lineHeight: 1.8, marginBottom: 24 }}>
            Full voice navigation, screen reader support, and fridge scanning for visually impaired users.
            Che AF is the first recipe app built with blind users as a core audience — not an afterthought.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["🎤 Voice commands", "👁 Screen reader", "📸 Fridge scan", "🔊 Audio cooking mode"].map((t, i) => (
              <span key={i} className="body-font" style={{ fontSize: 13, color: "#c4622d", border: "1px solid rgba(196,98,45,0.3)", padding: "6px 14px" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "80px 24px", background: "rgba(245,240,232,0.02)", borderTop: "1px solid rgba(245,240,232,0.06)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div className="badge-pill">Pricing</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, color: "#f5f0e8", marginBottom: 48 }}>
            Start free.<br />
            <em style={{ color: "#c4622d", fontStyle: "italic" }}>Stay free</em> if you're early.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(245,240,232,0.06)" }}>
            {/* Free */}
            <div style={{ padding: 36, background: "#0a0a0a", textAlign: "left" }}>
              <p className="body-font" style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "rgba(245,240,232,0.4)", marginBottom: 12 }}>Free tier</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 900, color: "#f5f0e8", marginBottom: 4 }}>$0</p>
              <p className="body-font" style={{ fontSize: 13, color: "rgba(245,240,232,0.4)", marginBottom: 24 }}>Forever free</p>
              {["10 AI calls/month", "Recipe management", "Pantry tracking", "Shopping list"].map((f, i) => (
                <div key={i} className="body-font" style={{ fontSize: 14, color: "rgba(245,240,232,0.55)", marginBottom: 10 }}>✓ {f}</div>
              ))}
            </div>
            {/* Pro */}
            <div style={{ padding: 36, background: "rgba(196,98,45,0.08)", border: "1px solid rgba(196,98,45,0.3)", textAlign: "left", position: "relative" }}>
              <div style={{ position: "absolute", top: -1, right: 20, background: "#c4622d", padding: "4px 12px", fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                🌟 PIONEER OFFER
              </div>
              <p className="body-font" style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#c4622d", marginBottom: 12 }}>Pro</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 900, color: "#f5f0e8", marginBottom: 4 }}>
                $2.99<span style={{ fontSize: 16, fontWeight: 400 }}>/mo</span>
              </p>
              <p className="body-font" style={{ fontSize: 13, color: "#c4622d", marginBottom: 24, fontWeight: 500 }}>FREE for first 200 users</p>
              {["Unlimited AI recipes", "Fridge photo scan", "Weekly meal planner", "Cloud sync", "Voice navigation", "Priority support"].map((f, i) => (
                <div key={i} className="body-font" style={{ fontSize: 14, color: "rgba(245,240,232,0.8)", marginBottom: 10 }}>✓ {f}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 8vw, 80px)", fontWeight: 900, lineHeight: 0.95, color: "#f5f0e8", marginBottom: 32 }}>
            Cook like<br />
            <em style={{ color: "#c4622d", fontStyle: "italic" }}>you know.</em>
          </h2>
          <p className="body-font" style={{ fontSize: 16, color: "rgba(245,240,232,0.5)", marginBottom: 40, lineHeight: 1.7 }}>
            Join the first 200 users and lock in Pro free forever.<br />
            No credit card. No commitment. Just great food.
          </p>
          <button className="cta-btn cta-btn-lg" onClick={onGetStarted} style={{ fontSize: 18, padding: "20px 56px" }}>
            🍳 Get Started — It's Free
          </button>
          <p className="body-font" style={{ marginTop: 20, fontSize: 12, color: "rgba(245,240,232,0.25)", letterSpacing: 1 }}>
            che-af.vercel.app · Made with ❤️ for real cooks
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(245,240,232,0.06)", padding: "32px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <img src="/icon-192.png" alt="Che AF" style={{ width: 24, height: 24, borderRadius: 6 }} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "#f5f0e8" }}>
            Che <em style={{ color: "#c4622d" }}>AF</em>
          </span>
        </div>
        <p className="body-font" style={{ fontSize: 12, color: "rgba(245,240,232,0.2)" }}>
          © 2026 Che AF · Cook Like You Know
        </p>
      </footer>
    </div>
  );
}
