pipeline {
    agent any

    environment {
        BACKEND_DIR = 'certidrf'
        FRONTEND_DIR = 'certireact'
        VENV_PATH = 'C:\Users\niran\Desktop\certicheck react+drf\certidrf\.venv\Scripts'  // Adjusted to point to the virtual environment
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    echo 'Setting up environment...'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Installing backend dependencies...'
                    bat "${VENV_PATH}\\python -m pip install -r requirements.txt"
                }
            }
        }

        stage('Load Environment Variables') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Loading environment variables from .env file...'
                    // Use python-dotenv to load the .env file
                    bat "${VENV_PATH}\\python -m dotenv"
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Running backend tests...'
                    bat "${VENV_PATH}\\python manage.py test"
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
                    // Add deployment steps here
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
