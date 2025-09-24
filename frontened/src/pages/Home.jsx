import React from 'react';
import { Link } from 'react-router-dom';
import brandLogo from '../assets/images/logo.png';
import heroImg from '../assets/images/ai.png';

/*
  Professional, LeetCode-inspired landing built with inline styles and scoped CSS.
  - Dark hero with strong headline and CTAs
  - Code preview panel
  - Stats ribbon
  - Explore Topics grid
  - Featured problems preview
  - Instructor CTA
  - Clean footer
*/

const Container = ({ children, style }) => (
  <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', ...style }}>{children}</div>
);

const PillButton = ({ to, children, variant = 'primary', ariaLabel, style }) => {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '12px 18px',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 16,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'transform 150ms ease, background 220ms ease, box-shadow 220ms ease',
    outline: 'none'
  };
  const variants = {
    primary: {
      color: '#0b1221',
      background: 'linear-gradient(90deg,#fbd38d,#f6ad55)',
      boxShadow: '0 8px 24px rgba(246,173,85,0.3)'
    },
    ghost: {
      color: '#e2e8f0',
      background: 'rgba(226,232,240,0.08)',
      border: '1px solid rgba(148,163,184,0.25)'
    }
  };
  const hover = (e) => {
    e.currentTarget.style.transform = 'translateY(-1px)';
    if (variant === 'primary') {
      e.currentTarget.style.boxShadow = '0 12px 30px rgba(246,173,85,0.38)';
    }
  };
  const leave = (e) => {
    e.currentTarget.style.transform = '';
    if (variant === 'primary') {
      e.currentTarget.style.boxShadow = variants.primary.boxShadow;
    }
  };
  return (
    <Link to={to} aria-label={ariaLabel} style={{ ...base, ...variants[variant], ...(style || {}) }} onMouseEnter={hover} onMouseLeave={leave}>
      {children}
    </Link>
  );
};

const Stat = ({ value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ color: '#0f172a', fontWeight: 800, fontSize: 22 }}>{value}</div>
    <div style={{ color: '#475569', fontSize: 14 }}>{label}</div>
  </div>
);

const TopicCard = ({ icon, title, to = '/problems' }) => (
  <Link to={to} style={{
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    textDecoration: 'none',
    color: '#0b1221',
    background: '#fff',
    border: '1px solid #e7ecf5',
    borderRadius: 12,
    padding: 14,
    boxShadow: '0 8px 18px rgba(15,23,42,0.05)',
    transition: 'transform 160ms ease, box-shadow 200ms ease'
  }}
  onMouseEnter={(e)=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 14px 26px rgba(15,23,42,0.10)'; }}
  onMouseLeave={(e)=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 8px 18px rgba(15,23,42,0.05)'; }}>
    <span aria-hidden style={{ fontSize: 22 }}>{icon}</span>
    <span style={{ fontWeight: 700 }}>{title}</span>
  </Link>
);

const ProblemRow = ({ title, difficulty = 'Easy', acceptance = '72%', to = '/problems' }) => {
  const diffColor = difficulty === 'Hard' ? '#ef4444' : difficulty === 'Medium' ? '#f59e0b' : '#22c55e';
  return (
    <Link to={to} style={{
      display: 'grid',
      gridTemplateColumns: '1fr max-content max-content',
      alignItems: 'center',
      gap: 16,
      padding: '12px 14px',
      borderBottom: '1px solid #e7ecf5',
      color: '#0b1221',
      textDecoration: 'none',
      transition: 'background-color 160ms ease'
    }}
    onMouseEnter={(e)=>{ e.currentTarget.style.backgroundColor = '#f8fafc'; }}
    onMouseLeave={(e)=>{ e.currentTarget.style.backgroundColor = ''; }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div style={{ color: diffColor, fontWeight: 700, fontSize: 13 }}>{difficulty}</div>
      <div style={{ color: '#64748b', fontSize: 13 }}>{acceptance}</div>
    </Link>
  );
};

const Home = () => {
  return (
    <div style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      {/* Top Nav (page-local) */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(10,14,25,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(148,163,184,0.15)' }}>
        <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src={brandLogo} alt="AlgoAuth" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span style={{ color: '#e2e8f0', fontWeight: 800, letterSpacing: 0.4 }}>AlgoAuth</span>
          </Link>
          <nav aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Link to="/problems" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Problems</Link>
            <Link to="/compiler" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Compiler</Link>
            <Link to="/about" style={{ color: '#cbd5e1', textDecoration: 'none' }}>About</Link>
            <Link to="/contact" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Contact</Link>
          </nav>
          <div style={{ display: 'flex', gap: 10 }}>
            <PillButton to="/student/login" variant="ghost">Sign in</PillButton>
            <PillButton to="/student/register">Start for free</PillButton>
          </div>
        </Container>
      </div>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg,#eef4ff 0%, #ffffff 55%, #f7fbff 100%)' }}>
        <Container style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 40, alignItems: 'center', padding: '80px 0 60px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 48, lineHeight: 1.15, letterSpacing: -0.3, color: '#0b1221' }}>Practice coding. Ace interviews. Build confidence.</h1>
            <p style={{ marginTop: 16, color: '#334155', fontSize: 18, lineHeight: 1.75, maxWidth: 620 }}>
              Solve curated challenges with instant feedback and a secure online judge. Track your progress and get interview-ready faster.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 20 }}>
              <PillButton to="/student/register" ariaLabel="Create account">Get Started</PillButton>
              <PillButton to="/problems" variant="ghost" ariaLabel="Browse problems" style={{ color: '#0b1221', background: 'rgba(2,6,23,0.04)', border: '1px solid rgba(2,6,23,0.1)' }}>Browse Problems</PillButton>
            </div>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.2)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <Stat value="40+" label="Problems" />
              <Stat value="3" label="Languages" />
              <Stat value="99.9%" label="Sandbox Secure" />
              <Stat value="1K+" label="Learners" />
            </div>
          </div>
          <div>
            <div style={{
              background: 'linear-gradient(180deg,#0f172a,#0b1221)',
              border: '1px solid rgba(148,163,184,0.18)',
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 20px 60px rgba(2,6,23,0.55)',
              maxWidth: 560,
              marginLeft: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: '#f87171' }} />
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: '#fbbf24' }} />
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: '#34d399' }} />
                </div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>main.cpp</div>
              </div>
              <pre aria-label="code preview" style={{
              margin: 0,
              background: 'transparent',
              color: '#e5e7eb',
              fontSize: 13.5,
              lineHeight: 1.65,
              overflowX: 'auto',
              fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
              minHeight: 240
              }}>{`#include <bits/stdc++.h>
              using namespace std;
              
              int main(){
              ios::sync_with_stdio(false);
              cin.tie(nullptr);
              
              int n; cin >> n; // input
              vector<int> a(n);
              for(int i=0;i<n;++i) cin >> a[i];
              
              // TODO: Solve using prefix sums
              long long sum = 0;
              for(int x: a) sum += x;
              cout << sum << "\n";
              return 0;
              }`}</pre>
            </div>
                      </div>
        </Container>
      </section>

      {/* Explore Topics */}
      <section style={{ background: '#f8fafc', borderTop: '1px solid #e7ecf5', borderBottom: '1px solid #e7ecf5' }}>
        <Container style={{ padding: '28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0, color: '#0b1221' }}>Explore Topics</h2>
            <Link to="/problems" style={{ color: '#334155', textDecoration: 'none', fontWeight: 700 }}>View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(160px,1fr))', gap: 12 }}>
            {[
              ['📚','Arrays'], ['🧵','Strings'], ['🧮','Math'], ['🧭','Two Pointers'], ['🗃️','Hashing'], ['🧠','DP'],
              ['🧬','Recursion'], ['🌲','Trees'], ['🕸️','Graphs'], ['🧱','Stacks'], ['🌀','Queues'], ['🧪','Greedy']
            ].map(([icon, title], i) => (
              <TopicCard key={i} icon={icon} title={title} />
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Problems */}
      <section>
        <Container style={{ padding: '26px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div style={{ background: '#fff', border: '1px solid #e7ecf5', borderRadius: 14, overflow: 'hidden', boxShadow: '0 10px 20px rgba(15,23,42,0.06)' }}>
              <div style={{ padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderBottom: '1px solid #e7ecf5' }}>
                <h3 style={{ margin: 0, color: '#0b1221' }}>Popular Problems</h3>
                <Link to="/problems" style={{ color: '#334155', textDecoration: 'none', fontWeight: 700 }}>See all</Link>
              </div>
              <div>
                <ProblemRow title="Two Sum" difficulty="Easy" acceptance="56%" />
                <ProblemRow title="Longest Substring Without Repeating Characters" difficulty="Medium" acceptance="38%" />
                <ProblemRow title="Merge K Sorted Lists" difficulty="Hard" acceptance="26%" />
                <ProblemRow title="Binary Tree Level Order Traversal" difficulty="Medium" acceptance="54%" />
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e7ecf5', borderRadius: 14, overflow: 'hidden', boxShadow: '0 10px 20px rgba(15,23,42,0.06)' }}>
              <div style={{ padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderBottom: '1px solid #e7ecf5' }}>
                <h3 style={{ margin: 0, color: '#0b1221' }}>Recently Added</h3>
                <Link to="/problems" style={{ color: '#334155', textDecoration: 'none', fontWeight: 700 }}>See all</Link>
              </div>
              <div>
                <ProblemRow title="Valid Anagram" difficulty="Easy" acceptance="60%" />
                <ProblemRow title="Product of Array Except Self" difficulty="Medium" acceptance="52%" />
                <ProblemRow title="Maximal Rectangle" difficulty="Hard" acceptance="32%" />
                <ProblemRow title="Course Schedule" difficulty="Medium" acceptance="45%" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Instructor CTA */}
      <section style={{ background: 'linear-gradient(90deg,#f8fafc,#eef2ff)', borderTop: '1px solid #e7ecf5', borderBottom: '1px solid #e7ecf5' }}>
        <Container style={{ padding: '26px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0b1221', fontSize: 26 }}>For Instructors & Teams</h3>
            <p style={{ color: '#334155', marginTop: 8, lineHeight: 1.7 }}>
              Create assessments, auto-grade submissions, and track performance with detailed analytics. Save valuable time each week.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <PillButton to="/instructor/register">Create Instructor Account</PillButton>
              <PillButton to="/instructor/login" variant="ghost">Sign in as Instructor</PillButton>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-block', background: '#fff', border: '1px solid #e7ecf5', borderLeft: '3px solid #647cf7', borderRadius: 14, padding: 16, boxShadow: '0 10px 20px rgba(15,23,42,0.06)' }}>
              <div style={{ fontWeight: 800, color: '#0b1221' }}>Auto-Grading</div>
              <ul style={{ margin: '8px 0 0 18px', color: '#334155' }}>
                <li>Batch evaluate in cloud</li>
                <li>Plagiarism-safe sandbox</li>
                <li>Actionable analytics</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0b1221', color: '#cbd5e1' }}>
        <Container style={{ padding: '26px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={brandLogo} alt="AlgoAuth" style={{ width: 28, height: 28, borderRadius: 8 }} />
                <span style={{ color: '#e2e8f0', fontWeight: 800 }}>AlgoAuth</span>
              </div>
              <p style={{ marginTop: 10, color: '#94a3b8' }}>Secure, fast, and modern online judge with interview-ready content.</p>
            </div>
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 8 }}>Explore</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
                <li><Link to="/problems" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Problems</Link></li>
                <li><Link to="/compiler" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Compiler</Link></li>
                <li><Link to="/about" style={{ color: '#cbd5e1', textDecoration: 'none' }}>About</Link></li>
              </ul>
            </div>
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 8 }}>Account</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
                <li><Link to="/student/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Sign in (Student)</Link></li>
                <li><Link to="/student/register" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Create account</Link></li>
                <li><Link to="/instructor/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Sign in (Instructor)</Link></li>
              </ul>
            </div>
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 8 }}>Help</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
                <li><Link to="/contact" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Contact</Link></li>
                <li><Link to="/terms" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Terms</Link></li>
                <li><Link to="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div style={{ marginTop: 18, borderTop: '1px solid rgba(148,163,184,0.2)', paddingTop: 10, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
            © {new Date().getFullYear()} AlgoAuth. All rights reserved.
          </div>
        </Container>
      </footer>

      {/* Scoped responsive styles */}
      <style>
        {`
          @media (max-width: 1100px) {
            section > div { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 900px) {
            /* Explore Topics grid: 3 columns on tablets */
            section:nth-of-type(2) div div[style*='grid-template-columns: repeat(6'] { grid-template-columns: repeat(3, minmax(160px,1fr)) !important; }
          }
          @media (max-width: 600px) {
            /* Explore Topics grid: 2 columns on phones */
            section:nth-of-type(2) div div[style*='grid-template-columns: repeat(6'] { grid-template-columns: repeat(2, minmax(160px,1fr)) !important; }
          }
        `}
      </style>
    </div>
  );
};

export default Home;
