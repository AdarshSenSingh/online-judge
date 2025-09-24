// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../token/auth';
// import './Auth.css';
// import { Toaster, toast } from 'react-hot-toast';

// export default function StudentLogin() {
//     const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '', sentOtp: '' });
//     const [showPassword, setShowPassword] = useState(false);
//     const [otpMode, setOtpMode] = useState(false);
//     const [showOtp, setShowOtp] = useState(false);
//     const [otpSuccess, setOtpSuccess] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();
//     const { storeTokenInLS } = useAuth();

//     const handleChange = (e) => {
//         setForm(f => ({ ...f, [e.target.name]: e.target.value }));
//     };
//     const handleSendOtp = async (e) => {
//         e.preventDefault();
//         setShowOtp(true);
//         setOtpSuccess(false);
//         try {
//             const res = await fetch('http://localhost:5000/auth/send-otp', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ phone: form.phone })
//             });
//             const data = await res.json();
//             if (data.status) {
//                 toast.success('OTP sent successfully!');
//             } else {
//                 toast.error(data.msg || 'Could not send OTP.');
//                 setShowOtp(false);
//             }
//         } catch (err) {
//             toast.error('Could not send OTP.');
//             setShowOtp(false);
//         }
//     };
//     const handleVerifyOtp = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             const res = await fetch('http://localhost:5000/auth/login-otp', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ phone: form.phone, otp: form.otp })
//             });
//             const data = await res.json();
//             if (data.status) {
//                 setOtpSuccess(true);
//                 // store token for cross-tab/session login
//                 if (data.token) storeTokenInLS(data.token);
//                 toast.success('Logged in with OTP!');
//                 setTimeout(() => {
//                     navigate('/student/dashboard', { replace: true });
//                 }, 1200);
//             } else {
//                 // filter out registration-specific errors during login
//                 let errMsg = data.msg || 'Invalid OTP.';
//                 if (errMsg.toLowerCase().includes('already registered')) {
//                     errMsg = 'Invalid OTP or not registered.';
//                 }
//                 toast.error(errMsg);
//                 setOtpSuccess(false);
//             }
//         } catch (err) {
//             toast.error('OTP login failed.');
//             setOtpSuccess(false);
//         }
//         setLoading(false);
//     };
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             const res = await fetch('http://localhost:5000/auth/login', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email: form.email, password: form.password })
//             });
//             const data = await res.json();
//             if (data.status) {
//                 // store token for cross-tab/session login
//                 if (data.token) storeTokenInLS(data.token);
//                 toast.success('Login successful! Welcome ' + (data.student?.firstName || 'Student'));
//                 setTimeout(() => {
//                   navigate('/student/dashboard', { replace: true });
//                 }, 1200); // Allows toast to show for a moment before navigating
//             } else {
//                 // filter out registration-specific errors during login
//                 let errMsg = data.msg || 'Login failed.';
//                 if (errMsg.toLowerCase().includes('already registered')) {
//                     errMsg = 'Account not found. Please check your number or register first.';
//                 }
//                 toast.error(errMsg);
//             }
//         } catch {
//             toast.error('Failed to connect to server.');
//         }
//         setLoading(false);
//     };
//     return (
//         <section className="auth-section">
//             <Toaster position="top-right" />
//             <div className="auth-card">
//                 <h2 className="auth-title">Student Login</h2>
//                 <div style={{display:'flex',justifyContent:'center',marginBottom:14,gap:12}}>
//                   {!otpMode && (
//                     <button className="btn secondary-btn" type="button" onClick={() => setOtpMode(true)}>
//                       Login with OTP
//                     </button>
//                   )}
//                   {otpMode && (
//                     <button className="btn secondary-btn" type="button" onClick={() => setOtpMode(false)}>
//                       Login with Password
//                     </button>
//                   )}
//                 </div>
//                 {!otpMode && (
//                   <form onSubmit={handleSubmit}>
//                     <label>Email
//                         <input type="email" name="email" value={form.email} onChange={handleChange} required />
//                     </label>
//                     <label>Password
//                         <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required minLength={6} />
//                         <div style={{marginTop:'0.5em'}}>
//                           <input
//                             type="checkbox"
//                             id="showPasswordStudentLogin"
//                             checked={showPassword}
//                             onChange={()=>setShowPassword(sp=>!sp)}
//                             style={{marginRight:'7px'}}
//                           />
//                           <label htmlFor="showPasswordStudentLogin">Show password</label>
//                         </div>
//                     </label>
//                     <button className="btn primary-btn auth-btn" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
//                   </form>
//                 )}
//                 {otpMode && (
//                   <form onSubmit={otpSuccess ? undefined : handleVerifyOtp}>
//                     <label>Phone Number
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                         <input type="tel" name="phone" value={form.phone} onChange={handleChange} style={{ flex: 1 }} required />
//                         {!showOtp && (
//                           <button className="btn secondary-btn" style={{ padding: '0.5rem 1.2rem' }} onClick={handleSendOtp} type="button">Send OTP</button>
//                         )}
//                       </div>
//                       {showOtp && !otpSuccess && (<div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
//                         <input type="text" name="otp" placeholder="Enter OTP (1234)" value={form.otp} onChange={handleChange} maxLength={6} />
//                         <button type="button" className="btn auth-btn" style={{ padding: '0.6rem 1.3rem', fontSize: '1rem' }} onClick={handleVerifyOtp}>Verify & Login</button>
//                         {otpSuccess && <span style={{ color: 'green', fontWeight: 500, marginLeft: 8 }}>Logged in!</span>}
//                       </div>)}
//                       {otpSuccess && <span style={{ color: 'green', fontWeight: 500, marginLeft: 8 }}>Logged in!</span>}
//                     </label>
//                   </form>
//                 )}
//                 <div className="auth-links">Do not have an account? <Link to="/student/register">Register</Link></div>
//             </div>
//         </section>
//     );
// }

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../token/auth';
import './Auth.css';
import { Toaster, toast } from 'react-hot-toast';

export default function StudentLogin() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { storeTokenInLS } = useAuth();

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, password: form.password })
            });
            const data = await res.json();
            if (data.status) {
                // store token for cross-tab/session login
                if (data.token) storeTokenInLS(data.token);
                toast.success('Login successful! Welcome ' + (data.student?.firstName || 'Student'));
                setTimeout(() => {
                  navigate('/student/dashboard', { replace: true });
                }, 1200); // Allows toast to show for a moment before navigating
            } else {
                // filter out registration-specific errors during login
                let errMsg = data.msg || 'Login failed.';
                if (errMsg.toLowerCase().includes('already registered')) {
                    errMsg = 'Account not found. Please check your number or register first.';
                }
                toast.error(errMsg);
            }
        } catch {
            toast.error('Failed to connect to server.');
        }
        setLoading(false);
    };
    return (
        <section className="auth-section">
            <Toaster position="top-right" />
            <div className="auth-card">
                <h2 className="auth-title">Student Login</h2>
                <form onSubmit={handleSubmit}>
                    <label>Email
                        <input type="email" name="email" value={form.email} onChange={handleChange} required />
                    </label>
                    <label>Password
                        <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required minLength={6} />
                        <div style={{marginTop:'0.5em'}}>
                          <input
                            type="checkbox"
                            id="showPasswordStudentLogin"
                            checked={showPassword}
                            onChange={()=>setShowPassword(sp=>!sp)}
                            style={{marginRight:'7px'}}
                          />
                          <label htmlFor="showPasswordStudentLogin">Show password</label>
                        </div>
                    </label>
                    <button className="btn primary-btn auth-btn" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                </form>
                <div className="auth-links">Do not have an account? <Link to="/student/register">Register</Link></div>
            </div>
        </section>
    );
}