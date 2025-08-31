import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const SUBJECTS = [
  "Mathematics", "Physics", "Programming", "Data Science", "Engineering", "AI", "ML", "Statistics", "Other"
];

export default function InstructorRegister() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    phoneVerified: false,
    otp: '',
    sentOtp: '',
    subject: '',
    otherSubject: '',
    qualifications: null,
    experience: '',
    bio: '',
    portfolio: '',
    idDocument: null,
  });
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  function handleChange(e) {
    const { name, value, type, files } = e.target;
    if (name === "qualifications" || name === "idDocument") {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }
  function handleSendOtp(e) {
    e.preventDefault();
    setShowOtp(true);
    setForm(f => ({ ...f, sentOtp: '1234' }));
    setOtpSuccess(false);
  }
  function handleVerifyOtp(e) {
    e.preventDefault();
    if(form.otp === form.sentOtp && form.otp !== '') {
      setForm(f => ({ ...f, phoneVerified: true }));
      setOtpSuccess(true);
      setError('');
    } else {
      setError('Invalid OTP entered.');
      setOtpSuccess(false);
    }
  }
  function handleSubmit(e) {
    e.preventDefault();
    // Send data to backend here, for now just frontend
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <h2 className="auth-title">Instructor Signup</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div style={{ display: 'flex', gap: '1.2rem' }}>
            <label style={{ flex: 1 }}>First Name
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required autoFocus />
            </label>
            <label style={{ flex: 1 }}>Last Name
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
            </label>
          </div>
          <label>Email Address
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>Password
            <input type="password" name="password" value={form.password} onChange={handleChange} minLength={6} required />
          </label>
          <label>Phone Number
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} style={{ flex: 1 }} required={!form.phoneVerified}/>
              {!form.phoneVerified && !showOtp &&
                <button className="btn secondary-btn" style={{ padding: '0.6rem 1.3rem' }} onClick={handleSendOtp} type="button">Verify via OTP</button>
              }
              {form.phoneVerified && <span style={{ color: 'green', fontWeight: 700, marginLeft: 5 }}>Verified</span>}
            </div>
            {showOtp && !form.phoneVerified && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <input type="text" name="otp" placeholder="Enter OTP (1234)" value={form.otp} onChange={handleChange} maxLength={6} />
                <button type="button" className="btn auth-btn" style={{ padding: '0.7rem 1.3rem', fontSize: '1rem' }} onClick={handleVerifyOtp}>Verify</button>
                {otpSuccess && <span style={{ color: 'green', fontWeight: 500, marginLeft: 8 }}>Verified!</span>}
              </div>
            )}
          </label>
          <label>Expertise/Subject
            <select name="subject" value={form.subject} onChange={handleChange} required>
              <option value="" disabled>Select a subject</option>
              {SUBJECTS.map(s => <option value={s} key={s}>{s}</option>)}
            </select>
            {form.subject === 'Other' && (
              <input type="text" name="otherSubject" value={form.otherSubject} onChange={handleChange} style={{ marginTop: 8 }} placeholder="Please specify other subject" />
            )}
          </label>
          <label>Qualifications (degrees/certifications, upload, optional)
            <input type="file" name="qualifications" accept="application/pdf,image/*" onChange={handleChange}/>
          </label>
          <label>Years of Experience
            <input type="number" name="experience" value={form.experience} min={0} max={60} onChange={handleChange} />
          </label>
          <label>Short Bio / Introduction
            <textarea name="bio" rows={3} maxLength={350} value={form.bio} onChange={handleChange}/>
          </label>
          <label>Portfolio / Website / LinkedIn (optional)
            <input type="url" name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="https://" />
          </label>
          <label>ID Verification Document (optional)
            <input type="file" name="idDocument" accept="application/pdf,image/*" onChange={handleChange}/>
          </label>
          <button className="btn primary-btn auth-btn" type="submit">Sign Up</button>
        </form>
        <div className="auth-links">Already have an account? <Link to="/instructor/login">Login</Link></div>
      </div>
    </section>
  );
}
