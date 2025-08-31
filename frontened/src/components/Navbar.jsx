import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import "./Navbar.css";
import { useAuth } from '../components/AuthProvider.jsx';

const Navbar = () => {
    const { isAuthenticated } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container header-container">
                    <div className="logo-brand">
                        <NavLink to="/">
                            <span className="logo-text">Algo</span>
                            <span className="logo-highlight">Auth</span>
                        </NavLink>
                    </div>
                    
                    <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>
                    
                    <nav className={`main-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                        <ul className="nav-links">
                            <li><NavLink to="/" className="nav-pill nav-pill-home" onClick={() => setIsMobileMenuOpen(false)}>🏠 Home</NavLink></li>
                            <li><NavLink to="/about" className="nav-pill nav-pill-about" onClick={() => setIsMobileMenuOpen(false)}>📖 About</NavLink></li>
                            <li><NavLink to="/contact" className="nav-pill nav-pill-contact" onClick={() => setIsMobileMenuOpen(false)}>✉️ Contact</NavLink></li>

                            {isAuthenticated ? (
                                <>
                                    <li><NavLink to="/problems" className="nav-pill nav-pill-problems" onClick={() => setIsMobileMenuOpen(false)}>📝 Problems</NavLink></li>
                                    <li><NavLink to="/compiler" className="nav-pill nav-pill-compiler" onClick={() => setIsMobileMenuOpen(false)}>💻 Compiler</NavLink></li>
                                    <li>
                                        <button className="nav-pill logout-btn" style={{marginLeft:'8px',color:'#e53935',background:'none',border:'none',fontWeight:700,cursor:'pointer'}} onClick={() => { setIsMobileMenuOpen(false); window.location.href = '/'; setTimeout(() => { window.location.reload(); }, 0); useAuth().logout(); }}>🚪 Logout</button>
                                    </li>
                                </>
                            ) : (
                                <></>
                            )}
                        </ul>
                    </nav>
                </div>
            </header>
        </>
    );
};

export default Navbar;
