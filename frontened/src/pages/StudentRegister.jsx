import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { Toaster, toast } from 'react-hot-toast';

export default function StudentRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    phoneVerified: false,
    otp: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  // OTP resend logic
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const resendInterval = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setShowOtp(true);
    setOtpSuccess(false);
    setResendDisabled(true);
    setResendTimer(60); // 1 minute countdown
    if (resendInterval.current) clearInterval(resendInterval.current);
    resendInterval.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(resendInterval.current);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await fetch('http://localhost:5000/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, email: form.email })
      });
      const data = await res.json();
      if (data.status) {
        toast.success('OTP sent successfully!');
      } else {
        toast.error(data.msg || 'Could not send OTP.');
        setShowOtp(false);
        if (resendInterval.current) clearInterval(resendInterval.current);
        setResendDisabled(false);
      }
    } catch (err) {
      toast.error('Could not send OTP.');
      setShowOtp(false);
      if (resendInterval.current) clearInterval(resendInterval.current);
      setResendDisabled(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, otp: form.otp })
      });
      const data = await res.json();
      if (data.status) {
        setForm(f => ({ ...f, phoneVerified: true }));
        setOtpSuccess(true);
        toast.success('Phone number verified!');
      } else {
        toast.error(data.msg || 'Invalid OTP entered.');
        setOtpSuccess(false);
      }
    } catch (err) {
      toast.error('Failed to verify OTP.');
      setOtpSuccess(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      phone: form.phone,
      phoneVerified: form.phoneVerified,
      location: form.location
    };
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.status) {
        toast.success('Registration successful! Welcome, ' + (data.student?.firstName || 'Student') + '.');
        // Optionally reset form here
        // setForm({firstName: '', lastName: '', email: '', password: '', phone: '', phoneVerified: false, otp: '', sentOtp: '', location: '' });
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 1000);
      } else {
        toast.error(data.msg || 'Registration failed.');
      }
    } catch (err) {
      toast.error('Registration failed. Unable to connect to server.');
    }
    setLoading(false);
  }

  // Clear interval if unmounting
  useEffect(() => {
    return () => {
      if (resendInterval.current) clearInterval(resendInterval.current);
    }
  }, []);

  return (
    <section className="auth-section">
      <Toaster position="top-right" />
      <div className="auth-card">
        <h2 className="auth-title">Student Signup</h2>
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
            <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} minLength={6} required />
            <div style={{marginTop:'0.5em'}}>
              <input
                type="checkbox"
                id="showPasswordStudentRegister"
                checked={showPassword}
                onChange={() => setShowPassword(sp => !sp)}
                style={{marginRight:'7px'}}
              />
              <label htmlFor="showPasswordStudentRegister">Show password</label>
            </div>
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
              <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems:'center' }}>
                <input type="text" name="otp" placeholder="Enter OTP" value={form.otp} onChange={handleChange} maxLength={6} />
                <button type="button" className="btn auth-btn" style={{ padding: '0.7rem 1.3rem', fontSize: '1rem' }} onClick={handleVerifyOtp}>Verify</button>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap: '5px'}}> 
                  <button
                    className="btn secondary-btn"
                    style={{ padding: '0.3rem 1.1rem', fontSize: '0.95rem' }}
                    onClick={handleSendOtp}
                    type="button"
                    disabled={resendDisabled}
                  >Resend OTP</button>
                  {resendDisabled && (
                    <span className="otp-timer">Resend available in <b>{String(Math.floor(resendTimer/60)).padStart(2,'0')}:{String(resendTimer%60).padStart(2,'0')}</b></span>
                  )}
                </div>
                {otpSuccess && <span style={{ color: 'green', fontWeight: 500, marginLeft: 8 }}>Verified!</span>}
              </div>
            )}
          </label>
          <label>Location (City, Country)
            <input type="text" name="location" value={form.location} placeholder="e.g. Mumbai, India" onChange={handleChange} />
          </label>
          <button className="btn primary-btn auth-btn" type="submit" disabled={loading}>{loading ? 'Signing Up...' : 'Sign Up'}</button>
        </form>
        <div className="auth-links">Already have an account? <Link to="/student/login">Login</Link></div>
      </div>
    </section>
  );
}
