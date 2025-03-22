
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-card">
        <h2>Contact Us</h2>
        <div className="contact-item">
          <h3>Phone</h3>
          <a href="tel:9140662764" className="contact-link">9140662764</a>
        </div>
        <div className="contact-item">
          <h3>Email</h3>
          <a href="mailto:adarshsensingh@gmail.com" className="contact-link">adarshsensingh@gmail.com</a>
        </div>
      </div>
    </div>
  );
}

export default Contact;
