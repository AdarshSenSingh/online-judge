import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import "./Navbar.css";
import { useAuth } from '../token/auth';

const Navbar = () => {
    const { isLogin } = useAuth();
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
                            <li><NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink></li>
                            <li><NavLink to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</NavLink></li>
                            <li><NavLink to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</NavLink></li>

                            {isLogin ? (
                                <>
                                    <li><NavLink to="/problems" onClick={() => setIsMobileMenuOpen(false)}>Problems</NavLink></li>
                                    <li><NavLink to="/compiler" onClick={() => setIsMobileMenuOpen(false)}>Compiler</NavLink></li>
                                    <li><NavLink to="/logout" className="nav-btn logout-btn" onClick={() => setIsMobileMenuOpen(false)}>Logout</NavLink></li>
                                </>
                            ) : (
                                <>
                                    <li><NavLink to="/register" className="nav-btn signup-btn" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</NavLink></li>
                                    <li><NavLink to="/login" className="nav-btn login-btn" onClick={() => setIsMobileMenuOpen(false)}>Login</NavLink></li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </header>
        </>
    );
};

export default Navbar;
