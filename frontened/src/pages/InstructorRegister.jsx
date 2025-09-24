// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import './Auth.css';

// const SUBJECTS = [
//   "Mathematics", "Physics", "Programming", "Data Science", "Engineering", "AI", "ML", "Statistics", "Other"
// ];

// export default function InstructorRegister() {
//   const [form, setForm] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     phone: '',
//     phoneVerified: false,
//     otp: '',
//     sentOtp: '',
//     subject: '',
//     otherSubject: '',
//     qualifications: null,
//     experience: '',
//     bio: '',
//     portfolio: '',
//     idDocument: null,
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }
//   const [showOtp, setShowOtp] = useState(false);
//   const [otpSuccess, setOtpSuccess] = useState(false);

//   function handleChange(e) {
//     const { name, value, type, files } = e.target;
//     if (name === "qualifications" || name === "idDocument") {
//       setForm(f => ({ ...f, [name]: files[0] }));
//     } else {
//       setForm(f => ({ ...f, [name]: value }));
//     }
//   }
//   async function handleSendOtp(e) {
//     e.preventDefault();
//     setNotification(null);
//     setOtpSuccess(false);
//     try {
//       const res = await fetch("http://localhost:5000/auth/send-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone: form.phone })
//       });
//       const data = await res.json();
//       if (data.status) {
//         setShowOtp(true);
//         setForm(f => ({ ...f, sentOtp: '', otp: '' })); // clear any old OTP
//         setNotification({ type: 'success', message: data.msg || 'OTP sent successfully.' });
//       } else {
//         setNotification({ type: 'error', message: data.msg || "Failed to send OTP." });
//         setShowOtp(false);
//       }
//     } catch (err) {
//       setNotification({ type: 'error', message: "Network/Server error sending OTP" });
//       setShowOtp(false);
//       console.log("handleSendOtp error:", err);
//     }
//   }

//   async function handleVerifyOtp(e) {
//     e.preventDefault();
//     setNotification(null);
//     try {
//       const res = await fetch("http://localhost:5000/auth/verify-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone: form.phone, otp: form.otp })
//       });
//       const data = await res.json();
//       if (data.status) {
//         setForm(f => ({ ...f, phoneVerified: true }));
//         setOtpSuccess(true);
//         setNotification({ type: 'success', message: data.msg || 'OTP verified successfully.' });
//       } else {
//         setNotification({ type: 'error', message: data.msg || "OTP verification failed." });
//         setOtpSuccess(false);
//       }
//     } catch (err) {
//       setNotification({ type: 'error', message: "Network/Server error verifying OTP" });
//       setOtpSuccess(false);
//       console.log("handleVerifyOtp error:", err);
//     }
//   }
//   async function handleSubmit(e) {
//     e.preventDefault();
//     setNotification(null);
//     // Basic client validation
//     if (!form.phoneVerified) {
//       setNotification({ type: 'error', message: 'Please verify your phone number by OTP before registering.' });
//       return;
//     }
//     try {
//       const res = await fetch("http://localhost:5000/auth/instructor/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           firstName: form.firstName,
//           lastName: form.lastName,
//           email: form.email,
//           password: form.password,
//           phone: form.phone,
//           phoneVerified: true,
//           location: '',
//         }),
//       });
//       const data = await res.json();
//       if (data.status) {
//         setNotification({ type: 'success', message: data.msg || 'Registration successful! You may now log in.' });
//         // Optionally reset form here
//       } else {
//         setNotification({ type: 'error', message: data.msg || 'Registration failed.' });
//       }
//     } catch (err) {
//       setNotification({ type: 'error', message: 'Network/Server error during registration.' });
//       console.log("handleRegister error:", err);
//     }
//   }

//   return (
//     <section className="auth-section">
//       <div className="auth-card">
//         <h2 className="auth-title">Instructor Signup</h2>
//         {notification && (
//           <div style={{
//             color: notification.type === 'success' ? 'green' : 'red',
//             background: notification.type === 'success' ? '#eafce5' : '#fee',
//             border: `1.5px solid ${notification.type === 'success' ? 'green' : 'red'}`,
//             marginBottom: 16,
//             padding: '8px 13px',
//             borderRadius: 5,
//             fontWeight: 500
//           }}>{notification.message}</div>
//         )}
//         <form onSubmit={handleSubmit} encType="multipart/form-data">
//           <div style={{ display: 'flex', gap: '1.2rem' }}>
//             <label style={{ flex: 1 }}>First Name
//               <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required autoFocus />
//             </label>
//             <label style={{ flex: 1 }}>Last Name
//               <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
//             </label>
//           </div>
//           <label>Email Address
//             <input type="email" name="email" value={form.email} onChange={handleChange} required />
//           </label>
//           <label>Password
//             <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} minLength={6} required />
//             <div style={{marginTop:'0.5em'}}>
//               <input
//                 type="checkbox"
//                 id="showPasswordRegister"
//                 checked={showPassword}
//                 onChange={()=>setShowPassword(sp=>!sp)}
//                 style={{marginRight:'7px'}}
//               />
//               <label htmlFor="showPasswordRegister">Show password</label>
//             </div>
//           </label>
//           <label>Phone Number
//             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//               <input type="tel" name="phone" value={form.phone} onChange={handleChange} style={{ flex: 1 }} required={!form.phoneVerified}/>
//               {!form.phoneVerified && !showOtp &&
//                 <button className="btn secondary-btn" style={{ padding: '0.6rem 1.3rem' }} onClick={handleSendOtp} type="button">Verify via OTP</button>
//               }
//               {form.phoneVerified && <span style={{ color: 'green', fontWeight: 700, marginLeft: 5 }}>Verified</span>}
//             </div>
//             {showOtp && !form.phoneVerified && (
//               <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
//                 <input type="text" name="otp" placeholder="Enter OTP" value={form.otp} onChange={handleChange} maxLength={6} />
//                 <button type="button" className="btn auth-btn" style={{ padding: '0.7rem 1.3rem', fontSize: '1rem' }} onClick={handleVerifyOtp}>Verify</button>
//                 <button type="button" className="btn secondary-btn" style={{ padding: '0.6rem 1.1rem', fontSize: '1rem' }} onClick={handleSendOtp}>Resend OTP</button>
//                 {otpSuccess && <span style={{ color: 'green', fontWeight: 500, marginLeft: 8 }}>Verified!</span>}
//               </div>
//             )}
//           </label>
//           <label>Expertise/Subject
//             <select name="subject" value={form.subject} onChange={handleChange} required>
//               <option value="" disabled>Select a subject</option>
//               {SUBJECTS.map(s => <option value={s} key={s}>{s}</option>)}
//             </select>
//             {form.subject === 'Other' && (
//               <input type="text" name="otherSubject" value={form.otherSubject} onChange={handleChange} style={{ marginTop: 8 }} placeholder="Please specify other subject" />
//             )}
//           </label>
//           <label>Qualifications (degrees/certifications, upload, optional)
//             <input type="file" name="qualifications" accept="application/pdf,image/*" onChange={handleChange}/>
//           </label>
//           <label>Years of Experience
//             <input type="number" name="experience" value={form.experience} min={0} max={60} onChange={handleChange} />
//           </label>
//           <label>Short Bio / Introduction
//             <textarea name="bio" rows={3} maxLength={350} value={form.bio} onChange={handleChange}/>
//           </label>
//           <label>Portfolio / Website / LinkedIn (optional)
//             <input type="url" name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="https://" />
//           </label>
//           <label>ID Verification Document (optional)
//             <input type="file" name="idDocument" accept="application/pdf,image/*" onChange={handleChange}/>
//           </label>
//           <button className="btn primary-btn auth-btn" type="submit">Sign Up</button>
//         </form>
//         <div className="auth-links">Already have an account? <Link to="/instructor/login">Login</Link></div>
//       </div>
//     </section>
//   );
// }


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { Toaster, toast } from 'react-hot-toast';

const SUBJECTS = [
  "Mathematics", "Physics", "Programming", "Data Science", "Engineering", "AI", "ML", "Statistics", "Other"
];

export default function InstructorRegister() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        subject: '',
        otherSubject: '',
        qualifications: null,
        experience: '',
        bio: '',
        portfolio: '',
        idDocument: null,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value, files } = e.target;
        if (name === "qualifications" || name === "idDocument") {
            setForm(f => ({ ...f, [name]: files[0] }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('firstName', form.firstName);
        formData.append('lastName', form.lastName);
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('phone', form.phone);
        formData.append('subject', form.subject);
        formData.append('otherSubject', form.otherSubject);
        formData.append('experience', form.experience);
        formData.append('bio', form.bio);
        formData.append('portfolio', form.portfolio);
        if (form.qualifications) {
            formData.append('qualifications', form.qualifications);
        }
        if (form.idDocument) {
            formData.append('idDocument', form.idDocument);
        }

        try {
            const res = await fetch("http://localhost:5000/auth/instructor/register", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.status) {
                toast.success('Registration successful! Please log in.');
                setTimeout(() => {
                    navigate('/instructor/login', { replace: true });
                }, 1000);
            } else {
                toast.error(data.msg || 'Registration failed.');
            }
        } catch (err) {
            toast.error('Network/Server error during registration.');
            console.error("handleRegister error:", err);
        }
        setLoading(false);
    }

    return (
        <section className="auth-section">
            <Toaster position="top-right" />
            <div className="auth-card">
                <h2 className="auth-title">Instructor Signup</h2>
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
                        <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} minLength={6} required />
                        <div style={{marginTop:'0.5em'}}>
                          <input
                            type="checkbox"
                            id="showPasswordRegister"
                            checked={showPassword}
                            onChange={()=>setShowPassword(sp=>!sp)}
                            style={{marginRight:'7px'}}
                          />
                          <label htmlFor="showPasswordRegister">Show password</label>
                        </div>
                    </label>
                    <label>Phone Number
                        <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
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
                    <button className="btn primary-btn auth-btn" type="submit" disabled={loading}>{loading ? 'Signing Up...' : 'Sign Up'}</button>
                </form>
                <div className="auth-links">Already have an account? <Link to="/instructor/login">Login</Link></div>
            </div>
        </section>
    );
}