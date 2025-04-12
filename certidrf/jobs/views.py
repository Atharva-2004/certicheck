from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import json
from .models import Job, JobApplication
from .serializers import JobSerializer, JobApplicationSerializer
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_job(request):
    if request.user.role != "recruiter":
        return Response({'message':'You should be a recruiter to create a job.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = JobSerializer(data=request.data)

    if serializer.is_valid():
        # ✅ Explicitly assign recruiter before saving
        serializer.save(recruiter=request.user)  
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 📄 List all jobs
@api_view(["GET"])
def list_jobs(request):
    jobs = Job.objects.all()
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 📄 List jobs created by the recruiter
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_created_jobs_by_recruiter(request):
    """List all jobs created by the authenticated recruiter."""
    if request.user.role != 'recruiter':
        return Response({'error': 'Only recruiters can view their created jobs.'}, status=status.HTTP_403_FORBIDDEN)

    # Filter jobs by the current recruiter
    jobs = Job.objects.filter(recruiter=request.user)
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_applied_jobs(request):
    """List all jobs the authenticated applicant has applied to."""
    if request.user.role != 'applicant':
        return Response({'error': 'Only applicants can view their applied jobs.'}, status=status.HTTP_403_FORBIDDEN)

    # Filter JobApplication by the current user
    applications = JobApplication.objects.filter(applicant=request.user)
    applied_jobs = [application.job for application in applications]

    # Serialize the job data
    serializer = JobSerializer(applied_jobs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 🔍 Retrieve a specific job
@api_view(["GET"])
def retrieve_job(request, job_id):
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = JobSerializer(job)
    return Response(serializer.data, status=status.HTTP_200_OK)

# 📥 Apply for a job
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def apply_for_job(request, job_id):
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != 'applicant':
        return Response({'message': 'Only applicants can apply to jobs.'}, status=status.HTTP_403_FORBIDDEN)
    
    required_docs = job.required_documents
    data = request.data

    # Parse nested JSON from 'data' key if it exists and is a string
    if 'data' in data:
        try:
            if isinstance(data['data'], str):
                parsed_data = json.loads(data['data'])  # Parse the JSON string
            else:
                parsed_data = data['data']
        except (KeyError, json.JSONDecodeError):
            return Response({"error": "Invalid data format"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        parsed_data = data

    # Debug logging to inspect parsed data
    print("Parsed Data:", parsed_data)

    # Validate uploaded document fields
    for doc, fields in required_docs.items():
        for field in fields:
            if field not in parsed_data and field not in request.FILES:
                return Response({"error": f"{field} is required for {doc}"}, status=status.HTTP_400_BAD_REQUEST)
            
    # 3. Handle file uploads to Cloudinary and store in correct keys
    for file_field in request.FILES:
        uploaded_file = request.FILES[file_field]
        try:
            upload_result = cloudinary.uploader.upload(uploaded_file)
            # Map uploaded file URL to the corresponding field in parsed_data
            parsed_data[file_field + '_url'] = upload_result.get('secure_url')
        except Exception as e:
            return Response({"error": f"Upload failed for {file_field}: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # Explicitly assign the applicant and job
    parsed_data["job"] = job_id
    serializer = JobApplicationSerializer(data=parsed_data)

    if serializer.is_valid():
        serializer.save(applicant=request.user)  # Assign the applicant explicitly
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 📜 List job applications (Recruiter only)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_applications(request, job_id):
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.user != job.recruiter:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    applications = JobApplication.objects.filter(job=job)
    serializer = JobApplicationSerializer(applications, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
