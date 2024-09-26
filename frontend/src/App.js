import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "pages/signUp";
import SignIn from "pages/signIn";
import { Main } from "components/Layout";
import Home from "pages/Home";
import Tables from "pages/Tables";
import Billing from "pages/Billing";
import Profile from "pages/Profile";
import { AuthProvider, useAuthContext } from "contexts/AuthContext";
import AdminPage from "pages/AdminPage";
import UserPage from "pages/UserPages";
import PrivateRoute from "components/PrivateRoute";
import DocumentRequest from "components/DocumentRequest";
import DocumentApprovalPage from "components/DocumentApprovalPage";
import Chatboat from "components/Chatbot/chatboat";
import { useLocation, useNavigate } from 'react-router-dom';
import ProfilePage from "pages/Profilee";
import UserLogin from "components/UserLogin";
import ChatLists from "components/ChatLists";
import ChatContainer from "components/ChatContainer";

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuthContext(); // Now includes loading state

  // Save the current path in localStorage whenever the route changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('lastVisitedPath', location.pathname);
    }
  }, [location, loading]);

  // On app load or page refresh, retrieve the last visited path and navigate to it
  useEffect(() => {
    const lastVisitedPath = localStorage.getItem('lastVisitedPath');
    
    // Check if there's a stored path and navigate to it only if the user is authenticated
    if (!loading && user && lastVisitedPath && lastVisitedPath !== location.pathname) {
      navigate(lastVisitedPath);
    }
  }, [navigate, location, user, loading]);

  // Show a loading screen or spinner while fetching the user state
  if (loading) {
    return <div>Loading...</div>; // Replace with your loading component
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to={localStorage.getItem('lastVisitedPath') || "/dashboard"} /> : <Navigate to="/sign-in" />}
      />
      <Route path="/" element={<Main />}>
      <Route path="dashboard" element={<Home />} />
      <Route path="tables" element={<Tables />} />
        <Route path="billing" element={<Billing />} />
        <Route element={<PrivateRoute roles={['EMPLOYEE']} />}>
          <Route path="rtl" element={<Home />} />
        </Route>
      </Route>
       
     
        <Route element={<PrivateRoute roles={['EMPLOYEE']} />}>
          <Route path="/documentrequest" element={<DocumentRequest />} />
        </Route>
        <Route element={<PrivateRoute roles={['MANAGER']} />}>
          <Route path="/Managerapprovment" element={<DocumentApprovalPage />} />
        </Route>
   
      <Route element={<PrivateRoute roles={['ADMIN','MANAGER']} />}>
      <Route path="/chatboat" element={<Chatboat />} />
      </Route>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<Signup />} />
      <Route element={<PrivateRoute roles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      <Route element={<PrivateRoute roles={['EMPLOYEE']} />}>
        <Route path="/user" element={<UserPage />} />
      </Route>
      <Route element={<PrivateRoute roles={['MANAGER', 'EMPLOYEE']} />}>
        <Route path="/user_profile" element={<ProfilePage />} />
      </Route>
      <Route path="/userlogin" element={<UserLogin />} /> {/* Public route */}
      <Route path="/chatlist" element={<ChatLists />} /> {/* Public route */}
      <Route path="/chatcontainer" element={<ChatContainer />} /> {/* Public route */}
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
    
  );
}
