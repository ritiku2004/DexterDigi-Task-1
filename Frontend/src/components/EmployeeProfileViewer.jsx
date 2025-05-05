import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeProfileViewer = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/employees/view');
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch employees.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/delete/${id}`);
      setEmployees(prev => prev.filter(emp => emp._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 font-semibold mt-8">{error}</p>;
  }

  if (!employees.length) {
    return <p className="text-center text-gray-500 mt-8">No Employees Found.</p>;
  }

  return (
    <div className="p-6 overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead className="bg-indigo-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">Skills</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-indigo-700 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-indigo-700 uppercase tracking-wider">Resume</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-indigo-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, i) => (
            <tr key={emp._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap">
                <img
                  src={
                    emp.profileImage
                      ? `http://localhost:5000/${emp.profileImage}`
                      : 'https://via.placeholder.com/50'
                  }
                  alt={emp.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{emp.fullName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.department}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {emp.skills?.length ? emp.skills.join(', ') : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    emp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {emp.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {emp.resume ? (
                  <a
                    href={`http://localhost:5000/uploads/${emp.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline text-sm font-medium"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                <button
                  onClick={() => navigate(`/edit/${emp._id}`)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(emp._id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeProfileViewer;
