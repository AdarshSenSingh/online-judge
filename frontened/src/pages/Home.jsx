import React from "react";
import { Link } from "react-router-dom";
import home_img from "../assets/home.png";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-content-wrapper" style={{ fontSize: '2.28rem', lineHeight: '1.72' }}>
      {/* Hero Section */}
      <section className="student-hero">
        <div className="container student-hero-grid">
          <div className="student-hero-content">
            <h1 className="student-hero-head">Welcome to <span className="brand-color">CodeKaro.com</span></h1>
            <p className="student-hero-desc">
              Elevate your coding skills with secure, AI-powered assessments.<br/>
              Ready to learn, practice and succeed in technical skill tests with instant feedback?
            </p>
            <div className="flash-card-row">
              {/* Student Flash Card */}
              <div className="flash-card flash-card-student">
                <div className="flash-card-icon">🎓</div>
                <div className="flash-card-title">Students</div>
                <div className="flash-card-desc">Practice, compete, and get instant AI support for coding skills and real assessments.</div>
                <div className="role-cta-btns">
                  <Link to="/student/register" className="btn primary-btn">Student Signup</Link>
                  <Link to="/student/login" className="btn secondary-btn">Student Login</Link>
                </div>
              </div>
              {/* Instructor Flash Card */}
              <div className="flash-card flash-card-instructor">
                <div className="flash-card-icon">👩‍🏫</div>
                <div className="flash-card-title">Instructors</div>
                <div className="flash-card-desc">Automate grading, manage tests, get AI analytics and save hours every week.</div>
                <div className="role-cta-btns">
                  <Link to="/instructor/register" className="btn primary-btn">Instructor Signup</Link>
                  <Link to="/instructor/login" className="btn secondary-btn">Instructor Login</Link>
                </div>
              </div>
            </div>
            <p className="student-hero-mini">Trusted by students & companies for accurate, AI-driven code evaluation.</p>
          </div>
          <div className="student-hero-imgwrap">
            <img src={home_img} alt="Online Judge" className="student-hero-img" />
          </div>
        </div>
      </section>

      {/* Student Benefits Section */}
      <section className="student-benefits-section">
        <div className="container">
          <h2 className="section-title">Why You’ll Love Algol-Jniversity</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">🚀</span>
              <h3>AI Code Correction</h3>
              <p>Get instant feedback and smart hints on your code, powered by integrated AI.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🛡️</span>
              <h3>Secure Online Judge</h3>
              <p>Your code runs in safe, cloud-powered Docker containers – just focus on coding.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🕒</span>
              <h3>Fast Grading</h3>
              <p>Solutions auto-graded in seconds – no need to wait for manual reviews.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">📈</span>
              <h3>Progress Tracking</h3>
              <p>See all your solved problems and test cases at a glance.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">📚</span>
              <h3>Real Practice Problems</h3>
              <p>Over 40 diverse, real-world problems and tests to level up your coding.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🤝</span>
              <h3>Instructor Support</h3>
              <p>Instant help and AI debugging tips to ensure your success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="student-how-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="how-it-steps">
            <div className="how-step">
              <span className="how-step-icon">1️⃣</span>
              <span className="how-step-text">Choose a problem or assessment</span>
            </div>
            <div className="how-step">
              <span className="how-step-icon">2️⃣</span>
              <span className="how-step-text">Write code in the built-in editor</span>
            </div>
            <div className="how-step">
              <span className="how-step-icon">3️⃣</span>
              <span className="how-step-text">Submit and get instant AI feedback</span>
            </div>
            <div className="how-step">
              <span className="how-step-icon">4️⃣</span>
              <span className="how-step-text">See your score and history</span>
            </div>
          </div>
        </div>
      </section>

      {/* Success/Testimonial Section */}
      <section className="student-testimonials">
        <div className="container">
          <h2 className="section-title">What Students Say</h2>
          <div className="testimonial-row">
            <div className="testimonial-card">
              <span className="testimonial-quote">“The AI hints helped me debug faster and learn!”</span>
              <span className="testimonial-by">- Rahul K., B.Tech, Algol-Jniversity</span>
            </div>
            <div className="testimonial-card">
              <span className="testimonial-quote">“Loved the instant grading! My interview prep was so much easier.”</span>
              <span className="testimonial-by">- Priya S., Final Year Student</span>
            </div>
            <div className="testimonial-card">
              <span className="testimonial-quote">“Saved our instructors hours each week.”</span>
              <span className="testimonial-by">- Dr. Verma, CS Dept Faculty</span>
            </div>
          </div>
        </div>
      </section>
    
      <footer className="site-footer">
        <div className="container">
          <div className="grid-four-cols">
            <div className="footer-col">
              <h4>Algol-Jniversity</h4>
              <p>Your modern platform for secure, AI-powered coding assessments and learning.</p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/problems">Problems</Link></li>
                <li><Link to="/compiler">Compiler</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <div className="social-links">
                <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="social-icon">GitHub</a>
                <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="social-icon">LinkedIn</a>
                <a href="mailto:info@algol-jniversity.edu" className="social-icon">Email</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} CodeKaro. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
      );
      };
      
      export default Home;