pipeline {
    agent any

    environment {
        BACKEND_DIR = 'certidrf'
        FRONTEND_DIR = 'certireact'
        VENV_DIR = "${WORKSPACE}\\.venv"  // Create a virtual environment in Jenkins workspace
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    echo 'Setting up environment...'
                }
            }
        }

        stage('Inject Global Jenkins Credentials') {
            steps {
                withCredentials([
                    string(credentialsId: 'SECRET_KEY', variable: 'SECRET_KEY'),
                    string(credentialsId: 'DB_NAME', variable: 'DB_NAME'),
                    string(credentialsId: 'DB_USER', variable: 'DB_USER'),
                    string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                    string(credentialsId: 'DB_HOST', variable: 'DB_HOST'),
                    string(credentialsId: 'DB_PORT', variable: 'DB_PORT'),
                    string(credentialsId: 'TOGETHER_API_KEY', variable: 'TOGETHER_API_KEY'),
                    string(credentialsId: 'cloudinary_cloud_name', variable: 'cloudinary_cloud_name'),
                    string(credentialsId: 'cloudinary_api_key', variable: 'cloudinary_api_key'),
                    string(credentialsId: 'cloudinary_api_secret', variable: 'cloudinary_api_secret')
                ]) {
                    echo 'Global credentials injected into environment variables.'
                }
            }
        }

        stage('Create Virtual Environment') {
            steps {
                script {
                    echo 'Creating a virtual environment...'
                    bat "python -m venv ${VENV_DIR}"  // Create the virtual environment in Jenkins workspace
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Installing backend dependencies...'
                    bat "\"${VENV_DIR}\\Scripts\\python.exe\" -m pip install -r requirements.txt"  // Use the newly created virtual environment
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Running backend tests...'
                    bat "\"${VENV_DIR}\\Scripts\\python.exe\" manage.py test"  // Run tests with the virtual environment
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir("${FRONTEND_DIR}") {
                    echo 'Installing frontend dependencies...'
                    bat 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    echo 'Building frontend...'
                    bat 'npm run build'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying application...'
                    // Add actual deployment steps here
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Pipeline succeeded.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
