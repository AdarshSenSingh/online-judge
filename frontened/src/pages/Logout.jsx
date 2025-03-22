import { useEffect } from "react"
import { Navigate } from "react-router-dom";
import { useAuth } from "../token/auth";
import toast from "react-hot-toast";


const Logout = () => {
   
  const {LogoutUser}= useAuth();
   useEffect(()=>{
      LogoutUser();
   },[LogoutUser]);
   toast.success("User Logout Sucessfully", { position: 'top-right' });
   return <Navigate to="/login"/>
   
}

export default Logout