import base64
import together
import os
import re
import numpy as np
import cv2
from rest_framework.decorators import api_view, parser_classes
from django.contrib.auth.decorators import login_required
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.conf import settings

# Initialize Together AI client with API key
TOGETHER_API_KEY = settings.TOGETHER_API_KEY
client = together.Together(api_key=TOGETHER_API_KEY)

# ✅ Function to encode an image as Base64
def encode_image(image):
    return base64.b64encode(image.read()).decode("utf-8")

# ✅ Function to clean extracted text
def clean_text(text):
    text = re.sub(r'\*\*|\*', '', text)  # Remove Markdown markers
    text = re.sub(r'\s*:\s*', ': ', text)  # Fix spaces around colons
    text = re.sub(r'\s+', ' ', text).strip()  # Remove extra spaces
    text = text.replace("\\", "")  # Remove backslashes
    text = text.replace("\"", "")  # Remove double quotes
    return text

# ✅ Function to extract text using Together AI
def extract_text_from_image(image):
    base64_image = encode_image(image)

    response = client.chat.completions.create(
        model="meta-llama/Llama-Vision-Free",
        temperature=0.05,  # Lower randomness
        messages=[
            {
                "role": "user",
                "content": [
                            {"type": "text", "text": 
                            "Extract all readable text from this document while preserving the table or column structure. "
                            "If the document contains tabular data, format it clearly using commas or JSON-like format. "
                            "Return important info in KEY: VALUE PAIRS :"
                            "Name, Aadhar Number, DOB, Address, Mobile, PAN Number, Father's Name, Seat Number, Percentage, Divisional Board, Reg. No., GATE Score as keys"
                            "Do not classify it. Just return text as it appears, maintaining its structure."
                }, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }
        ],
        stream=False
    )

    try:
        extracted_text = response.choices[0].message.content
        return clean_text(extracted_text.strip())
    except:
        return "Error extracting text"

# ✅ Predefined document keywords for verification
document_keywords = {
    "Aadhaar Card": ["Unique Identification Authority", "Aadhaar Number", "Government of India", "Unique Identification"],
    "PAN Card": ["Income Tax Department", "Permanent Account Number", "Govt. of India"],
    "10th Marksheet": ["Secondary School Certificate", "10th Standard", "Board of Secondary Education"],
    "12th Marksheet": ["Higher Secondary Certificate", "12th Standard", "Senior Secondary", "Hr.Sec.School No."],
    "GATE Scorecard": ["Graduate Aptitude Test in Engineering", "GATE Score", "GATE Examination"],
    "Resume": ["Curriculum Vitae", "CV", "Resume", "Work Experience"],
    "Degree Certificate": ["Bachelor of", "Master of", "Doctor of", "University", "Degree"]
}

# ✅ Function to extract important details based on document type
def extract_important_details(doc_type, text):
    extracted_data = {}

    if doc_type == "Aadhaar Card":
        extracted_data["Aadhaar Number"] = re.findall(r"\d{4}\s\d{4}\s\d{4}", text)
        extracted_data["Name"] = next(iter(re.findall(r"Name:\s*([A-Za-z ]+?)(?=\s*(Address|Aadhaar|DOB|Date|Mobile|$))", text)), "Not Found")
        extracted_data["DOB"] = re.findall(r"(?:DOB|Date of Birth):\s*(\d{2}/\d{2}/\d{4})", text)
        extracted_data["Address"] = next(iter(re.findall(r"Address:\s*(.+?)(?=\s*(Mobile|Aadhaar|Date|Aadhar|DOB|Seat))", text)), "Not Found")
        extracted_data["Mobile"] = re.findall(r"Mobile:\s*(\d{10})", text)

    elif doc_type == "PAN Card":
        extracted_data["PAN Number"] = re.findall(r"[A-Z]{5}\d{4}[A-Z]", text)
        extracted_data["Name"] = next(iter(re.findall(r"Name:\s*([A-Za-z ]+?)(?=\s*(Address|Aadhaar|Aadhar|Seat|DOB|Date|Mobile|$))", text)), "Not Found")
        extracted_data["DOB"] = re.findall(r"(?:DOB|Date of Birth):\s*(\d{2}/\d{2}/\d{4})", text)
        extracted_data["Father's Name"] = next(iter(re.findall(r"Father's Name:\s*([A-Za-z ]+?)(?=\s*(Address|Aadhaar|Aadhar|Seat|DOB|Date|Mobile|$))", text)), "Not Found")

    elif doc_type == "10th Marksheet":
        extracted_data["Name"] = next(iter(re.findall(r"Name:\s*([A-Za-z ]+?)(?=\s*(Address|Aadhaar|Aadhar|Seat|DOB|Date|Mobile|$))", text)), "Not Found")
        extracted_data["Roll Number"] = re.findall(r"Seat(?: No\.?| Number)\s*:\s*([\w\d]+)", text)
        extracted_data["Percentage"] = re.findall(r"Percentage:\s*([\d\.]+)", text)

        # Important: Make sure to return a list for Board, not a single string
        if "Maharashtra State Board of Secondary and Higher Secondary Education" or "Higher Secondary Certificate Examination in Maharashtra" in text:
            extracted_data["Board"] = ["Maharashtra State Board of Secondary and Higher Secondary Education"]
        elif "Central Board of Secondary Education" in text:
            extracted_data["Board"] = ["Central Board of Secondary Education"]
        elif "Council for the Indian School Certificate Examinations" in text:
            extracted_data["Board"] = ["Council for the Indian School Certificate Examinations"]
        else:
            extracted_data["Board"] = []  # Empty list for "Not Found" case


    elif doc_type == "12th Marksheet":
        extracted_data["Name"] = re.findall(r"Name:\s*([\w\s]+)", text)
        name = extracted_data["Name"][0].strip()
        print(type(extracted_data["Name"]))
        print(extracted_data["Name"])
        print(extracted_data["Name"][0].strip())
        extracted_data["Name"] = name
        # name = name.group(1).strip()
        extracted_data["Roll Number"] = re.findall(r"Seat(?: No\.?| Number)\s*:\s*([\w\d]+)", text)
        extracted_data["Percentage"] = re.findall(r"Percentage:\s*([\d\.]+)", text)

        # Important: Make sure to return a list for Board, not a single string
        if "Maharashtra State Board of Secondary and Higher Secondary Education" or "Higher Secondary Certificate Examination in Maharashtra" in text:
            extracted_data["Board"] = ["Maharashtra State Board of Secondary and Higher Secondary Education"]
        elif "Central Board of Secondary Education" in text:
            extracted_data["Board"] = ["Central Board of Secondary Education"]
        elif "Council for the Indian School Certificate Examinations" in text:
            extracted_data["Board"] = ["Council for the Indian School Certificate Examinations"]
        else:
            extracted_data["Board"] = []  # Empty list for "Not Found" case

    elif doc_type == "GATE Scorecard":
        extracted_data["Name"] = re.findall(r"Candidate Name:\s([A-Za-z ]+)", text)
        extracted_data["Registration Number"] = re.findall(r"Reg. No:\s(\w+)", text)
        extracted_data["GATE Score"] = re.findall(r"GATE Score:\s(\d+)", text)
        extracted_data["AIR"] = re.findall(r"AIR:\s(\d+)", text)

    elif doc_type == "Resume":
        extracted_data["Name"] = re.findall(r"Name:\s([A-Za-z ]+)", text)
        extracted_data["Contact Info"] = re.findall(r"(\+\d{1,2}\s\d{10}|\d{10})", text)
        extracted_data["Experience"] = re.findall(r"Experience:\s(\d+ years)", text)
        extracted_data["Skills"] = re.findall(r"Skills:\s([A-Za-z, ]+)", text)

    elif doc_type == "Degree Certificate":
        extracted_data["Name"] = re.findall(r"Name:\s([A-Za-z ]+)", text)
        extracted_data["Degree"] = re.findall(r"Degree:\s([A-Za-z ]+)", text)
        extracted_data["University"] = re.findall(r"University:\s([A-Za-z ]+)", text)
        extracted_data["Year of Passing"] = re.findall(r"Year:\s(\d{4})", text)

    return {key: value if isinstance(value, str) else (value[0] if value else "Not Found") for key, value in extracted_data.items()}

# ✅ API to process document and verify type
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def process_document(request):
    """Handles document image uploads for OCR and verification"""
    image = request.FILES.get("image")
    given_doc_type = request.data.get("document_type")  # User-provided document type

    if not image:
        return Response({"error": "No image provided."}, status=400)
    
    if not given_doc_type:
        return Response({"error": "Document type not provided."}, status=400)

    extracted_text = extract_text_from_image(image)
    
    if extracted_text == "illegitimate doc":
        return Response({"error": "Illegitimate Document."}, status=400)
    
    # ✅ Verify if the given document type matches extracted text
    keywords = document_keywords.get(given_doc_type, [])
    match_count = sum(1 for keyword in keywords if keyword.lower() in extracted_text.lower())

    if match_count == 0:
        return Response({"error": "Document type mismatch. Provided document type does not match extracted text."}, status=400)

    important_data = extract_important_details(given_doc_type, extracted_text)

    return Response({
        "document_type": given_doc_type,
        "extracted_text": extracted_text,
        "important_data": important_data
    }, status=200)
