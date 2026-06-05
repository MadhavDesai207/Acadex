import React, { useState, useEffect } from 'react';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';

const FacultyForm = ({ onSubmit, initialData = null, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    dateOfJoining: '',
    qualification: '',
    bankAccount: '',
    baseSalary: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Hydrate fields if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.user?.name || '',
        email: initialData.user?.email || '',
        phone: initialData.user?.phone || '',
        designation: initialData.designation || '',
        department: initialData.department || '',
        dateOfJoining: initialData.dateOfJoining || '',
        qualification: initialData.qualification || '',
        bankAccount: initialData.bankAccount ? initialData.bankAccount.replace(/•/g, '') : '',
        baseSalary: initialData.baseSalary ? String(initialData.baseSalary) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.dateOfJoining) newErrors.dateOfJoining = 'Date of Joining is required';
    
    // Positive Decimal Validation for Base Salary
    const salaryNum = parseFloat(formData.baseSalary);
    if (!formData.baseSalary || isNaN(salaryNum)) {
      newErrors.baseSalary = 'Base Salary must be a valid number';
    } else if (salaryNum <= 0) {
      newErrors.baseSalary = 'Base Salary must be a positive decimal number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          name="name"
          placeholder="Dr. Alan Turing"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label="Account Email"
          name="email"
          type="email"
          placeholder="alan.turing@eduerp.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={!!initialData} // disable email edit under normal flow
          required
        />

        <Input
          label="Contact Phone"
          name="phone"
          placeholder="555-1001"
          value={formData.phone}
          onChange={handleChange}
        />

        <Input
          label="Date of Joining"
          name="dateOfJoining"
          type="date"
          value={formData.dateOfJoining}
          onChange={handleChange}
          error={errors.dateOfJoining}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Designation"
          name="designation"
          options={[
            { value: 'Professor', label: 'Professor' },
            { value: 'Associate Professor', label: 'Associate Professor' },
            { value: 'Assistant Professor', label: 'Assistant Professor' },
            { value: 'Senior Lecturer', label: 'Senior Lecturer' },
            { value: 'Lecturer', label: 'Lecturer' },
          ]}
          value={formData.designation}
          onChange={handleChange}
          error={errors.designation}
          placeholder="Select Designation"
          required
        />

        <Select
          label="Department"
          name="department"
          options={[
            { value: 'Computer Science', label: 'Computer Science' },
            { value: 'Information Technology', label: 'Information Tech' },
            { value: 'Mathematics', label: 'Mathematics' },
            { value: 'Applied Sciences', label: 'Applied Sciences' },
          ]}
          value={formData.department}
          onChange={handleChange}
          placeholder="Select Department"
        />
      </div>

      <Input
        label="Qualifications"
        name="qualification"
        placeholder="Ph.D. in Mathematical Sciences & Computation"
        value={formData.qualification}
        onChange={handleChange}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Bank Account Details"
          name="bankAccount"
          placeholder="123456789012"
          value={formData.bankAccount}
          onChange={handleChange}
        />

        <Input
          label="Base Salary ($)"
          name="baseSalary"
          placeholder="8500.00"
          value={formData.baseSalary}
          onChange={handleChange}
          error={errors.baseSalary}
          required
        />
      </div>

      {!initialData && (
        <div className="p-3 rounded-lg bg-bg-deep/40 border border-slate-700/30 text-[11px] text-slate-500">
          Faculty accounts auto-generate system credentials formatted as: <code className="text-brand-light font-mono font-bold">FAC@&lt;EmployeeCode&gt;</code>.
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-2">
        <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={loading}>
          {initialData ? 'Save Changes' : 'Register Faculty'}
        </Button>
      </div>

    </form>
  );
};

export default FacultyForm;
