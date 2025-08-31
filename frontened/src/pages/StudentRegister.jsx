import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function StudentRegister() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    phoneVerified: false,
    otp: '',
    sentOtp: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function handleSendOtp(e) {
    e.preventDefault();
    // In real app, send OTP here. For demo, generate a mock OTP (1234)
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
        <h2 className="auth-title">Student Signup</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
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
          <label>Location (City, Country)
            <input type="text" name="location" value={form.location} placeholder="e.g. Mumbai, India" onChange={handleChange} />
          </label>
          <button className="btn primary-btn auth-btn" type="submit">Sign Up</button>
        </form>
        <div className="auth-links">Already have an account? <Link to="/student/login">Login</Link></div>
      </div>
    </section>
  );
}
