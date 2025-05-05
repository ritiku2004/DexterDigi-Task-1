// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import EmployeeProfileViewer from "./components/EmployeeProfileViewer";
import EmployeeForm from "./components/EmployeeForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'react-phone-input-2/lib/style.css';

const Navigation = () => {
  const location = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 text-lg font-medium ${
      location.pathname === path
        ? "text-blue-600 border-b-2 border-blue-600"
        : "text-gray-600 hover:text-blue-600"
    }`;

  return (
    <nav className="flex justify-center space-x-8 mb-6 border-b pb-2">
      <Link to="/" className={linkClass("/")}>
        Create Employee
      </Link>
      <Link to="/view" className={linkClass("/view")}>
        View Employees
      </Link>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <Navigation />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1 className="text-3xl font-bold text-center mb-6">
                  Create Employee Profile
                </h1>
                <EmployeeForm isEdit={false} />
              </>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <>
                <h1 className="text-3xl font-bold text-center mb-6">
                  Edit Employee Profile
                </h1>
                <EmployeeForm isEdit={true} />
              </>
            }
          />
          <Route
            path="/view"
            element={
              <>
                <h1 className="text-4xl font-bold text-center my-6">
                  Employees Details
                </h1>
                <EmployeeProfileViewer />
              </>
            }
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
};

export default App;
