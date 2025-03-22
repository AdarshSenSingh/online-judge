import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../token/auth';
import './Services.css';

const Services = () => {
  const { isLogin } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isLogin) {
      navigate('/problems');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="services-container">
      <div className="services-header">
        <h1 className="services-title">Our Services</h1>
        <p className="services-subtitle">
          Explore our comprehensive range of coding and development services designed to help you excel in your programming journey.
        </p>
      </div>

      <div className="services-grid">
        <div className="service-card">
          <div className="service-icon">🧩</div>
          <h3 className="service-title">Algorithm Practice</h3>
          <p className="service-description">
            Sharpen your problem-solving skills with our curated collection of algorithmic challenges ranging from easy to advanced levels.
          </p>
        </div>

        <div className="service-card">
          <div className="service-icon">🚀</div>
          <h3 className="service-title">Coding Competitions</h3>
          <p className="service-description">
            Test your skills against other developers in our regular coding competitions with real-time leaderboards and exciting prizes.
          </p>
        </div>

        <div className="service-card">
          <div className="service-icon">📚</div>
          <h3 className="service-title">Learning Resources</h3>
          <p className="service-description">
            Access comprehensive tutorials, articles, and video lessons covering fundamental to advanced programming concepts.
          </p>
        </div>

        <div className="service-card">
          <div className="service-icon">👥</div>
          <h3 className="service-title">Community Support</h3>
          <p className="service-description">
            Join our vibrant community of developers to share knowledge, collaborate on projects, and get help when you're stuck.
          </p>
        </div>

        <div className="service-card">
          <div className="service-icon">🔍</div>
          <h3 className="service-title">Code Review</h3>
          <p className="service-description">
            Get constructive feedback on your code from experienced developers to improve your coding style and efficiency.
          </p>
        </div>

        <div className="service-card">
          <div className="service-icon">🏆</div>
          <h3 className="service-title">Skill Certification</h3>
          <p className="service-description">
            Earn certificates by completing challenges and assessments to showcase your programming proficiency to employers.
          </p>
        </div>
      </div>

      <div className="cta-section">
        <h2 className="cta-title">Ready to Level Up Your Coding Skills?</h2>
        <p className="cta-description">
          Join thousands of developers who have accelerated their programming journey with our platform. Start solving problems today!
        </p>
        <button className="cta-button" onClick={handleGetStarted}>
          Get Started Now
        </button>
      </div>
    </div>
  );
};

export default Services;


