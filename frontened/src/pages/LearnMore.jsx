import React from 'react';
import { Link } from 'react-router-dom';
import './LearnMore.css';

const LearnMore = () => {
  return (
    <div className="learn-more-container">
      <div className="learn-more-header">
        <h1 className="learn-more-title">Our Learning Platform</h1>
        <p className="learn-more-subtitle">
          Discover how our platform can help you master coding and algorithms
        </p>
      </div>

      <div className="learn-more-content">
        <section className="platform-features">
          <h2>Platform Features</h2>
          <ul className="features-list">
            <li>
              <span className="feature-icon">🧩</span>
              <div>
                <h3>Curated Problem Sets</h3>
                <p>Practice with problems organized by difficulty and topic</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">⚡</span>
              <div>
                <h3>Online Compiler</h3>
                <p>Code and test your solutions in multiple programming languages</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">📊</span>
              <div>
                <h3>Progress Tracking</h3>
                <p>Monitor your improvement with detailed submission history</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">📚</span>
              <div>
                <h3>Learning Resources</h3>
                <p>Access tutorials, articles, and videos on key programming concepts</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">👥</span>
              <div>
                <h3>Community Support</h3>
                <p>Connect with fellow coders to discuss solutions and share knowledge</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🏆</span>
              <div>
                <h3>Coding Competitions</h3>
                <p>Participate in regular contests to test your skills against others</p>
              </div>
            </li>
          </ul>
        </section>

        <section className="learning-paths">
          <h2>Learning Paths</h2>
          <div className="paths-grid">
            <div className="path-card">
              <div className="path-header beginner">
                <h3>Beginner</h3>
              </div>
              <ul className="path-content">
                <li>Programming basics</li>
                <li>Simple data structures</li>
                <li>Basic algorithms</li>
                <li>Problem-solving techniques</li>
              </ul>
            </div>
            
            <div className="path-card">
              <div className="path-header intermediate">
                <h3>Intermediate</h3>
              </div>
              <ul className="path-content">
                <li>Advanced data structures</li>
                <li>Sorting and searching</li>
                <li>Dynamic programming</li>
                <li>Graph algorithms</li>
              </ul>
            </div>
            
            <div className="path-card">
              <div className="path-header advanced">
                <h3>Advanced</h3>
              </div>
              <ul className="path-content">
                <li>Complex algorithms</li>
                <li>Optimization techniques</li>
                <li>System design</li>
                <li>Competitive programming</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="testimonials">
          <h2>What Our Users Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p>"This platform helped me prepare for technical interviews and land my dream job!"</p>
              <div className="testimonial-author">- Sarah K., Software Engineer</div>
            </div>
            <div className="testimonial-card">
              <p>"The structured approach to learning algorithms transformed my problem-solving skills."</p>
              <div className="testimonial-author">- Michael T., CS Student</div>
            </div>
            <div className="testimonial-card">
              <p>"I love how I can track my progress and see my improvement over time."</p>
              <div className="testimonial-author">- Priya M., Web Developer</div>
            </div>
          </div>
        </section>
      </div>

      <div className="learn-more-cta">
        <h2>Ready to start your coding journey?</h2>
        <div className="cta-buttons">
          <Link to="/register" className="cta-button primary">Sign Up Now</Link>
          <Link to="/problems" className="cta-button secondary">Browse Problems</Link>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;
