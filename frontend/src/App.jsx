import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import './animations.css';
import './components.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import FarmHouseList from './pages/FarmHouseList';
import FarmHouseDetail from './pages/FarmHouseDetail';
import BookingPage from './pages/BookingPage';
import UserBookings from './pages/UserBookings';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import NotFound from './pages/NotFound';
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Offers from "./pages/Offers";
import CreateEstate from "./pages/CreateEstate";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Protected Route Component to handle login redirects elegantly
function ProtectedRoute({ user, allowedRoles, children }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
  };

  if (loading) {
    return <div className="loading">Loading Farm House...</div>;
  }

  return (
    <Router>
      <ScrollToTop />
      <Navbar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          {/* Main Menubar Routes */}
          <Route path="/" element={<Home user={user} />} />
          <Route path="/farmhouses" element={<FarmHouseList user={user} />} />
          <Route path="/farmhouses/:id" element={<FarmHouseDetail user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:farmhouseId" element={<Gallery />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />

          {/* Authentication Routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLoginSuccess={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          
          {/* Protected Routes */}
          <Route 
            path="/booking/:farmhouseId" 
            element={
              <ProtectedRoute user={user}>
                <BookingPage user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-estate" 
            element={
              <ProtectedRoute user={user} allowedRoles={['OWNER']}>
                <CreateEstate user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute user={user}>
                <UserBookings user={user} />
              </ProtectedRoute>
            } 
          />
          
          {/* Dashboards */}
          <Route path="/superadmin" element={user?.role === 'SUPERADMIN' ? <SuperAdminDashboard /> : <Navigate to="/" />} />
          <Route path="/admin" element={user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/owner-dashboard" element={user?.role === 'OWNER' ? <OwnerDashboard user={user} /> : <Navigate to="/" />} />

          {/* 404 Wildcard */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
