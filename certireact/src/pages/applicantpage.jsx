import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaBriefcase, FaSignOutAlt } from 'react-icons/fa';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import './tabs.css';
import { useNavigate } from 'react-router-dom';


const ApplicantPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [showProfile, setShowProfile] = useState(false);
    const [activeTab, setActiveTab] = useState('available');
    
    useEffect(() => {
        fetchUserProfile();
        fetchJobs();
        fetchAppliedJobs();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/v1/auth/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchJobs = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/v1/jobs/');
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const fetchAppliedJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/v1/jobs/applied', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppliedJobs(response.data);
        } catch (error) {
            console.error('Error fetching applied jobs:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const JobCard = ({ job }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
        >
            <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <p className="text-blue-600">{job.company}</p>
                        <p className="text-gray-600 mt-2">{job.description}</p>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p>🏢 Location: {job.location}</p>
                                <p>💰 Salary: {job.salary}</p>
                            </div>
                            <div>
                                <p>📅 Posted: {new Date(job.created_at).toLocaleDateString()}</p>
                                <p>⏰ Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <Button 
                    onClick={() => navigate(`/apply-job/${job.id}`, {
                        state: { jobId: job.id, userId: user.id }
                    })}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Apply Now
                </Button>
                </div>
            </Card>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">ApplicantDash</h1>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-2"
                            variant="ghost"
                        >
                            <FaUser /> Profile
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

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <div className="col-span-3">
                        <Card className="p-6">
                            {user && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                                            <FaUser className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h2 className="mt-4 font-semibold">{user.firstname} {user.lastname}</h2>
                                        <p className="text-gray-600">{user.email}</p>
                                    </div>
                                    <hr />
                                    <nav className="space-y-2">
                                        <Button
                                            onClick={() => setActiveTab('available')}
                                            className={`w-full justify-start ${activeTab === 'available' ? 'bg-blue-50 text-blue-600' : ''}`}
                                            variant="ghost"
                                        >
                                            Available Jobs
                                        </Button>
                                        <Button
                                            onClick={() => setActiveTab('applied')}
                                            className={`w-full justify-start ${activeTab === 'applied' ? 'bg-blue-50 text-blue-600' : ''}`}
                                            variant="ghost"
                                        >
                                            Applied Jobs
                                        </Button>
                                    </nav>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-9">
                        <AnimatePresence mode='wait'>
                            {activeTab === 'available' ? (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold mb-6">Available Jobs</h2>
                                    {jobs.map(job => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold mb-6">Applied Jobs</h2>
                                    {appliedJobs.map(job => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantPage;