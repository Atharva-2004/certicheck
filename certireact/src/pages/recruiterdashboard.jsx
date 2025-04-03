import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  FaUser,
  FaBriefcase,
  FaPlus,
  FaSignOutAlt,
  FaBuilding,
  FaMapMarkerAlt,
  FaDollarSign,
  FaCalendarAlt
} from 'react-icons/fa';

const generateNextAdNo = (jobs) => {
    const currentYear = new Date().getFullYear();
    const prefix = `JOB${currentYear}`;
    
    if (jobs.length === 0) {
      return `${prefix}001`;
    }
  
    // Find the highest number
    const numbers = jobs
      .map(job => job.adNo)
      .filter(adNo => adNo.startsWith(prefix))
      .map(adNo => parseInt(adNo.slice(-3)));
    
    const maxNumber = Math.max(...numbers);
    const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
    
    return `${prefix}${nextNumber}`;
  };

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [createdJobs, setCreatedJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    adNo: '',
    companyName: '',
    jobTitle: '',
    closeDate: '',
    description: '',
    location: '',
    salary: '',
    required_documents: {
      "Aadhaar Card": ["fullName", "dateOfBirth", "address", "mobileNumber", "aadharNumber"],
      "PAN Card": ["fullName", "dateOfBirth", "fatherName", "panNumber"],
      "10th Marksheet": ["fullName", "rollNumber", "percentage", "board"],
      "12th Marksheet": ["fullName", "rollNumber", "percentage", "board"],
      "GATE Scorecard": ["fullName", "registrationNumber", "gateScore", "air"],
      "Resume": ["fullName", "skills", "experience", "contactInfo"]
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    fetchUserProfile(token);
    fetchCreatedJobs(token);
  }, [navigate]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/auth/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      handleLogout();
    }
  };

  

  const fetchCreatedJobs = async (token) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/jobs/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jobs = response.data;
      setCreatedJobs(jobs.filter(job => job.recruiter === user?.id));
      
      // Generate and set the next ad number
      const nextAdNo = generateNextAdNo(jobs);
      setJobForm(prev => ({
        ...prev,
        adNo: nextAdNo
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://127.0.0.1:8000/api/v1/jobs/create/',
        jobForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update created jobs and generate new ad number
      const updatedJobs = [...createdJobs, response.data];
      setCreatedJobs(updatedJobs);
      
      const nextAdNo = generateNextAdNo(updatedJobs);
      
      setShowCreateJob(false);
      setJobForm({
        adNo: nextAdNo, // Set the next ad number
        companyName: '',
        jobTitle: '',
        closeDate: '',
        description: '',
        location: '',
        salary: '',
        required_documents: jobForm.required_documents
      });
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">RecruiterDash</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2"
              variant="ghost"
            >
              <FaUser /> {user?.firstname} {user?.lastname}
            </Button>
            <Button
              onClick={handleLogout}
              className="flex items-center gap-2"
              variant="ghost"
            >
              <FaSignOutAlt /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64">
          <Card className="p-6">
            <nav className="space-y-2">
              <Button
                onClick={() => setShowCreateJob(true)}
                className="w-full justify-start gap-2"
              >
                <FaPlus /> Create New Job
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => setShowCreateJob(false)}
              >
                <FaBriefcase /> Created Jobs ({createdJobs.length})
              </Button>
            </nav>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {showProfile && user && (
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <p><span className="font-medium">Name:</span> {user.firstname} {user.lastname}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Organization:</span> {user.organization}</p>
                <p><span className="font-medium">Role:</span> {user.role}</p>
              </div>
            </Card>
          )}

          {showCreateJob ? (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Create New Job</h2>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="adNo">Advertisement Number</Label>
                    <Input
                      id="adNo"
                      value={jobForm.adNo}
                      onChange={(e) => setJobForm({...jobForm, adNo: e.target.value})}
                      required
                    />
                    </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={jobForm.companyName}
                      onChange={(e) => setJobForm({...jobForm, companyName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={jobForm.jobTitle}
                      onChange={(e) => setJobForm({...jobForm, jobTitle: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="closeDate">Close Date</Label>
                    <Input
                      id="closeDate"
                      type="date"
                      value={jobForm.closeDate}
                      onChange={(e) => setJobForm({...jobForm, closeDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                      required
                      placeholder="e.g., 18-25 LPA"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    value={jobForm.description}
                    onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                    required
                    className="h-32"
                  />
                </div>
                <Button type="submit" className="w-full">Create Job</Button>
              </form>
            </Card>
          ) : (
            <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Created Jobs</h2>
              <p className="text-gray-600">Total Jobs: {createdJobs.length}</p>
            </div>
            
            {createdJobs.length === 0 ? (
              <Card className="p-6">
                <p className="text-center text-gray-500">No jobs created yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {createdJobs
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map(job => (
                    <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Ad No: {job.adNo}</p>
                            <h3 className="text-lg font-semibold">{job.jobTitle}</h3>
                            <p className="text-blue-600">{job.companyName}</p>
                          </div>
                          
                          <p className="text-gray-600 line-clamp-2">{job.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <p className="flex items-center gap-2">
                                <FaMapMarkerAlt className="text-gray-400" /> {job.location}
                              </p>
                              <p className="flex items-center gap-2">
                                <FaDollarSign className="text-gray-400" /> {job.salary}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="flex items-center gap-2">
                                <FaCalendarAlt className="text-gray-400" /> 
                                Posted: {new Date(job.created_at).toLocaleDateString()}
                              </p>
                              <p className="flex items-center gap-2 text-red-500">
                                <FaCalendarAlt className="text-gray-400" /> 
                                Closes: {new Date(job.closeDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
          
                          <div className="flex gap-2 text-sm mt-4">
                            <span className={`px-3 py-1 rounded-full ${
                              new Date(job.closeDate) > new Date() 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {new Date(job.closeDate) > new Date() ? 'Active' : 'Closed'}
                            </span>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                              {job.applications?.length || 0} Applications
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;