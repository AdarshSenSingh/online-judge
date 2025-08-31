import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function InstructorLogin() {
    const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '', sentOtp: '' });
    const [error, setError] = useState('');
    const [otpMode, setOtpMode] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otpSuccess, setOtpSuccess] = useState(false);
    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };
    const handleSendOtp = (e) => {
        e.preventDefault();
        setShowOtp(true);
        setForm(f => ({ ...f, sentOtp: '1234' }));
        setOtpSuccess(false);
    };
    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (form.otp === form.sentOtp && form.otp !== '') {
            setOtpSuccess(true);
            setError('');
        } else {
            setError('Invalid OTP.');
            setOtpSuccess(false);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // In password mode: POST to /api/instructor/login
        // In OTP mode: POST /api/instructor/otp-verify
    };
    return (
        <section className="auth-section">
            <div className="auth-card">
                <h2 className="auth-title">Instructor Login</h2>
                {error && <div className="auth-error">{error}</div>}
                <div style={{display:'flex',justifyContent:'center',marginBottom:14,gap:12}}>
                  {!otpMode && (
                    <button className="btn secondary-btn" type="button" onClick={() => setOtpMode(true)}>
                      Login with OTP
                    </button>
                  )}
                  {otpMode && (
                    <button className="btn secondary-btn" type="button" onClick={() => setOtpMode(false)}>
                      Login with Password
                    </button>
                  )}
                </div>
                {!otpMode && (
                  <form onSubmit={handleSubmit}>
                    <label>Email
                        <input type="email" name="email" value={form.email} onChange={handleChange} required />
                    </label>
                    <label>Password
                        <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
                    </label>
                    <button className="btn primary-btn auth-btn" type="submit">Login</button>
                  </form>
                )}
                {otpMode && (
                  <form onSubmit={otpSuccess ? undefined : handleVerifyOtp}>
                    <label>Phone Number
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input type="tel" name="phone" value={form.phone} onChange={handleChange} style={{ flex: 1 }} required />
                        {!showOtp && (
                          <button className="btn secondary-btn" style={{ padding: '0.5rem 1.2rem' }} onClick={handleSendOtp} type="button">Send OTP</button>
                        )}
                      </div>
                      {showOtp && !otpSuccess && (<div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <input type="text" name="otp" placeholder="Enter OTP (1234)" value={form.otp} onChange={handleChange} maxLength={6} />
                        <button type="button" className="btn auth-btn" style={{ padding: '0.6rem 1.3rem', fontSize: '1rem' }} onClick={handleVerifyOtp}>Verify & Login</button>
                        {otpSuccess && <span style={{ color: 'green', fontWeight: 500, marginLeft: 8 }}>Logged in!</span>}
                      </div>)}
                      {otpSuccess && <span style={{ color: 'green', fontWeight: 500, marginLeft: 8 }}>Logged in!</span>}
                    </label>
                  </form>
                )}
                <div className="auth-links">Don't have an account? <Link to="/instructor/register">Register</Link></div>
            </div>
        </section>
    );
}
