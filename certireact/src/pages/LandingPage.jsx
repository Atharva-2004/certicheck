import { useState,useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  FaIdCard, 
  FaAddressCard, 
  FaGraduationCap, 
  FaUserGraduate, 
  FaAward, 
  FaFileAlt 
} from "react-icons/fa";
import { Progress } from "../components/ui/progress";
import './tabs.css'; // Add this import

const getStorageKey = (userId, jobId) => `application_${userId}_${jobId}`;

const saveToLocalStorage = (userId, jobId, data) => {
  if (userId && jobId) {
    localStorage.setItem(getStorageKey(userId, jobId), JSON.stringify(data));
  }
};

const getFromLocalStorage = (userId, jobId) => {
  if (!userId || !jobId) return null;
  const data = localStorage.getItem(getStorageKey(userId, jobId));
  return data ? JSON.parse(data) : null;
};

const LandingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { jobId, userId } = location.state || {};
  const savedData = getFromLocalStorage(userId, jobId);

  const [verificationStatus, setVerificationStatus] = useState(
    savedData?.verificationStatus || {
      aadhar: false,
      pan: false,
      marksheet10: false,
      marksheet12: false,
      gate: false,
      resume: false
    }
  );



  const [formData, setFormData] = useState(
    savedData?.formData || {
    aadhar: {
      fullName: '',
      dateOfBirth: '',
      address: '',
      mobileNumber: '',
      aadharNumber: '',
      document: null
    },
    pan: {
      fullName: '',
      dateOfBirth: '',
      fatherName: '',
      panNumber: '',
      document: null
    },
    marksheet10: {
      fullName: '',
      rollNumber: '',
      percentage: '',
      board: '',
      document: null
    },
    marksheet12: {
      fullName: '',
      rollNumber: '',
      percentage: '',
      board: '',
      document: null
    },
    gate: {
      fullName: '',
      registrationNumber: '',
      gateScore: '',
      air: '',
      document: null
    },
    resume: {
      fullName: '',
      skills: '',
      experience: '',
      contactInfo: '',
      document: null
    }
  });

  useEffect(() => {
    if (userId && jobId) {
      saveToLocalStorage(userId, jobId, {
        verificationStatus,
        formData
      });
    }
  }, [verificationStatus, formData, userId, jobId]);

  const calculateProgress = () => {
    const requiredDocuments = 5; // Reduced from 6 to 5 (excluding resume)
    const verifiedCount = Object.entries(verificationStatus)
      .filter(([key]) => key !== 'resume') // Exclude resume from count
      .filter(([_, status]) => status === true)
      .length;
    return (verifiedCount / requiredDocuments) * 100;
};
  
  const canAccessTab = (tabName) => {
    const tabOrder = ['aadhar', 'pan', 'marksheet10', 'marksheet12', 'gate', 'resume'];
    const currentIndex = tabOrder.indexOf(tabName);
    
    if (currentIndex === 0) return true;
    
    return verificationStatus[tabOrder[currentIndex - 1]] === true;
  };

  const tabIcons = {
    aadhar: <FaIdCard className="w-4 h-4" />,
    pan: <FaAddressCard className="w-4 h-4" />,
    marksheet10: <FaGraduationCap className="w-4 h-4" />,
    marksheet12: <FaUserGraduate className="w-4 h-4" />,
    gate: <FaAward className="w-4 h-4" />,
    resume: <FaFileAlt className="w-4 h-4" />
  };

  const handleInputChange = (section, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  const handleSubmitApplication = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to submit your application');
            navigate('/');
            return;
        }

        // Validate resume fields
        if (!formData.resume.fullName || !formData.resume.skills || 
            !formData.resume.experience || !formData.resume.contactInfo) {
            alert('Please fill all resume fields');
            return;
        }

        const formDataToSend = new FormData();

        // Add document files
        if (formData.aadhar.document) {
            formDataToSend.append('aadhaar_image', formData.aadhar.document);
        }
        if (formData.pan.document) {
            formDataToSend.append('pan_image', formData.pan.document);
        }
        if (formData.marksheet10.document) {
            formDataToSend.append('marks_10th_image', formData.marksheet10.document);
        }
        if (formData.marksheet12.document) {
            formDataToSend.append('marks_12th_image', formData.marksheet12.document);
        }
        if (formData.gate.document) {
            formDataToSend.append('gate_image', formData.gate.document);
        }
        if (formData.resume.document) {
            formDataToSend.append('resume_file', formData.resume.document);
        }

        // Create flat structure matching backend expectations
        const applicationData = {
            job: jobId,
            resume_name: formData.resume.fullName,
            // Resume fields
            resume_skills: formData.resume.skills,
            resume_experience: formData.resume.experience,
            resume_contact_info: formData.resume.contactInfo,
            // Aadhar fields
            aadhaar_number: formData.aadhar.aadharNumber,
            aadhaar_name: formData.aadhar.fullName,
            aadhaar_dob: formData.aadhar.dateOfBirth,
            aadhaar_address: formData.aadhar.address,
            aadhaar_mobile: formData.aadhar.mobileNumber,
            // PAN fields
            pan_number: formData.pan.panNumber,
            pan_name: formData.pan.fullName,
            pan_dob: formData.pan.dateOfBirth,
            pan_father_name: formData.pan.fatherName,
            // 10th fields
            marks_10th_name: formData.marksheet10.fullName,
            marks_10th_roll_number: formData.marksheet10.rollNumber,
            marks_10th_percentage: formData.marksheet10.percentage,
            marks_10th_board: formData.marksheet10.board,
            // 12th fields
            marks_12th_name: formData.marksheet12.fullName,
            marks_12th_roll_number: formData.marksheet12.rollNumber,
            marks_12th_percentage: formData.marksheet12.percentage,
            marks_12th_board: formData.marksheet12.board,
            // GATE fields
            gate_name: formData.gate.fullName,
            gate_reg_number: formData.gate.registrationNumber,
            gate_score: formData.gate.gateScore,
            gate_air: formData.gate.air,
            // Verification status
            verification_status: verificationStatus
        };

        // Add JSON data
        formDataToSend.append('data', JSON.stringify(applicationData));

        console.log('Sending application data:', applicationData);

        const response = await axios.post(
            `http://127.0.0.1:8000/api/v1/jobs/${jobId}/apply/`,
            formDataToSend,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        if (response.status === 201) {
            localStorage.removeItem(getStorageKey(userId, jobId));
            alert('Application submitted successfully!');
            navigate('/applicantpage');
        }
    } catch (error) {
        console.error('Error submitting application:', error.response?.data);
        const errorMessage = error.response?.data?.error || 'Please try again.';
        alert(`Error submitting application: ${errorMessage}`);
    }
};
  const handleFileChange = (section, e) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        document: e.target.files[0]
      }
    }));
  };

  const resetApplication = () => {
    if (userId && jobId) {
      localStorage.removeItem(getStorageKey(userId, jobId));
      setVerificationStatus({
        aadhar: false,
        pan: false,
        marksheet10: false,
        marksheet12: false,
        gate: false,
        resume: false
      });
      setFormData({
        // Reset to initial state
        // ...initial formData state
      });
    }
  };

  const verifyDocument = async (section, docType) => {
    if (!formData[section].document) {
      alert('Please upload a document first');
      return;
    }
  
    // Set the verification status to "loading" for the current section
    setVerificationStatus(prev => ({
      ...prev,
      [section]: 'loading'
    }));
  
    const data = new FormData();
    data.append('image', formData[section].document);
    data.append('document_type', docType);
  
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/v1/ocr/process-document',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          withCredentials: true,
        }
      );
  
      const { important_data } = response.data;
      let isVerified = true;
      const mismatchedFields = [];
      console.log('Important Data:', important_data);
  
      switch (docType) {
        case 'Aadhaar Card':
          if (important_data.Name !== formData[section].fullName) {
            isVerified = false;
            mismatchedFields.push('Full Name');
          }
          if (important_data['Aadhaar Number']?.replace(/\s/g, '') !== formData[section].aadharNumber) {
            isVerified = false;
            mismatchedFields.push('Aadhaar Number');
          }
          break;
  
        case 'PAN Card':
          if (important_data.Name?.toLowerCase() !== formData[section].fullName.toLowerCase()) {
            isVerified = false;
            mismatchedFields.push('Full Name');
          }
          if (important_data['PAN Number'] !== formData[section].panNumber) {
            isVerified = false;
            mismatchedFields.push('PAN Number');
          }
          break;
  
        case '10th Marksheet':
        case '12th Marksheet':
          if (important_data.Name?.toLowerCase() !== formData[section].fullName.toLowerCase()) {
            isVerified = false;
            mismatchedFields.push('Full Name');
          }
          if (important_data['Roll Number'] !== formData[section].rollNumber) {
            isVerified = false;
            mismatchedFields.push('Roll Number');
          }
          if (important_data.Percentage !== formData[section].percentage) {
            isVerified = false;
            mismatchedFields.push('Percentage');
          }
          break;
  
        case 'GATE Scorecard':
          if (important_data.Name?.toLowerCase() !== formData[section].fullName.toLowerCase()) {
            isVerified = false;
            mismatchedFields.push('Full Name');
          }
          if ((important_data['Registration Number']) !== (formData[section].registrationNumber)) {
            isVerified = false;
            mismatchedFields.push('Registration Number');
          }
          if ((important_data['GATE Score']) !== (formData[section].gateScore)) {
            isVerified = false;
            mismatchedFields.push('GATE Score');
          }
          break;
  
        case 'Resume':
          // Always mark resume as verified
          isVerified = true;
          break;
      }
  
      if (!isVerified) {
        alert(`The following fields do not match: ${mismatchedFields.join(', ')}`);
      }
  
      // Update the verification status based on the result
      setVerificationStatus(prev => ({
        ...prev,
        [section]: isVerified
      }));
    } catch (error) {
      console.error('Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
  
      if (error.response?.status === 400) {
        alert('Invalid request: Please check your form data');
      } else if (error.response?.status === 401) {
        alert('Unauthorized: Please log in');
      } else {
        alert(`Error: ${error.message}`);
      }
  
      // Set the verification status to false in case of an error
      setVerificationStatus(prev => ({
        ...prev,
        [section]: false
      }));
    }
  };
  

const renderFormSection = (section, title, fields, docType) => (
  <Card className="form-card">
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <div className={`status-badge ${
          verificationStatus[section] === true ? 'verified' : 'pending'
        }`}>
          {verificationStatus[section] === true ? 'Verified ✓' : 'Pending'}
        </div>
      </div>

      <div className="space-y-6">
        {fields.map(({ name, label, type = 'text', pattern }) => (
          <div key={name} className="space-y-2">
            <Label 
              htmlFor={`${section}-${name}`}
              className="text-sm font-medium text-gray-700"
            >
              {label}
            </Label>
            <Input
                id={`${section}-${name}`}
                type={type}
                name={name}
                value={formData[section][name]}
                onChange={(e) => handleInputChange(section, e)}
                pattern={pattern}
                className="w-full"
                required
              />
            </div>
          ))}

        
        <div className="file-upload-wrapper">
            <Label 
              htmlFor={`${section}-document`}
              className="block text-sm font-medium text-gray-700 mb-2">Upload Document
            </Label>
            <div className="flex items-center justify-center">
              <Input
                id={`${section}-document`}
                type="file"
                onChange={(e) => handleFileChange(section, e)}
                accept="image/*,.pdf"
                className="hidden"
                required
              />
              <Button 
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`${section}-document`).click()}
              >
                Choose File
              </Button>
            </div>
            {formData[section].document && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {formData[section].document.name}
              </p>
            )}
          </div>
        <Button
            onClick={() => verifyDocument(section, docType)}
            className={`w-full verify-button ${
              verificationStatus[section] === true ? 'bg-green-500' : ''
            }`}
            disabled={verificationStatus[section] === 'loading'}
          >
            {verificationStatus[section] === 'loading' ? 'Verifying...' :
             verificationStatus[section] === true ? 'Verified ✓' : 'Verify Document'}
          </Button>
        </div>
      </div>
    </Card>
  );

  const PreviewSection = () => (
    <Card className="preview-card p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">Application Preview</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-4">Job Details</h3>
          {jobDetails && (
            <div className="space-y-2">
              <p><span className="font-medium">Position:</span> {jobDetails.title}</p>
              <p><span className="font-medium">Company:</span> {jobDetails.company}</p>
              <p><span className="font-medium">Location:</span> {jobDetails.location}</p>
            </div>
          )}
        </div>
  
        <div>
          <h3 className="font-semibold mb-4">Applicant Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {formData.aadhar.fullName}</p>
            <p><span className="font-medium">Contact:</span> {formData.aadhar.mobileNumber}</p>
            <p><span className="font-medium">Skills:</span> {formData.resume.skills}</p>
            <p><span className="font-medium">Experience:</span> {formData.resume.experience}</p>
          </div>
        </div>
      </div>
  
      <div className="mt-8">
        <h3 className="font-semibold mb-4">Verified Documents</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(verificationStatus).map(([doc, status]) => (
            <div key={doc} className={`p-3 rounded ${status ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-medium">{doc.charAt(0).toUpperCase() + doc.slice(1)}</p>
              <p className="text-sm">{status ? '✓ Verified' : '✗ Not Verified'}</p>
            </div>
          ))}
        </div>
      </div>
  
      <Button 
    onClick={handleSubmitApplication}
    className="w-full mt-8 bg-blue-600 hover:bg-blue-700"
    disabled={!Object.entries(verificationStatus)
        .filter(([key]) => key !== 'resume') // Exclude resume from verification check
        .every(([_, status]) => status === true) || 
        !formData.resume.fullName || 
        !formData.resume.skills || 
        !formData.resume.experience || 
        !formData.resume.contactInfo
    }
>
    Submit Application
</Button>
    </Card>
  );

  
  return (
    <div className="min-h-screen bg-gray-50 p-6 ">
    <div className="max-w-full mx-auto bg-white rounded-lg shadow-lg p-6 ">
      <h1 className="text-3xl font-bold text-center mb-8 ">
        Document Verification Portal
      </h1>

      <div className="space-y-8 ">
        {/* Tabs Section */}
        <Tabs defaultValue="aadhar" className="w-full ">
          <TabsList className="w-full justify-between bg-gray-100 p-1">
            {Object.entries(tabIcons).map(([key, icon]) => (
              <TabsTrigger 
                key={key} 
                value={key}
                disabled={!canAccessTab(key)}
                className={`flex items-center gap-2 px-4 py-2 ${
                  verificationStatus[key] && 'bg-green-500 text-white'
                }`}
              >
                {icon}
                <span className="hidden md:inline">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                {verificationStatus[key] && <span>✓</span>}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-8 mb-8 border-t border-b py-6">
  <div className="w-full bg-slate-100 p-4 rounded-lg">
    <Progress 
      value={calculateProgress()}
      className="w-full h-3 bg-gray-200"
    />
    <p className="text-sm text-gray-600 mt-2 text-center">
      {Math.round(calculateProgress())}% Complete
    </p>
  </div>
</div>
          {/* Form Sections */}
          <TabsContent value="aadhar">
            {renderFormSection('aadhar', 'Aadhar Card Details', [
              { name: 'fullName', label: 'Full Name' },
              { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
              { name: 'address', label: 'Address' },
              { name: 'mobileNumber', label: 'Mobile Number', pattern: '[0-9]{10}' },
              { name: 'aadharNumber', label: 'Aadhar Number', pattern: '[0-9]{12}' }
            ], 'Aadhaar Card')}
          </TabsContent>

          <TabsContent value="pan">
            {renderFormSection('pan', 'PAN Card Details', [
              { name: 'fullName', label: 'Full Name' },
              { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
              { name: 'fatherName', label: "Father's Name" },
              { name: 'panNumber', label: 'PAN Number', pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}' }
            ], 'PAN Card')}
          </TabsContent>

          <TabsContent value="marksheet10">
            {renderFormSection('marksheet10', '10th Marksheet Details', [
              { name: 'fullName', label: 'Full Name' },
              { name: 'rollNumber', label: 'Roll Number' },
              { name: 'percentage', label: 'Percentage' },
              { name: 'board', label: 'Board Name' }
            ], '10th Marksheet')}
          </TabsContent>

          <TabsContent value="marksheet12">
            {renderFormSection('marksheet12', '12th Marksheet Details', [
              { name: 'fullName', label: 'Full Name' },
              { name: 'rollNumber', label: 'Roll Number' },
              { name: 'percentage', label: 'Percentage' },
              { name: 'board', label: 'Board Name' }
            ], '12th Marksheet')}
          </TabsContent>

          <TabsContent value="gate">
            {renderFormSection('gate', 'GATE Scorecard Details', [
              { name: 'fullName', label: 'Full Name' },
              { name: 'registrationNumber', label: 'Registration Number' },
              { name: 'gateScore', label: 'GATE Score' },
              { name: 'air', label: 'AIR' }
            ], 'GATE Scorecard')}
          </TabsContent>

          <TabsContent value="resume">
    {renderFormSection('resume', 'Resume Details', [
        { name: 'fullName', label: 'Full Name' },
        { name: 'skills', label: 'Skills' },
        { name: 'experience', label: 'Experience' },
        { name: 'contactInfo', label: 'Contact Information' }
    ], 'Resume')}
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-600">
            Note: Document verification is optional for resume, but all fields are mandatory.
        </p>
    </div>
</TabsContent>
          {calculateProgress() === 100 && (
                <Button 
                    onClick={handleSubmitApplication}
                    className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white"
                >
                    Submit Application
                </Button>
            )}
        </Tabs>
      </div>
      </div>
      
    </div>
  );
};

export default LandingPage;