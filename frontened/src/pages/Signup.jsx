import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import './Signup.css';
import img from "../assets/register.png";
import toast from "react-hot-toast";

const Signup = () => {
  const [user, setUser] = useState({
    user_name: "",
    email: "",
    mobile_no: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    if (name === "mobile_no") {
      // Only allow numbers and ensure the length is not more than 10
      if (/^\d*$/.test(value) && value.length <= 10) {
        setUser({ ...user, [name]: value });
      }
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const errorfunction = () => {
    toast.error("Enter Valid details", {
      position: "top-center",
      className: "custom-font",
    });
  };

  // handle form on submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if environment variable is defined
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const url_1 = `${backendUrl}/auth`;
      
      console.log(`Attempting to connect to: ${url_1}/register`);
      
      const response = await fetch(`${url_1}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      
      if (response.ok) {
        toast.success("User Register Successfully", { position: 'top-right' });
        const res_data = await response.json();
        console.log(`res from register server`, res_data);
        setUser({
          user_name: "",
          email: "",
          mobile_no: "",
          password: "",
        });
        navigate("/login");
      } else {
        const errorData = await response.json();
        toast.error(errorData.msg || "Registration failed", {
          position: "top-center",
          className: "custom-font",
        });
      }
    } catch (error) {
      console.log({ "error inside the register portion": error });
      toast.error("Server connection failed. Please check if the backend server is running.", {
        position: "top-center",
        className: "custom-font",
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
                  alt="a nurse with a cute look"
                  width="400"
                  height="400"
                />
              </div>
              {/* our main registration code  */}
              <div className="registration-form">
                <h1 className="main-heading mb-3">Registration form</h1>
                <br />
                <form onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="user_name">Username</label>
                    <input
                      type="text"
                      name="user_name"
                      value={user.user_name}
                      onChange={handleInput}
                      placeholder="Username"
                    />
                  </div>
                  <div>
                    <label htmlFor="email">Email</label>
                    <input
                      type="text"
                      name="email"
                      value={user.email}
                      onChange={handleInput}
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label htmlFor="mobile_no">Mobile No</label>
                    <input
                      type="text"
                      name="mobile_no"
                      value={user.mobile_no}
                      onChange={handleInput}
                      placeholder="Mobile"
                      maxLength="10"
                      className="no-spinner"
                    />
                  </div>
                  <div>
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={user.password}
                      onChange={handleInput}
                      placeholder="Password"
                    />
                  </div>
                  <br />
                  <button type="submit" className="btn btn-submit">
                    Register Now
                  </button>
                </form>
                <div className="tologin">
                  <p>Already Registered!</p>
                  <NavLink to="/login">Login here</NavLink>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>
    </>
  );
};

export default Signup;

