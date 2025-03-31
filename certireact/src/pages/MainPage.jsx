import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './modal.css';

const MainPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    gender: '',
    phone_number: '',
    role: '',
    organization: '',
    organization_email: ''
  });

  const commonFields = [
    { name: 'firstname', label: 'First Name', type: 'text' },
    { name: 'middlename', label: 'Middle Name', type: 'text' },
    { name: 'lastname', label: 'Last Name', type: 'text' },
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'phone_number', label: 'Phone Number', type: 'tel' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/login', loginData);
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        setIsModalOpen(false);
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRegisterData(prev => ({
      ...prev,
      role: selectedRole,
      ...(selectedRole === 'applicant' ? 
        { organization: '', organization_email: '' } : 
        { email: '' }
      )
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['firstname', 'lastname', 'username', 'password', 'gender', 'phone_number', 'role'];
    const missingFields = requiredFields.filter(field => !registerData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (registerData.role === 'applicant' && !registerData.email) {
      alert('Email is required for applicants');
      return false;
    }

    if (registerData.role === 'recruiter' && (!registerData.organization || !registerData.organization_email)) {
      alert('Organization and organization email are required for recruiters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/register', registerData);
      if (response.status === 201) {
        alert('Registration successful! Please login.');
        setIsLogin(true);
        setRegisterData({
          firstname: '',
          middlename: '',
          lastname: '',
          username: '',
          email: '',
          password: '',
          gender: '',
          phone_number: '',
          role: '',
          organization: '',
          organization_email: ''
        });
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-6">Welcome to CertiCheck</h1>
        <button 
          className="button button-primary"
          onClick={() => setIsModalOpen(true)}
        >
          Get Started
        </button>

        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <button 
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
              
              <h2 className="text-2xl font-bold mb-4">
                {isLogin ? 'Login' : 'Create Account'}
              </h2>

              {isLogin ? (
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required
                    />
                  </div>

                  <button type="submit" className="button button-primary">
                    Login
                  </button>

                  <p className="mt-4 text-center">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      className="toggle-form"
                      onClick={() => setIsLogin(false)}
                    >
                      Sign Up
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      name="role"
                      value={registerData.role}
                      onChange={handleRoleChange}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="applicant">Applicant</option>
                      <option value="recruiter">Recruiter</option>
                    </select>
                  </div>

                  {commonFields.map(field => (
                    <div className="form-group" key={field.name}>
                      <label>{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={registerData[field.name]}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  ))}

                    <div className="form-group gender-group">
                    <label>Gender</label>
                    <div className="radio-group">
                        {['Male', 'Female', 'Other'].map((option) => (
                        <label key={option} className="radio-label">
                            <input
                            type="radio"
                            name="gender"
                            value={option.toLowerCase()}
                            checked={registerData.gender === option.toLowerCase()}
                            onChange={handleInputChange}
                            required
                            />
                            {option}
                        </label>
                        ))}
                    </div>
                    </div>
                  {registerData.role === 'applicant' && (
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}

                  {registerData.role === 'recruiter' && (
                    <>
                      <div className="form-group">
                        <label>Organization</label>
                        <input
                          type="text"
                          name="organization"
                          value={registerData.organization}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Organization Email</label>
                        <input
                          type="email"
                          name="organization_email"
                          value={registerData.organization_email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </>
                  )}

                  <button type="submit" className="button button-primary">
                    Create Account
                  </button>

                  <p className="mt-4 text-center">
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="toggle-form"
                      onClick={() => setIsLogin(true)}
                    >
                      Login
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
