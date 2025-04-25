from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import json
from .models import Job, JobApplication
from .serializers import JobSerializer, JobApplicationSerializer
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader
from django.utils import timezone 


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
    
    data = request.data
    
    # Parse nested JSON from 'data' key
    try:
        parsed_data = json.loads(data['data']) if isinstance(data.get('data'), str) else data.get('data', {})
    except (KeyError, json.JSONDecodeError):
        return Response({"error": "Invalid data format"}, status=status.HTTP_400_BAD_REQUEST)

    # Debug logging
    print("Parsed Data:", parsed_data)
    print("Files:", request.FILES)

    # Define file field mappings
    file_field_mappings = {
        'aadhaar_image': 'aadhaar_image_url',
        'pan_image': 'pan_image_url',
        'marks_10th_image': 'marks_10th_image_url',
        'marks_12th_image': 'marks_12th_image_url',
        'gate_image': 'gate_image_url',
        'resume_file': 'resume_url'
    }

    # Handle file uploads to Cloudinary
    for file_field, url_field in file_field_mappings.items():
        if file_field in request.FILES:
            try:
                uploaded_file = request.FILES[file_field]
                upload_result = cloudinary.uploader.upload(
                    uploaded_file,
                    folder="certicheck/documents/",
                    resource_type="auto",
                    allowed_formats=['pdf', 'png', 'jpg', 'jpeg'],
                    max_length=10 * 1024 * 1024  # 10MB limit
                )
                parsed_data[url_field] = upload_result['secure_url']
                print(f"Uploaded {file_field} to: {parsed_data[url_field]}")
            except Exception as e:
                print(f"Error uploading {file_field}: {str(e)}")
                return Response(
                    {"error": f"Upload failed for {file_field}: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

    # Add application metadata
    parsed_data.update({
        "job": job_id,
        "application_date": timezone.now(),
        "status": "pending",
        "verification_status": parsed_data.get('verification_status', {})
    })

    # Validate and save application
    serializer = JobApplicationSerializer(data=parsed_data)
    if serializer.is_valid():
        try:
            application = serializer.save(applicant=request.user)
            return Response({
                "message": "Application submitted successfully",
                "application_id": application.id,
                
                "job_id": job_id,
                "document_urls": {
                    field: parsed_data.get(url_field)
                    for field, url_field in file_field_mappings.items()
                    if url_field in parsed_data
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error saving application: {str(e)}")
            return Response(
                {"error": "Failed to save application"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    print("Serializer errors:", serializer.errors)
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
