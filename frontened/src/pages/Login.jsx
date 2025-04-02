import { useState } from "react";
import './Login.css';
import img from "../assets/register.png";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../token/auth.jsx";
import toast from "react-hot-toast";
import googleIcon from "../assets/google-icon.svg"; // Add this icon to your assets folder

const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { storeTokenInLS } = useAuth();

  const handleInput = (e) => {
    const { name, value } = e.target;

    setUser({
      ...user,
      [name]: value,
    });
  };

  // Google login handler
  const handleGoogleLogin = () => {
    // Get the backend URL from environment variables
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    // Redirect to Google auth endpoint
    window.location.href = `${backendUrl}/auth/google`;
  };

  // handle form on submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use environment variable without fallback
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const url_1 = `${backendUrl}/auth`;
      
      console.log(`Attempting to connect to: ${url_1}/login`);
      
      const response = await fetch(`${url_1}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        toast.success("Login Successfully", { position: 'top-right' });
        const data = await response.json();
        storeTokenInLS(data.token);

        setUser({
          email: "",
          password: "",
        });

        navigate("/problems");
      } else {
        const errorData = await response.json();
        toast.error(errorData.msg || "Login failed", {
          position: "top-center",
          className: "custom-toast",
        });
      }
    } catch (error) {
      console.error("Error while login:", error);
      toast.error("Server connection failed. Please check if the backend server is running.", {
        position: "top-center",
        className: "custom-toast",
      });
    }
  };

  return (
    <>
      <section>
        <main>
          <div className="section-registration">
            <div className="container grid grid-two-cols">
              <div className="registration-image reg-img">
                <img
                  src={img}
                  alt="login illustration"
                  width="400"
                  height="400"
                />
              </div>
              <div className="registration-form">
                <h1 className="main-heading">Welcome Back</h1>
                <p className="form-description">Sign in to continue your coding journey</p>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={user.email}
                      onChange={handleInput}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={user.password}
                      onChange={handleInput}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-submit">
                    Sign In
                  </button>
                </form>
                
                {/* Google login button */}
                <div className="social-login">
                  <p className="or-divider">OR</p>
                  <button 
                    onClick={handleGoogleLogin} 
                    className="google-login-btn"
                  >
                    <img src={googleIcon} alt="Google" className="google-icon" />
                    Sign in with Google
                  </button>
                </div>
                
                <div className="tosignup">
                  <p>Do not have an account?</p>
                  <NavLink to="/register">Create Account</NavLink>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>
    </>
  );
};

export default Login;



