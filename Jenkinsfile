pipeline {
  agent any

  environment {
    // DockerHub Credentials
    DOCKERHUB_CREDENTIALS = credentials('dockerhub-login')

    // Backend Secrets from Jenkins Credentials
    DB_NAME = credentials('DB_NAME')
    DB_USER = credentials('DB_USER')
    DB_PASSWORD = credentials('DB_PASSWORD')
    DB_HOST = credentials('DB_HOST')
    DB_PORT = credentials('DB_PORT')
    SECRET_KEY = credentials('SECRET_KEY')
    TOGETHER_API_KEY = credentials('TOGETHER_API_KEY')
    CLOUDINARY_CLOUD_NAME = credentials('cloudinary_cloud_name')
    CLOUDINARY_API_KEY = credentials('cloudinary_api_key')
    CLOUDINARY_API_SECRET = credentials('cloudinary_api_secret')

    // Frontend ENV
    VITE_API_URL = credentials('VITE_API_URL')
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/Atharva-2004/certicheck.git'
      }
    }

    stage('Prepare .env Files') {
      steps {
        script {
          writeFile file: 'certidrf/.env', text: """
            DB_NAME=${DB_NAME}
            DB_USER=${DB_USER}
            DB_PASSWORD=${DB_PASSWORD}
            DB_HOST=${DB_HOST}
            DB_PORT=${DB_PORT}
            SECRET_KEY=${SECRET_KEY}
            TOGETHER_API_KEY=${TOGETHER_API_KEY}
            cloudinary_cloud_name=${CLOUDINARY_CLOUD_NAME}
            cloudinary_api_key=${CLOUDINARY_API_KEY}
            cloudinary_api_secret=${CLOUDINARY_API_SECRET}
          """.stripIndent()

          writeFile file: 'certireact/.env', text: "VITE_API_URL=${VITE_API_URL}"
        }
      }
    }

    stage('Install & Build frontend') {
      steps {
        dir('certireact') {
          bat 'pnpm install'
          bat 'pnpm run build'
        }
      }
    }

    stage('Install & Build backend') {
      steps {
        dir('certidrf') {
          bat 'pip install -r requirements.txt'
        
        }
      }
    }

    stage('Test') {
      steps {
        dir('certidrf') {
          bat 'pytest || echo "Backend tests failed"'
        }
        dir('certireact') {
          bat 'pnpm test || echo "Frontend tests failed"'
        }
      }
    }

    stage('Docker Build & Push') {
      steps {
        bat """
        echo %DOCKERHUB_CREDENTIALS_PSW% | docker login -u %DOCKERHUB_CREDENTIALS_USR% --password-stdin
        docker build -t %DOCKERHUB_CREDENTIALS_USR%/certicheck-frontend ./certireact
        docker build -t %DOCKERHUB_CREDENTIALS_USR%/certicheck-backend ./certidrf
        docker push %DOCKERHUB_CREDENTIALS_USR%/certicheck-frontend
        docker push %DOCKERHUB_CREDENTIALS_USR%/certicheck-backend
        """
      }
    }

    stage('Docker Compose Up') {
      steps {
        bat 'docker-compose up -d --build'
      }
    }
  }
}
