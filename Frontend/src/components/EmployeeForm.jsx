// src/components/EmployeeForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import skillsData from '../data/skills.json';
import departmentsData from '../data/departments.json';
import gendersData from '../data/genders.json';
import { validateEmail, validatePhone, validateFileType } from '../utils/validations';

const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  skills: [],
  department: '',
  resume: null,
  profileImage: null,
  address: '',
  isActive: true,
};

const EmployeeForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [resumeURL, setResumeURL] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing data in edit mode
  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`http://localhost:5000/api/employees/view/${id}`);
          const emp = data.employee;
          setForm({
            fullName: emp.fullName || '',
            email: emp.email || '',
            phone: emp.phone || '',
            dob: emp.dob?.slice(0, 10) || '',
            gender: emp.gender || '',
            skills: emp.skills || [],
            department: emp.department || '',
            resume: null,
            profileImage: null,
            address: emp.address || '',
            isActive: emp.isActive,
          });
          if (emp.resume) {
            setResumeURL(`http://localhost:5000/${emp.resume}`);
          }
          if (emp.profileImage) {
            setExistingImagePath(emp.profileImage);
            setImageURL(`http://localhost:5000/${emp.profileImage}`);
          }
        } catch (err) {
          toast.error('Failed to load employee details');
          navigate('/');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEdit, id, navigate]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (resumeURL?.startsWith('blob:')) URL.revokeObjectURL(resumeURL);
      if (imageURL?.startsWith('blob:')) URL.revokeObjectURL(imageURL);
    };
  }, [resumeURL, imageURL]);

  // Validation logic
  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!validateEmail(form.email)) errs.email = 'Enter a valid email';
    const rawPhone = form.phone.replace(/\D/g, '').slice(-10);
    if (!rawPhone) errs.phone = 'Phone is required';
    else if (!validatePhone(rawPhone)) errs.phone = 'Enter a valid 10-digit phone';
    if (!form.dob) errs.dob = 'Date of Birth is required';
    if (!form.gender) errs.gender = 'Select gender';
    if (!form.skills.length) errs.skills = 'Select at least one skill';
    if (!form.department) errs.department = 'Select department';
    if (!form.resume && !isEdit) errs.resume = 'Upload resume';
    else if (form.resume && !validateFileType(form.resume, ['application/pdf'])) {
      errs.resume = 'Resume must be a PDF';
    }
    if (!imageURL && !form.profileImage && !isEdit) errs.profileImage = 'Upload profile image';
    else if (form.profileImage && !validateFileType(form.profileImage, ['image/jpeg', 'image/png'])) {
      errs.profileImage = 'Image must be JPG or PNG';
    }
    if (!form.address.trim()) errs.address = 'Address is required';

    setErrors(errs);
    return errs;
  };

  // Handle field changes
  const handleFieldChange = e => {
    const { name, type, checked, files, value } = e.target;
    if (type === 'file' && name === 'resume') {
      const file = files[0];
      setForm(f => ({ ...f, resume: file }));
      setResumeURL(file ? URL.createObjectURL(file) : null);
    } else if (type === 'file' && name === 'profileImage') {
      const file = files[0];
      setForm(f => ({ ...f, profileImage: file }));
      setImageURL(file ? URL.createObjectURL(file) : null);
      setExistingImagePath(null);
    } else if (type === 'checkbox' && name === 'isActive') {
      setForm(f => ({ ...f, isActive: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Toggle skills
  const toggleSkill = skill => {
    setForm(f => {
      const has = f.skills.includes(skill);
      return { ...f, skills: has ? f.skills.filter(s => s !== skill) : [...f.skills, skill] };
    });
  };

  // Remove image both frontend & backend
  const handleRemoveImage = async () => {
    setForm(f => ({ ...f, profileImage: null }));
    setImageURL(null);
    if (isEdit && existingImagePath) {
      try {
        await axios.delete(`http://localhost:5000/api/employees/delete-image/${id}`, {
          data: { path: existingImagePath }
        });
        setExistingImagePath(null);
        toast.success('Image removed');
      } catch {
        toast.error('Failed to delete image');
      }
    }
  };

  // Submit handler
  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      toast.error(errs[Object.keys(errs)[0]]);
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'skills') val.forEach(s => formData.append('skills', s));
      else formData.append(key, val);
    });

    try {
      setLoading(true);
      const url = isEdit
        ? `http://localhost:5000/api/employees/update/${id}`
        : `http://localhost:5000/api/employees/create`;
      const method = isEdit ? 'put' : 'post';
      const { data } = await axios[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Swal.fire('Success', data.message, 'success');

      // Clear form on create
      if (!isEdit) {
        setForm(initialFormState);
        setErrors({});
        setResumeURL(null);
        setImageURL(null);
      }

      navigate('/view');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Full Name */}
        <div>
          <label className="block font-medium">
            Full Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleFieldChange}
            className={`w-full mt-1 p-2 border rounded ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium">
            Email<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleFieldChange}
            className={`w-full mt-1 p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block font-medium">
            Phone<span className="text-red-500">*</span>
          </label>
          <PhoneInput
            country="in"
            value={form.phone}
            onChange={(value, country) => {
              let val = value;
              const dial = country.dialCode;
              if (!val.startsWith(dial)) val = dial + val.replace(/^\+?/, '');
              setForm(f => ({ ...f, phone: val }));
            }}
            containerStyle={{ width: '100%' }}
            inputStyle={{ width: '100%' }}
            inputClass={errors.phone ? 'border-red-500' : 'border-gray-300'}
            buttonStyle={{
              border: errors.phone ? '1px solid #f56565' : '1px solid #d1d5db'
            }}
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block font-medium">
            Date of Birth<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleFieldChange}
            className={`w-full mt-1 p-2 border rounded ${errors.dob ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
        </div>

        {/* Gender */}
        <div>
          <label className="block font-medium">
            Gender<span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mt-2">
            {gendersData.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setForm(f => ({ ...f, gender: g }))}
                className={`px-4 py-1 rounded-full border ${
                  form.gender === g ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
        </div>

        {/* Skills */}
        <div>
          <label className="block font-medium">
            Skills<span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {skillsData.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full border ${
                  form.skills.includes(skill) ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          {errors.skills && <p className="text-red-500 text-sm">{errors.skills}</p>}
        </div>

        {/* Department */}
        <div>
          <label className="block font-medium">
            Department<span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={form.department}
            onChange={handleFieldChange}
            className={`w-full mt-1 p-2 border rounded ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select Department</option>
            {departmentsData.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
        </div>

        {/* Resume */}
        <div>
          <label className="block font-medium">
            Resume (PDF)<span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            name="resume"
            accept=".pdf"
            onChange={handleFieldChange}
            className="w-full mt-1"
          />
          {errors.resume && <p className="text-red-500 text-sm">{errors.resume}</p>}
          {resumeURL && (
            <a
              href={resumeURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 text-sm mt-1 inline-block"
            >
              View Resume
            </a>
          )}
        </div>

        {/* Profile Image */}
        <div>
          <label className="block font-medium">
            Profile Image<span className="text-red-500">*</span>
          </label>
          <div className="mt-2 relative inline-block">
            {imageURL ? (
              <>
                <img
                  src={imageURL}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                >
                  &times;
                </button>
              </>
            ) : (
              <input
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleFieldChange}
                className="w-full mt-1"
              />
            )}
          </div>
          {errors.profileImage && <p className="text-red-500 text-sm">{errors.profileImage}</p>}
        </div>

        {/* Is Active Toggle */}
        <div className="flex items-center mt-4">
          <label htmlFor="isActiveToggle" className="font-medium mr-2">
            Active Status
          </label>
          <label className="inline-flex items-center cursor-pointer">
            <input
              id="isActiveToggle"
              type="checkbox"
              name="isActive"
              className="sr-only"
              checked={form.isActive}
              onChange={handleFieldChange}
            />
            <div
              className={`w-11 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                form.isActive ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                  form.isActive ? "translate-x-5" : ""
                }`}
              ></div>
            </div>
          </label>
        </div>

        {/* Address */}
        <div>
          <label className="block font-medium">
            Address<span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            rows="3"
            value={form.address}
            onChange={handleFieldChange}
            className={`w-full mt-1 p-2 border rounded ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white rounded ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {loading ? 'Submitting…' : isEdit ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
)};

export default EmployeeForm;
