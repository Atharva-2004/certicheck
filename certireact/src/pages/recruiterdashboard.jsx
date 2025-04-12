import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "../components/ui/scroll-area";
import { useNavigate } from 'react-router-dom';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import './dialog.css';
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
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "../components/ui/dialog";
// Update the imports at the top





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
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);  
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
    required_documents: {}
  });
  const [availableDocuments] = useState({
    "Aadhaar Card": [
      "aadhaar_name",
      "aadhaar_dob",
      "aadhaar_address",
      "aadhaar_mobile",
      "aadhaar_number"
    ],
    "PAN Card": [
      "pan_name",
      "pan_dob",
      "pan_father_name",
      "pan_number"
    ],
    "10th Marksheet": [
      "marks_10th_name",
      "marks_10th_roll_number",
      "marks_10th_percentage",
      "marks_10th_board"
    ],
    "12th Marksheet": [
      "marks_12th_name",
      "marks_12th_roll_number",
      "marks_12th_percentage",
      "marks_12th_board"
    ],
    "GATE Scorecard": [
      "gate_name",
      "gate_reg_number",
      "gate_score",
      "gate_air"
    ],
    "Resume": [
      "resume_name",
      "resume_skills",
      "resume_experience",
      "resume_contact_info"
    ]
  });
  
  const resetJobForm = (nextAdNo) => {
    setJobForm({
      adNo: nextAdNo,
      companyName: '',
      jobTitle: '',
      closeDate: '',
      description: '',
      location: '',
      salary: '',
      required_documents: {}
    });
  
  };

  const overlayStyles = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'fixed',
    inset: 0,
    animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)'
  };
  
  const contentStyles = {
    backgroundColor: 'white',
    borderRadius: '6px',
    boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    maxWidth: '800px',
    maxHeight: '85vh',
    padding: '25px',
    animation: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
    overflow: 'auto'
  };

// Add after existing useState declarations
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
      const response = await axios.get('http://127.0.0.1:8000/api/v1/jobs/list-created-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jobs = response.data;
      // Fetch applications count for each job
    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        try {
          const applicationsResponse = await axios.get(
            `http://127.0.0.1:8000/api/v1/jobs/${job.id}/applications/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { ...job, applicationsCount: applicationsResponse.data.length };
        } catch (error) {
          console.error(`Error fetching applications for job ${job.id}:`, error);
          return { ...job, applicationsCount: 0 }; // Default to 0 if there's an error
        }
      })
    );

    setCreatedJobs(jobsWithApplications);
      
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

  const fetchJobDetails = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/jobs/${jobId}/applications/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobApplications(response.data);
      setShowJobDetail(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
      alert('Failed to load job details');
    }
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
                <div>
    <Label htmlFor="required_documents">Required Documents</Label>
    <div className="grid grid-cols-3 gap-4 mt-2">
      {Object.keys(availableDocuments).map(docType => (
        <div key={docType} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`doc-${docType}`}
            checked={jobForm.required_documents.hasOwnProperty(docType)}
            onChange={(e) => {
              setJobForm(prev => ({
                ...prev,
                required_documents: e.target.checked
                  ? {
                      ...prev.required_documents,
                      [docType]: availableDocuments[docType]
                    }
                  : Object.fromEntries(
                      Object.entries(prev.required_documents).filter(
                        ([key]) => key !== docType
                      )
                    )
              }));
            }}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor={`doc-${docType}`}>{docType}</Label>
        </div>
      ))}
    </div>
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
                    <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                      setSelectedJob(job);
                      fetchJobDetails(job.id);
                    }}>
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
                              {job.applicationsCount || 0} Applications
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
        {showJobDetail && selectedJob && (
  <Sheet open={showJobDetail} onOpenChange={setShowJobDetail}>
    <SheetContent side="right" className="sheet-content">
    <SheetHeader className="sheet-header">
    <SheetTitle className="sheet-title">
    Applications for {selectedJob.jobTitle}</SheetTitle>
        <SheetDescription>
          {selectedJob.companyName} - {jobApplications.length} Applications
        </SheetDescription>
      </SheetHeader>
      <div className="job-details-card">
        <div className="job-info-grid">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p><span className="font-medium">Location:</span> {selectedJob.location}</p>
            <p><span className="font-medium">Salary:</span> {selectedJob.salary}</p>
            <p><span className="font-medium">Posted:</span> {new Date(selectedJob.created_at).toLocaleDateString()}</p>
            <p><span className="font-medium">Closes:</span> {new Date(selectedJob.closeDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="space-y-4">
          {jobApplications.map(application => (
            <Card 
              key={application.id}
              className="application-card mt-2"
              onClick={() => setSelectedApplication(application)}
            >
              {/* <div className="application-card"> */}
                <div>
                  <h4 className="font-medium">{application.aadhaar_name}</h4>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>{application.resume_skills}</p>
                    <p>{application.resume_experience}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Application
                </Button>
              {/* </div> */}
            </Card>
          ))}
        </div>
      </div>
    </SheetContent>
  </Sheet>
)}

{selectedApplication && (
  <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Application Details</DialogTitle>
        <DialogDescription>
          Reviewing application from {selectedApplication.aadhaar_name}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{selectedApplication.aadhaar_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{selectedApplication.aadhaar_mobile}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{selectedApplication.aadhaar_address}</p>
              </div>
            </div>
          </div>

          {/* Education Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Education</h3>
            <div className="space-y-4">
              {/* 10th Standard */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded">
                <div className="col-span-2">
                  <h4 className="font-medium">10th Standard</h4>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Board</p>
                  <p className="font-medium">{selectedApplication.marks_10th_board}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Percentage</p>
                  <p className="font-medium">{selectedApplication.marks_10th_percentage}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded">
                <div className="col-span-2">
                  <h4 className="font-medium">12th Standard</h4>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Board</p>
                  <p className="font-medium">{selectedApplication.marks_12th_board}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Percentage</p>
                  <p className="font-medium">{selectedApplication.marks_12th_percentage}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded">
                <div className="col-span-2">
                  <h4 className="font-medium">GATE Score</h4>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-medium">{selectedApplication.gate_reg_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Score</p>
                  <p className="font-medium">{selectedApplication.gate_score}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">AIR</p>
                  <p className="font-medium">{selectedApplication.gate_air}</p>
                </div>
              </div>
            </div>
          </div>
          
        

        {/* Professional Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Skills</p>
                <p className="font-medium">{selectedApplication.resume_skills}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium">{selectedApplication.resume_experience}</p>
              </div>
            </div>
          </div>
        </div>
        
    </DialogContent>
  </Dialog>
)}

        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;