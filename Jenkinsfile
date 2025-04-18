pipeline {
    agent any

    environment {
        BACKEND_DIR = 'certidrf'
        FRONTEND_DIR = 'certireact'
        VENV_PATH = 'C:\\Users\\niran\\Desktop\\certicheck react+drf\\certidrf\\.venv\\Scripts'
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    echo 'Setting up environment...'
                }
            }
        }

        stage('Inject .env from Jenkins') {
            steps {
                withCredentials([file(credentialsId: 'env_file', variable: 'ENV_FILE')]) {
                    dir("${BACKEND_DIR}") {
                        echo 'Injecting environment variables from .env file...'
                        bat """
                        for /f "usebackq delims=" %%a in ("%ENV_FILE%") do (
                            set "%%a"
                        )
                        """
                    }
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Installing backend dependencies...'
                    bat "\"${VENV_PATH}\\python.exe\" -m pip install -r requirements.txt"
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo 'Running backend tests...'
                    bat "\"${VENV_PATH}\\python.exe\" manage.py test"
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
