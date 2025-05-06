import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeProfileViewer = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalImages, setModalImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/employees/view');
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch employees.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/delete/${id}`);
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  const openGallery = (images) => {
    setModalImages(images);
    setIsModalOpen(true);
  };

  const closeGallery = () => {
    setIsModalOpen(false);
    setModalImages([]);
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
    <div className="p-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200 rounded-lg shadow">
          <thead className="bg-indigo-50">
            <tr>
              {['Image', 'Name', 'Email', 'Phone', 'Dept', 'Skills', 'Status', 'Resume', 'Actions', 'Gallery'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((emp, i) => (
              <tr key={emp._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {/* Profile Image */}
                <td className="px-4 py-2">
                  <img
                    src={
                      emp.profileImage
                        ? `http://localhost:5000/${emp.profileImage}`
                        : 'https://via.placeholder.com/40'
                    }
                    alt={emp.fullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </td>

                {/* Basic Info */}
                <td className="px-4 py-2 text-sm text-gray-800">{emp.fullName}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{emp.email}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{emp.phone}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{emp.department}</td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {emp.skills?.length ? emp.skills.join(', ') : '—'}
                </td>

                {/* Status */}
                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      emp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>

                {/* Resume */}
                <td className="px-4 py-2 text-center">
                  {emp.resume ? (
                    <a
                      href={`http://localhost:5000/uploads/${emp.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => navigate(`/edit/${emp._id}`)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(emp._id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                  >
                    Delete
                  </button>
                </td>

                {/* Gallery */}
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => openGallery(emp.galleryImages || [])}
                    className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs rounded"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              onClick={closeGallery}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">Gallery Images</h3>
            {modalImages.length ? (
              <div className="grid grid-cols-3 gap-4">
                {modalImages.map((imgPath, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:5000/${imgPath}`}
                    alt={`gallery-${idx}`}
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No gallery images.</p>
            )}
            <div className="mt-6 text-right">
              <button
                onClick={closeGallery}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfileViewer;
