from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Job, JobApplication
from .serializers import JobSerializer, JobApplicationSerializer

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
def apply_for_job(request, job_id):
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role != 'applicant':
        return Response({'message': 'Only applicants can apply to jobs.'}, status=status.HTTP_403_FORBIDDEN)
    
    required_docs = job.required_documents
    data = request.data

    # Validate uploaded document fields
    for doc, fields in required_docs.items():
        for field in fields:
            if field not in data:
                return Response({"error": f"{field} is required for {doc}"}, status=status.HTTP_400_BAD_REQUEST)

    # Explicitly assign the applicant and job
    data["job"] = job_id
    serializer = JobApplicationSerializer(data=data)

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
