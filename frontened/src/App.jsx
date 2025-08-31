import Home from "./pages/Home";
import Navbar from './components/Navbar';
import Compiler from './pages/Compiler';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import About from './pages/About';
import Contact from './pages/Contact';
import Userdata from "./components/getUser/Userdata";
import Add from "./components/addUser/Add";
import Edit from "./components/updateUser/Edit";
import Services from "./pages/Services";
import Result from "./pages/Result";
import LearnMore from './pages/LearnMore';
import GoogleAuthHandler from './pages/GoogleAuthHandler';
import StudentRegister from './pages/StudentRegister';
import StudentLogin from './pages/StudentLogin';
import InstructorRegister from './pages/InstructorRegister';
import InstructorLogin from './pages/InstructorLogin';

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          {/* Role-based auth pages */}
          <Route path='/student/register' element={<StudentRegister />} />
          <Route path='/student/login' element={<StudentLogin />} />
          <Route path='/instructor/register' element={<InstructorRegister />} />
          <Route path='/instructor/login' element={<InstructorLogin />} />
          {/* Other app routes */}
          <Route path='/about' element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path='/contact' element={<Contact />} />
          <Route path="/problems" element={<Userdata />} />
          <Route path="/add" element={<Add />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path='/compiler/:id' element={<Compiler />} />
          <Route path="/compiler" element={<Compiler />} />
          <Route path="/result" element={<Result />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/google-auth" element={<GoogleAuthHandler />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
