import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
const [selectedJob, setSelectedJob] = useState(null);
const [jobApplications, setJobApplications] = useState([]);
const [showJobDetail, setShowJobDetail] = useState(false);
const [selectedApplication, setSelectedApplication] = useState(null);

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