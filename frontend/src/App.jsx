import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimpleLayout from './components/SimpleLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatorDashboard from './pages/CreatorDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import DiscoverCreators from './pages/DiscoverCreators';
import DiscoverBusinesses from './pages/DiscoverBusinesses';
import Home from './pages/Home';
import CreatorProfile from './pages/CreatorProfile';
import BusinessProfile from './pages/BusinessProfile';

function App() {
  return (
    <Router>
      <SimpleLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/creator-dashboard" element={<CreatorDashboard />} />
          <Route path="/business-dashboard" element={<BusinessDashboard />} />
          <Route path="/discover-creators" element={<DiscoverCreators />} />
          <Route path="/discover-businesses" element={<DiscoverBusinesses />} />
          <Route path="/creator/:id" element={<CreatorProfile />} />
          <Route path="/business/:id" element={<BusinessProfile />} />
        </Routes>
      </SimpleLayout>
    </Router>
  );
}

export default App;


