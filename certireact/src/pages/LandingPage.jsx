import { useState } from 'react';
import axios from 'axios';
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



const LandingPage = () => {
  const [verificationStatus, setVerificationStatus] = useState({
    aadhar: false,
    pan: false,
    marksheet10: false,
    marksheet12: false,
    gate: false,
    resume: false
  });

  const [formData, setFormData] = useState({
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

  const calculateProgress = () => {
    const totalDocuments = 6; // Total number of documents
    const verifiedCount = Object.values(verificationStatus).filter(status => status === true).length;
    return (verifiedCount / totalDocuments) * 100;
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

  const handleFileChange = (section, e) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        document: e.target.files[0]
      }
    }));
  };

  const verifyDocument = async (section, docType) => {
    if (!formData[section].document) {
      alert('Please upload a document first');
      return;
    }

    const data = new FormData();
    data.append('image', formData[section].document);
    data.append('document_type', docType);

    try {
      // Show loading state
      setVerificationStatus(prev => ({
        ...prev,
        [section]: 'loading'
      }));
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
      let isVerified = false;

      switch (docType) {
        case 'Aadhaar Card':
          isVerified = 
            important_data.Name?.includes(formData[section].fullName) &&
            important_data['Aadhaar Number']?.replace(/\s/g, '').includes(formData[section].aadharNumber) ;
          // important_data.DOB?.includes(formData[section].dateOfBirth)
          break;

        case 'PAN Card':
          isVerified = 
            important_data.Name?.toLowerCase().includes(formData[section].fullName.toLowerCase()) &&
            important_data['PAN Number']?.includes(formData[section].panNumber);
          break;

        case '10th Marksheet':
        case '12th Marksheet':
          isVerified = 
            important_data.Name?.toLowerCase().includes(formData[section].fullName.toLowerCase()) &&
            important_data['Roll Number']?.includes(formData[section].rollNumber) &&
            important_data.Percentage?.includes(formData[section].percentage);
          break;

        case 'GATE Scorecard':
          isVerified = 
            important_data.Name?.toLowerCase().includes(formData[section].fullName.toLowerCase()) &&
            important_data['Registration Number']?.includes(formData[section].registrationNumber) &&
            important_data['GATE Score']?.includes(formData[section].gateScore);
          break;

        case 'Resume':
          isVerified = 
            important_data.Name?.toLowerCase().includes(formData[section].fullName.toLowerCase()) &&
            important_data['Skills']?.toLowerCase().includes(formData[section].skills.toLowerCase());
          break;
      }

      setVerificationStatus(prev => ({
        ...prev,
        [section]: isVerified
      }));

      alert(isVerified ? 'Document Verified Successfully!' : 'Verification Failed: Information Mismatch');
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
          </TabsContent>
          
        </Tabs>
      </div>
      </div>
    </div>
  );
};

export default LandingPage;