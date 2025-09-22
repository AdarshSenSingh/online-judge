import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import brandLogo from "../assets/images/logo.png";
import googleIcon from "../assets/google-icon.svg";
import hero2 from "../assets/images/ai.png";
import hero3 from "../assets/images/webdev.png";

// Inline helpers to keep this page self-contained and match the new visual spec
const useBreeSerif = () => {
  useEffect(() => {
    const id = "bree-serif-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Bree+Serif&display=swap";
      document.head.appendChild(link);
    }
  }, []);
};

const useAutoRotate = (length, interval = 6000) => {
  const [index, setIndex] = useState(0);
  const next = useCallback(() => setIndex((i) => (i + 1) % length), [length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + length) % length), [length]);
  useEffect(() => {
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [next, interval]);
  return { index, next, prev, setIndex };
};

// Ripple/Glass button
const GlassButton = ({ children, onClick, variant = "primary", as: Comp = "button", to, ariaLabel }) => {
  const [ripples, setRipples] = useState([]);
  const btnRef = useRef(null);

  const handleClick = (e) => {
    if (onClick) onClick(e);
    const rect = btnRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const key = Date.now();
    setRipples((r) => [...r, { x, y, size, key }]);
    setTimeout(() => setRipples((r) => r.filter((p) => p.key !== key)), 600);
  };

  const base = {
    position: "relative",
    overflow: "hidden",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 24px",
    borderRadius: 16,
    fontWeight: 700,
    letterSpacing: 0.3,
    cursor: "pointer",
    userSelect: "none",
    transition: "transform 180ms ease, filter 220ms ease, box-shadow 220ms ease",
    fontFamily: "'Bree Serif', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    fontSize: 18,
  };

  const variants = {
    primary: {
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.3)",
      background:
        "linear-gradient(135deg, rgba(99,120,255,0.55), rgba(70,148,254,0.65))",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 28px rgba(80,120,255,0.35)",
      backdropFilter: "blur(8px)",
    },
    secondary: {
      color: "#234",
      border: "1.5px solid rgba(110,140,255,0.45)",
      background: "linear-gradient(135deg, #eef3ffAA, #ffffffCC)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.65), 0 8px 20px rgba(90,120,200,0.20)",
      backdropFilter: "blur(10px)",
    },
  };

  const hover = {
    transform: "translateY(-2px) scale(1.03)",
    filter: "brightness(1.05)",
    boxShadow: "0 14px 36px rgba(80,120,255,0.40)",
  };

  const Ripple = ({ x, y, size }) => (
    <span
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        pointerEvents: "none",
        borderRadius: "50%",
        background:
          variant === "primary"
            ? "radial-gradient(rgba(255,255,255,0.6), transparent 60%)"
            : "radial-gradient(rgba(110,140,255,0.35), transparent 60%)",
        transform: "scale(0)",
        animation: "ripple 600ms ease-out forwards",
      }}
    />
  );

  const content = (
    <Comp
      ref={btnRef}
      onClick={handleClick}
      aria-label={ariaLabel}
      to={to}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, hover)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, { transform: "", filter: "", boxShadow: variants[variant].boxShadow })}
    >
      {children}
      {ripples.map((r) => (
        <Ripple key={r.key} {...r} />
      ))}
    </Comp>
  );

  return content;
};

// Double border card wrapper with gap
const DoubleCard = ({ children, gradient = "linear-gradient(120deg,#89f7fe,#66a6ff)", radius = 18, padding = 16, style }) => {
  const outer = {
    padding: 3,
    borderRadius: radius + 4,
    background: gradient,
  };
  const middle = {
    padding: 3,
    borderRadius: radius + 2,
    background: "linear-gradient(180deg,#fff,#f3f6ff)",
  };
  const inner = {
    borderRadius: radius,
    background: "linear-gradient(180deg,#fafdff,#eef3ff)",
    boxShadow: "0 10px 30px rgba(80,120,255,0.15)",
    padding,
    height: "100%",
  };
  return (
    <div style={{ ...outer, ...style }}>
      <div style={middle}>
        <div style={inner}>{children}</div>
      </div>
    </div>
  );
};

// Cloud shape for testimonial
const CloudCard = ({ quote, by }) => {
  return (
    <div style={{ position: "relative", padding: 24 }}>
      <svg
        viewBox="0 0 600 260"
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", filter: "drop-shadow(0 12px 30px rgba(120,140,255,0.25))" }}
      >
        <defs>
          <linearGradient id="cloudGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f6f0ff" />
            <stop offset="100%" stopColor="#e7f3ff" />
          </linearGradient>
        </defs>
        <path
          d="M110 170c-30 0-55-20-55-48 0-24 18-44 42-48 7-41 45-72 92-72 36 0 67 18 83 44 9-5 20-8 32-8 34 0 62 23 68 53 0 0 1 0 1 0 28 0 52 21 55 48 3 30-19 58-50 63-89 13-193 13-268 1z"
          fill="url(#cloudGrad)"
          stroke="#cfdcff"
          strokeWidth="2"
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
        <div style={{ maxWidth: 540, textAlign: "center" }}>
          <div style={{ fontSize: 28, lineHeight: 1.5, color: "#2b3264", fontFamily: "'Bree Serif', serif" }}>
            <span role="img" aria-label="quotes">❝</span> {quote} <span role="img" aria-label="quotes">❞</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 18, color: "#5a6b9a", fontWeight: 700 }}>
            — {by} <span role="img" aria-label="stars">✨</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reveal-on-scroll hook
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
};

const Home = () => {
  useBreeSerif();

  // Rotating hero illustrations
  const heroImages = useMemo(() => [hero2, hero3], []);
  const hero = useAutoRotate(heroImages.length, 6000);

  // Testimonial carousel
  const testimonials = useMemo(
    () => [
      {
        quote: "The AI hints helped me debug faster and actually learn from my mistakes!",
        by: "Rahul K., B.Tech, CodeKaro",
      },
      {
        quote: "Loved the instant grading! My interview prep felt structured and efficient.",
        by: "Priya S., Final Year Student",
      },
      {
        quote: "We saved hours each week with auto-grading and analytics.",
        by: "Dr. Verma, CS Dept Faculty",
      },
      {
        quote: "Clean UI, realistic problems, and supportive hints—perfect combo.",
        by: "Aman T., 2nd Year, CS",
      },
    ],
    []
  );
  const slides = useAutoRotate(testimonials.length, 5500);

  const onCarouselKeyDown = (e) => {
    if (e.key === "ArrowRight") slides.next();
    if (e.key === "ArrowLeft") slides.prev();
  };

  // Section wrappers
  const Section = ({ children, bg, id }) => (
    <section
      id={id}
      style={{
        background: bg,
        padding: "64px 0 72px",
        borderTop: "2px solid #e3e9ff",
        borderBottom: "2px solid #e3e9ff",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>{children}</div>
    </section>
  );

  const Title = ({ children, sub }) => (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontFamily: "'Bree Serif', serif",
          fontSize: 40,
          color: "#132053",
          letterSpacing: 0.2,
          margin: 0,
        }}
      >
        {children}
      </h2>
      {sub && (
        <p style={{ marginTop: 10, fontSize: 18, color: "#405089" }}>{sub}</p>
      )}
    </div>
  );

  const headerStyles = {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(10px)",
    background: "linear-gradient(90deg, rgba(255,255,255,0.65), rgba(238,245,255,0.6))",
    borderBottom: "1px solid rgba(150, 170, 255, 0.35)",
  };

  return (
    <div style={{ fontFamily: "'Bree Serif', serif", overflowX: "hidden" }}>
      {/* Sticky glass header for this page */}
      <div style={headerStyles}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={brandLogo} alt="CodeKaro" style={{ width: 36, height: 36, borderRadius: 8 }} />
            <span style={{ fontSize: 22, color: "#142356" }}>CodeKaro</span>
          </div>
          <nav style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <Link to="/contact" style={{ color: "#142356", textDecoration: "none", fontSize: 18 }}>Contact</Link>
            <Link to="/about" style={{ color: "#142356", textDecoration: "none", fontSize: 18 }}>About</Link>
            <Link to="/" style={{ color: "#142356", textDecoration: "none", fontSize: 18 }}>Home</Link>
          </nav>
        </div>
      </div>

      {/* HERO */}
      <Section
        id="hero"
        bg="linear-gradient(120deg,#e6f0ff 0%, #ffffff 45%, #f2f8ff 100%)"
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 56, lineHeight: 1.05, margin: 0, color: "#0f1f54" }}>
              Welcome to <span style={{ background: "linear-gradient(90deg,#2f67ff,#6a3cff)", WebkitBackgroundClip: "text", color: "transparent" }}>CodeKaro.com</span>
            </h1>
            <p style={{ marginTop: 14, fontSize: 20, color: "#2f3f78", lineHeight: 1.8 }}>
              Elevate your coding skills with secure, AI‑powered assessments. Learn, practice, and ace technical interviews with instant feedback and rich insights.
            </p>

            {/* Feature chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
              <DoubleCard padding={8} radius={999} gradient="linear-gradient(90deg,#8ac4ff,#b7a6ff)">
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#2b3b75" }}>
                  <img src={brandLogo} alt="CodeKaro" style={{ width: 18, height: 18 }} /> Official Platform
                </div>
              </DoubleCard>
              <DoubleCard padding={8} radius={999} gradient="linear-gradient(90deg,#c0f0ff,#d3d0ff)">
                <div title="AI generates smart hints" style={{ display: "flex", alignItems: "center", gap: 8, color: "#2b3b75" }}>
                  <span role="img" aria-label="robot">🤖</span> AI‑Powered Hints
                </div>
              </DoubleCard>
              <DoubleCard padding={8} radius={999} gradient="linear-gradient(90deg,#ffd7e6,#fff1c1)">
                <div title="Real unit tests" style={{ display: "flex", alignItems: "center", gap: 8, color: "#2b3b75" }}>
                  <span role="img" aria-label="test">🧪</span> Real Test Cases
                </div>
              </DoubleCard>
              <DoubleCard padding={8} radius={999} gradient="linear-gradient(90deg,#bce0ff,#c8ffe3)">
                <div title="Google OAuth" style={{ display: "flex", alignItems: "center", gap: 8, color: "#2b3b75" }}>
                  <img src={googleIcon} alt="Google" style={{ width: 18, height: 18 }} /> OAuth Login
                </div>
              </DoubleCard>
            </div>

            {/* Role cards with bigger CTAs */}
            <div style={{ display: "flex", gap: 16, marginTop: 22, flexWrap: "wrap" }}>
              <DoubleCard style={{ flex: "1 1 260px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
                  <div style={{ fontSize: 42 }} aria-hidden>🎓</div>
                  <div style={{ fontSize: 22, color: "#23376f" }}>Students</div>
                  <div style={{ color: "#4b5892", fontSize: 18, lineHeight: 1.6 }}>
                    Practice, compete, and get instant AI support for coding skills and real assessments.
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
                    <GlassButton as={Link} to="/student/register" ariaLabel="Student signup">Get Started</GlassButton>
                    <GlassButton as={Link} to="/student/login" variant="secondary" ariaLabel="Student login">Sign In</GlassButton>
                  </div>
                </div>
              </DoubleCard>

              <DoubleCard gradient="linear-gradient(120deg,#d7c3ff,#ffc8a6)" style={{ flex: "1 1 260px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
                  <div style={{ fontSize: 42 }} aria-hidden>👩‍🏫</div>
                  <div style={{ fontSize: 22, color: "#5a359d" }}>Instructors</div>
                  <div style={{ color: "#4b5892", fontSize: 18, lineHeight: 1.6 }}>
                    Automate grading, manage tests, get AI analytics—save hours every week.
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
                    <GlassButton as={Link} to="/instructor/register" ariaLabel="Instructor signup">Create Account</GlassButton>
                    <GlassButton as={Link} to="/instructor/login" variant="secondary" ariaLabel="Instructor login">Sign In</GlassButton>
                  </div>
                </div>
              </DoubleCard>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(160px,1fr))", gap: 12, marginTop: 16 }}>
              {[
                ["1K+", "Active Learners"],
                ["40+", "Curated Problems"],
                ["3", "Languages"],
                ["99.9%", "Secure Execution"],
              ].map(([n, l], idx) => (
                <DoubleCard key={idx} padding={12}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, color: "#1f3ba6" }}>{n}</div>
                    <div style={{ fontSize: 14, color: "#4c5a86" }}>{l}</div>
                  </div>
                </DoubleCard>
              ))}
            </div>
          </div>

          {/* Dynamic hero illustration */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img
                key={hero.index}
                src={heroImages[hero.index]}
                alt="Coding platform illustration"
                style={{
                  width: "min(100%, 420px)",
                  maxWidth: 420,
                  borderRadius: 24,
                  border: "2px solid rgba(160, 180, 255, 0.6)",
                  boxShadow: "0 18px 40px rgba(100,130,255,0.25)",
                  transition: "opacity 600ms ease, transform 300ms ease",
                }}
              />
              <div style={{ position: "absolute", inset: 0, zIndex: -1, background: "radial-gradient(closest-side, #cfe2ff, transparent)", filter: "blur(30px)", borderRadius: 40 }} />
            </div>
          </div>
        </div>
      </Section>

      {/* BENEFITS */}
      <Section id="benefits" bg="linear-gradient(120deg,#f7fbff 0%, #f3f6ff 100%)">
        <Title>Why You’ll Love CodeKaro</Title>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { icon: "🚀", title: "AI Code Correction", text: "Get instant feedback and smart hints on your code, powered by integrated AI." },
            { icon: "🛡️", title: "Secure Online Judge", text: "Your code runs in safe, cloud-powered Docker containers—just focus on coding." },
            { icon: "🕒", title: "Fast Grading", text: "Solutions auto-graded in seconds—no need to wait for manual reviews." },
            { icon: "📈", title: "Progress Tracking", text: "See all your solved problems and test cases at a glance." },
            { icon: "📚", title: "Real Practice Problems", text: "Over 40 diverse, real-world problems and tests to level up your coding." },
            { icon: "🤝", title: "Instructor Support", text: "Instant help and AI debugging tips to ensure your success." },
          ].map((b, i) => (
            <DoubleCard key={i} padding={18}>
              <div title={b.title} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span aria-hidden style={{ fontSize: 28 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 20, color: "#1f2d6f" }}>{b.title}</div>
                  <div style={{ fontSize: 16, color: "#465377", marginTop: 6, lineHeight: 1.65 }}>{b.text}</div>
                </div>
              </div>
            </DoubleCard>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="how" bg="linear-gradient(117deg,#f7fdff 70%,#e7f2fd 106%)">
        <Title>How It Works</Title>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {[
            ["1️⃣", "Choose a problem or assessment"],
            ["2️⃣", "Write code in the built-in editor"],
            ["3️⃣", "Submit and get instant AI feedback"],
            ["4️⃣", "See your score and history"],
          ].map(([i, t], idx) => (
            <DoubleCard key={idx} padding={16}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 180 }}>
                <div style={{ fontSize: 24, color: "#3075ef" }}>{i}</div>
                <div style={{ fontSize: 18, color: "#2b3264", marginTop: 8, textAlign: "center" }}>{t}</div>
              </div>
            </DoubleCard>
          ))}
        </div>
      </Section>

      {/* TESTIMONIALS - darker background with cloud-shaped frames and carousel */}
      <Section id="testimonials" bg="linear-gradient(180deg,#1b2356 0%, #121738 100%)">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <h2 style={{ fontFamily: "'Bree Serif', serif", fontSize: 40, color: "#ffffff", margin: 0 }}>What Students Say</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <GlassButton variant="secondary" ariaLabel="Previous" onClick={slides.prev}>‹</GlassButton>
            <GlassButton ariaLabel="Next" onClick={slides.next}>›</GlassButton>
          </div>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Student testimonials"
          onKeyDown={onCarouselKeyDown}
          tabIndex={0}
          style={{ position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              width: `${testimonials.length * 100}%`,
              transform: `translateX(-${slides.index * (100 / testimonials.length)}%)`,
              transition: "transform 700ms cubic-bezier(.22,.61,.36,1)",
            }}
          >
            {testimonials.map((t, idx) => (
              <div key={idx} style={{ minWidth: `${100 / testimonials.length}%`, padding: "0 10px", boxSizing: "border-box" }}>
                <CloudCard quote={t.quote} by={t.by} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => slides.setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={slides.index === i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  border: "1px solid #93a7ff",
                  background: slides.index === i ? "#6b88ff" : "transparent",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      </Section>

      {/* FOOTER with stronger contrast and clean spacing */}
      <footer style={{ background: "linear-gradient(95deg, #22234a 0%, #17193a 93%)", color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(180px, 1fr))", gap: 16 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 24 }}>CodeKaro</h4>
              <p style={{ marginTop: 10, fontSize: 16, color: "#cdd6ff" }}>
                Your modern platform for secure, AI‑powered coding assessments and learning.
              </p>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 18 }}>Quick Links</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: "10px 0", display: "grid", gap: 6 }}>
                <li><Link to="/" style={{ color: "#a9c0ff", textDecoration: "none" }}>Home</Link></li>
                <li><Link to="/about" style={{ color: "#a9c0ff", textDecoration: "none" }}>About</Link></li>
                <li><Link to="/register" style={{ color: "#a9c0ff", textDecoration: "none" }}>Register</Link></li>
                <li><Link to="/login" style={{ color: "#a9c0ff", textDecoration: "none" }}>Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 18 }}>Platform</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: "10px 0", display: "grid", gap: 6 }}>
                <li><Link to="/problems" style={{ color: "#a9c0ff", textDecoration: "none" }}>Problems</Link></li>
                <li><Link to="/compiler" style={{ color: "#a9c0ff", textDecoration: "none" }}>Compiler</Link></li>
                <li><Link to="/contact" style={{ color: "#a9c0ff", textDecoration: "none" }}>Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 18 }}>Connect</h4>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <a href="https://github.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#a9c0ff", textDecoration: "none" }} aria-label="GitHub">🐙 GitHub</a>
                <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#a9c0ff", textDecoration: "none" }} aria-label="LinkedIn">💼 LinkedIn</a>
                <a href="mailto:info@algol-jniversity.edu" style={{ color: "#a9c0ff", textDecoration: "none" }} aria-label="Email">✉️ Email</a>
              </div>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 18 }}>Legal</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: "10px 0", display: "grid", gap: 6 }}>
                <li><Link to="/privacy" style={{ color: "#a9c0ff", textDecoration: "none" }}>Privacy Policy</Link></li>
                <li><Link to="/terms" style={{ color: "#a9c0ff", textDecoration: "none" }}>Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div style={{ marginTop: 20, borderTop: "1px solid #373b73", paddingTop: 12, textAlign: "center", color: "#cbd4ff", fontSize: 14 }}>
            © {new Date().getFullYear()} CodeKaro.com. All rights reserved.
          </div>
        </div>
      </footer>

      {/* keyframes for ripple (scoped) */}
      <style>
        {`
          @keyframes ripple { to { transform: scale(1); opacity: 0; } }
          @media(max-width: 1100px){
            #hero > div { grid-template-columns: 1fr !important; }
          }
          @media(max-width: 700px){
            h1 { font-size: 40px !important; }
          }
        `}
      </style>
    </div>
  );
};

export default Home;
