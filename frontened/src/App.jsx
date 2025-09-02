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
import StudentPage from './pages/StudentPage/StudentPage';
import InstructorPage from './pages/InstructorPage/InstructorPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<PublicRoute><Home /></PublicRoute>} />
          {/* Role-based auth pages */}
          <Route path='/student/register' element={<PublicRoute><StudentRegister /></PublicRoute>} />
          <Route path='/student/login' element={<PublicRoute><StudentLogin /></PublicRoute>} />
          <Route path='/instructor/register' element={<PublicRoute><InstructorRegister /></PublicRoute>} />
          <Route path='/instructor/login' element={<PublicRoute><InstructorLogin /></PublicRoute>} />
          <Route path='/student' element={
            <ProtectedRoute>
              <StudentPage />
            </ProtectedRoute>
          } />
          <Route path='/student/dashboard' element={
            <ProtectedRoute>
              <StudentPage />
            </ProtectedRoute>
          } />
          <Route path='/instructor' element={
            <ProtectedRoute>
              <InstructorPage />
            </ProtectedRoute>
          } />
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
