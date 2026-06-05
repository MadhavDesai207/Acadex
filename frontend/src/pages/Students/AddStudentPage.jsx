import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, ShieldAlert, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import studentService from '../../services/studentService';
import authService from '../../services/authService';

const AddStudentPage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getLocalUser() || { role: 'FACULTY' };

  // RBAC Guard: Faculty cannot register students
  useEffect(() => {
    if (currentUser.role === 'FACULTY') {
      navigate('/students');
    }
  }, [currentUser, navigate]);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    phone: '',
    courseId: '',
    batchId: '',
    parentName: '',
    parentPhone: '',
    email: '',
  });

  // Options State
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  // UI State
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 1. Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      const data = await studentService.getCourses();
      setCourses(data.map(c => ({ value: c.id, label: c.name })));
    };
    fetchCourses();
  }, []);

  // 2. Cascade Course ID selection to Batch options
  useEffect(() => {
    const fetchBatches = async () => {
      if (formData.courseId) {
        const data = await studentService.getBatches(formData.courseId);
        setBatches(data.map(b => ({ value: b.id, label: b.name })));
      } else {
        setBatches([]);
      }
      setFormData(prev => ({ ...prev, batchId: '' })); // reset selected batch
    };
    fetchBatches();
  }, [formData.courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when editing
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Form Validation Checks
  const validateForm = () => {
    const newErrors = {};

    // Personal Validation
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    if (!formData.gender) newErrors.gender = 'Gender selection is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Academic Validation
    if (!formData.courseId) newErrors.courseId = 'Course selection is required';
    if (!formData.batchId) newErrors.batchId = 'Batch selection is required';

    // Parent Validation
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent/Guardian name is required';
    if (!formData.parentPhone.trim()) newErrors.parentPhone = 'Parent/Guardian phone is required';

    // Account Validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await studentService.createStudent(formData);
      if (res.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/students');
        }, 2000);
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 
        'An error occurred while creating the student. Please check inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        
        {/* Navigation Toolbar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/students')}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
              New Student Registration
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Complete the registration form to create a student profile and setup user credentials.
            </p>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {submitError && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-status-danger/15 border border-status-danger/30 text-status-danger text-sm">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="flex gap-2.5 p-3 rounded-lg bg-status-success/15 border border-status-success/30 text-status-success text-sm">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <span>Student profile registered successfully! Redirecting to student registry...</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Section 1: Personal Details */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2.5">
              1. Personal Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <Input
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={errors.dateOfBirth}
                required
              />

              <Select
                label="Gender"
                name="gender"
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' }
                ]}
                value={formData.gender}
                onChange={handleChange}
                error={errors.gender}
                placeholder="Select Gender"
                required
              />

              <Input
                label="Contact Phone"
                name="phone"
                placeholder="555-0100"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="address" className="text-sm font-medium text-slate-300">
                Residential Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="123 Academic Way, Suite 100"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none glass-input resize-none"
              />
            </div>
          </div>

          {/* Section 2: Academic Program */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2.5">
              2. Academic Course & Batch
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Course Interest"
                name="courseId"
                options={courses}
                value={formData.courseId}
                onChange={handleChange}
                error={errors.courseId}
                placeholder="Choose Course"
                required
              />

              <Select
                label="Assigned Batch"
                name="batchId"
                options={batches}
                value={formData.batchId}
                onChange={handleChange}
                error={errors.batchId}
                placeholder={formData.courseId ? "Choose Batch" : "Select a Course First"}
                disabled={!formData.courseId}
                required
              />
            </div>
          </div>

          {/* Section 3: Parent / Guardian Info */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 flex flex-col gap-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2.5">
              3. Parent / Guardian Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Guardian Full Name"
                name="parentName"
                placeholder="Robert Doe"
                value={formData.parentName}
                onChange={handleChange}
                error={errors.parentName}
                required
              />

              <Input
                label="Guardian Phone"
                name="parentPhone"
                placeholder="555-0102"
                value={formData.parentPhone}
                onChange={handleChange}
                error={errors.parentPhone}
                required
              />
            </div>
          </div>

          {/* Section 4: System User Account */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 flex flex-col gap-4">
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2.5">
                4. System Portal Account
              </h3>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Registration auto-generates a temporary user portal password formatted as: <code className="text-brand-light font-mono font-bold">STUD@&lt;RollNumber&gt;</code>.
              </p>
            </div>

            <div className="max-w-md">
              <Input
                label="Student Account Email"
                name="email"
                type="email"
                placeholder="student.name@eduerp.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/students')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={loading}
              disabled={submitSuccess}
              className="flex items-center gap-2"
            >
              <UserPlus size={16} />
              <span>Complete Enrollment</span>
            </Button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
};

export default AddStudentPage;
