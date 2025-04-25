import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './modal.css';
import './background.css'



const MainPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]); // Add this state
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

  const [isRecruiterEmailVerified, setIsRecruiterEmailVerified] = useState(false);
  const [showRecruiterOTPInput, setShowRecruiterOTPInput] = useState(false);
  const [recruiterOTP, setRecruiterOTP] = useState('');

  const commonFields = [
    { name: 'firstname', label: 'First Name', type: 'text' },
    { name: 'middlename', label: 'Middle Name', type: 'text' },
    { name: 'lastname', label: 'Last Name', type: 'text' },
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'phone_number', label: 'Phone Number', type: 'tel' }
  ];
  useEffect(() => {
    fetchJobs();
  }, []);
  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/jobs/');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleApplyJob = (jobId) => {
    if (!localStorage.getItem('token')) {
      setIsModalOpen(true);
      setIsLogin(true);
    } else {
      navigate(`/apply-job/${jobId}`);
    }
  };

  const handleSendOTP = async (email) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/send-verification-email', {
        email: email
      });
      if (response.status === 200) {
        if (registerData.role === 'applicant') {
          setShowOTPInput(true);
        } else {
          setShowRecruiterOTPInput(true);
        }
        alert('OTP has been sent to your email');
      }
      if (response.status === 200 && registerData.role === 'recruiter') {
        setShowRecruiterOTPInput(true);
        // Extract domain and lookup organization
        const domain = email.split('@')[1];
        if (domain) {
          try {
            const orgName = await lookupOrganization(domain);
            if (orgName) {
              setRegisterData(prev => ({
                ...prev,
                organization: orgName
              }));
            } else {
              // Fallback: Format domain name if API lookup fails
              const formattedName = domain
                .split('.')[0]
                .split(/[-_]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
              setRegisterData(prev => ({
                ...prev,
                organization: formattedName
              }));
            }
          } catch (error) {
            console.error('Error looking up organization:', error);
          }
        }
      } else if (response.status === 200 && registerData.role === 'applicant') {
        setShowOTPInput(true);
      }

      alert('OTP has been sent to your email');
    
    } catch (error) {
      alert('Failed to send OTP: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };
  
  const handleVerifyOTP = async (email, otpValue, isRecruiter = false) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/verify-otp', {
        email: email,
        otp: otpValue
      });
      if (response.status === 200) {
        if (isRecruiter) {
          setIsRecruiterEmailVerified(true);
          setShowRecruiterOTPInput(false);
        } else {
          setIsEmailVerified(true);
          setShowOTPInput(false);
        }
        alert('Email verified successfully!');
      }
    } catch (error) {
      alert('Invalid OTP');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/login', loginData);
        if (response.data.access) {
            const token = response.data.access;
            localStorage.setItem('token', token);

            // Fetch user details using the token
            const userResponse = await axios.get('http://127.0.0.1:8000/api/v1/auth/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const userRole = userResponse.data.role; // Assuming the backend returns the role in the response

            if (userRole === 'applicant') {
                setIsModalOpen(false);
                navigate('/applicantpage');
            } else if (userRole === 'recruiter'){
              setIsModalOpen(false);
              navigate('/recruiter-dashboard');
            }
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

  // Add this helper function at the top of your component
const getOrganizationFromEmail = async (email) => {
  try {
    const domain = email.split('@')[1];
    if (!domain) return null;

    // Remove common TLDs and get organization name
    const orgName = domain
      .split('.') // Split by dots
      .slice(0, -1) // Remove TLD (edu, com, etc)
      .join(' ') // Join remaining parts
      .split('-') // Split by dashes
      .join(' ') // Join with spaces
      .split('_') // Split by underscores
      .join(' ') // Join with spaces
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/\b\w/g, c => c.toUpperCase()); // Capitalize first letter of each word

    return orgName;
  } catch (error) {
    console.error('Error extracting organization name:', error);
    return null;
  }
};

// Update the handleInputChange function
const handleInputChange = async (e) => {
  const { name, value } = e.target;
  setRegisterData(prev => ({
    ...prev,
    [name]: value
  }));

  // If organization email is changed and role is recruiter
  if (name === 'organization_email' && registerData.role === 'recruiter') {
    try {
      const domain = value.split('@')[1];
      if (domain) {
        // Use lookupOrganization to get company name
        const orgName = await lookupOrganization(domain);
        if (orgName) {
          setRegisterData(prev => ({
            ...prev,
            organization: orgName
          }));
        }
      }
    } catch (error) {
      console.error('Error detecting organization:', error);
    }
  }
};

// Optionally, add a more comprehensive organization lookup
const lookupOrganization = async (domain) => {
  try {
    const response = await axios.get(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${domain}`);
    
    if (response.data && response.data.length > 0) {
      return response.data[0].name;
    }
    return null;
  } catch (error) {
    console.error('Error looking up organization:', error);
    return null;
  }
};

// Update the organization email input field in your JSX

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
    if (registerData.role === 'recruiter'){
      registerData.email = registerData.organization_email;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (registerData.role === 'applicant' && !isEmailVerified) {
      alert('Please verify your email first');
      return;
    }
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/auth/register', registerData);
      console.log(response)
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
    <div className="min-h-screen bg-gray-50">
    {/* Header Section */}
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">CertiCheck job portal</h1>
        <button 
          className="bg-white text-blue-600 px-6 py-2 rounded-md font-semibold hover:bg-blue-50 transition-all"
          onClick={() => setIsModalOpen(true)}
        >
          Lets Started
        </button>
      </div>
    </header>
    
    {/* Main Content */}
    <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Platform Info Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-4">Why CertiCheck?</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Your trusted platform for verified job applications and document certification.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Secure document verification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Trusted by leading companies</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Fast and efficient process</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

<div className="lg:col-span-2 space-y-6">
  <h2 className="text-2xl font-bold mb-6">Latest Job Opportunities</h2>
  {jobs.length === 0 ? (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-500">Loading jobs...</p>
    </div>
  ) : (
    <div className="grid gap-6">
      {jobs.map(job => (
        <div key={job.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm text-gray-500">Ad No: {job.adNo}</span>
                <h3 className="text-xl font-semibold mt-1">{job.jobTitle}</h3>
                <p className="text-blue-600 font-medium">{job.companyName}</p>
              </div>
              <button
                onClick={() => handleApplyJob(job.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
            <div className="mt-4">
              <p className="text-gray-600">{job.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <p>🏢 Location: {job.location}</p>
                  <p>💰 Salary: {job.salary}</p>
                </div>
                <div>
                  <p>📅 Published: {new Date(job.publishDate).toLocaleDateString()}</p>
                  <p>⏰ Closes: {new Date(job.closeDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
        </div>
      </div>
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
  <div className="space-y-4">
    <div className="form-group">
      <label>Email</label>
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          value={registerData.email}
          onChange={handleInputChange}
          required
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => handleSendOTP(registerData.email)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={!registerData.email || isEmailVerified}
        >
          {isEmailVerified ? 'Verified' : 'Verify Email'}
        </button>
      </div>
    </div>
    {showOTPInput && !isEmailVerified && (
      <div className="form-group">
        <label>Enter OTP</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            className="flex-1"
            maxLength={6}
          />
          <button
            type="button"
            onClick={handleVerifyOTP}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Verify OTP
          </button>
        </div>
      </div>
    )}
  </div>
)}

{registerData.role === 'recruiter' && (
  <>
    <div className="form-group">
      <label>Organization Email</label>
      <div className="flex gap-2">
        <input
          type="email"
          name="organization_email"
          value={registerData.organization_email}
          onChange={handleInputChange}
          required
          className="flex-1"
          placeholder="organization@domain.com"
        />
        <button
          type="button"
          onClick={() => handleSendOTP(registerData.organization_email)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={!registerData.organization_email || isRecruiterEmailVerified}
        >
          {isRecruiterEmailVerified ? 'Verified' : 'Verify Email'}
        </button>
      </div>
      <small className="text-gray-500 mt-1">
        Enter your organization email to auto-detect organization name
      </small>
    </div>

    <div className="form-group">
      <label>Organization Name</label>
      <input
        type="text"
        name="organization"
        value={registerData.organization}
        onChange={handleInputChange}
        required
        className="w-full bg-gray-50"
        placeholder="Auto-detected from email"
        readOnly={!!registerData.organization_email}
      />
      {registerData.organization && (
        <small className="text-green-600 mt-1">
          ✓ Organization detected from email domain
        </small>
      )}
    </div>

    {showRecruiterOTPInput && !isRecruiterEmailVerified && (
      <div className="form-group">
        <label>Enter OTP</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={recruiterOTP}
            onChange={(e) => setRecruiterOTP(e.target.value)}
            placeholder="Enter 6-digit OTP"
            className="flex-1"
            maxLength={6}
          />
          <button
            type="button"
            onClick={() => handleVerifyOTP(registerData.organization_email, recruiterOTP, true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Verify OTP
          </button>
        </div>
        <small className="text-gray-500 mt-1">
          Please check your email for the verification code
        </small>
      </div>
    )}

    {isRecruiterEmailVerified && (
      <div className="p-3 bg-green-50 text-green-700 rounded-md mb-4">
        ✓ Email verification completed successfully
      </div>
    )}
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
  );
};

export default MainPage;
