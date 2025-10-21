pipeline {
  agent any

  options {
    // Always run even if no SCM changes
    skipDefaultCheckout(false)
    buildDiscarder(logRotator(numToKeepStr: '10'))
  }

  environment {
    DOCKERHUB_REPO = 'vinayyalla6470/nodejs-ci-cd-app'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    EC2_HOST = '13.60.98.2'
  }

  tools {
    nodejs 'NodeJS_20'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          sh 'docker build -t $DOCKERHUB_REPO:$IMAGE_TAG .'
        }
      }
    }

    stage('Test') {
      steps {
        script {
          sh 'npm install'
          sh 'npm test'
        }
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
          sh 'docker push $DOCKERHUB_REPO:$IMAGE_TAG'
        }
      }
    }

    stage('Deploy to AWS EC2') {
      steps {
        sshagent (credentials: ['aws-ssh-key']) {
          sh """
            ssh -o StrictHostKeyChecking=no ec2-user@${EC2_HOST} \
              'sudo docker pull ${DOCKERHUB_REPO}:${IMAGE_TAG} && \
               (sudo docker rm -f nodejs-ci-cd-app || true) && \
               sudo docker run -d --name nodejs-ci-cd-app -p 80:3000 ${DOCKERHUB_REPO}:${IMAGE_TAG}'
          """
        }
      }
    }
  }
}
