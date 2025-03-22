import home_img from "../assets/home.png";
import "./Home.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [headingPosition, setHeadingPosition] = useState(0);
  const headingText = "Welcome to CodeKaro.com";
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHeadingPosition(prev => (prev + 1) % 20);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <main>
        <section className="section-hero">
          <div className="container grid grid-two-cols">
            {/* Left margin decoration */}
            <div className="left-margin-decoration">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            
            <div className="hero-content">
              <p className="tagline">I am a full-stack developer!</p>
              <h1 className="moving-heading" style={{ transform: `translateX(${headingPosition}px)` }}>
                {headingText}
              </h1>
              <p className="hero-description">
                Are you ready to brush up your coding skills and push your practice to the peak?
                Join our platform to solve challenging problems and improve your algorithmic thinking.
              </p>
              <div className="btn-group">
                <Link to="/contact">
                  <button className="btn primary-btn">Contact Me</button>
                </Link>
                <Link to="/learn-more">
                  <button className="btn secondary-btn">Learn More</button>
                </Link>
              </div>
              <div className="features-preview">
                <div className="feature-box">
                  <span className="feature-icon">🚀</span>
                  <span className="feature-text">100+ Coding Problems</span>
                </div>
                <div className="feature-box">
                  <span className="feature-icon">⏱️</span>
                  <span className="feature-text">Real-time Compiler</span>
                </div>
                <div className="feature-box">
                  <span className="feature-icon">🏆</span>
                  <span className="feature-text">Track Your Progress</span>
                </div>
              </div>
            </div>

            <div className="hero-image">
              <img
                src={home_img}
                alt="coding together"
                width="400"
                height="500"
              />
            </div>
          </div>
          <div className="wave-divider">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
            </svg>
          </div>
        </section>

        <section className="section-features">
          <div className="container">
            <h2 className="section-title">Why Choose CodeKaro?</h2>
            <div className="grid grid-three-cols">
              <div className="feature-card">
                <div className="feature-icon">💻</div>
                <h3>Interactive Coding</h3>
                <p>Write, compile, and test your code directly in the browser with our powerful online compiler.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h3>Diverse Problem Set</h3>
                <p>From easy to hard, our problems cover various algorithms and data structures to enhance your skills.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Performance Tracking</h3>
                <p>Monitor your progress, see your submission history, and identify areas for improvement.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="grid grid-four-cols">
            <div className="footer-col">
              <h4>CodeKaro</h4>
              <p>Your platform for coding practice and algorithmic challenges.</p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Features</h4>
              <ul>
                <li><Link to="/problems">Problems</Link></li>
                <li><Link to="/compiler">Compiler</Link></li>
                <li><Link to="/result">Results</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <div className="social-links">
                <a href="https://github.com/AdarshSenSingh" target="_blank" rel="noopener noreferrer" className="social-icon">GitHub</a>
                <a href="https://www.linkedin.com/in/adarsh-sen-singh-0a8254256/" target="_blank" rel="noopener noreferrer" className="social-icon">LinkedIn</a>
                <a href="https://x.com/AdarshSenS31360" target="_blank" rel="noopener noreferrer" className="social-icon">Twitter</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} CodeKaro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;


