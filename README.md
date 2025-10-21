# Node.js CI/CD Pipeline with Jenkins and AWS

This project demonstrates a complete CI/CD pipeline using Jenkins, Docker, and AWS EC2. The pipeline automatically builds, tests, and deploys a Node.js application.

## Project Structure

```
nodejs-ci-cd-app/
├── Jenkinsfile          # Jenkins pipeline configuration
├── Dockerfile          # Docker container configuration
├── package.json        # Node.js dependencies and scripts
├── server.js           # Express.js backend server
├── public/             # Frontend files
│   ├── index.html     # Main HTML page
│   ├── style.css      # CSS styling
│   └── script.js      # JavaScript functionality
└── test/
    └── app.test.js    # Jest test file
```

## Prerequisites

Before setting up the pipeline, ensure you have:

1. **Jenkins Server** - Running and accessible
2. **Docker Hub Account** - For storing Docker images
3. **AWS EC2 Instance** - Ubuntu server with Docker installed
4. **Git Repository** - Code hosted on GitHub/GitLab

## Step 1: Jenkins Setup

### Install Required Jenkins Plugins

1. Go to **Jenkins Dashboard**
2. Navigate to **Manage Jenkins** → **Manage Plugins**
3. Install the following plugins:
   - **Docker Pipeline** - For Docker operations
   - **SSH Agent** - For SSH key management
   - **Credentials Binding** - For credential management
   - **Git** - For source code management

### Configure Jenkins Credentials

#### A. Docker Hub Credentials

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **Add Credentials**
3. Select **Username with password**
4. Fill in the details:
   - **Kind:** Username with password
   - **Scope:** Global
   - **Username:** Your Docker Hub username
   - **Password:** Your Docker Hub password or access token
   - **ID:** `dockerhub-creds`
   - **Description:** Docker Hub credentials for pushing images

#### B. SSH Key Credentials for EC2

1. In **Manage Credentials**, click **Add Credentials**
2. Select **SSH Username with private key**
3. Fill in the details:
   - **Kind:** SSH Username with private key
   - **Scope:** Global
   - **Username:** `ubuntu`
   - **Private Key:** Paste your EC2 private key content
   - **ID:** `aws-ssh-key`
   - **Description:** SSH key for EC2 deployment

### Generate SSH Key (if needed)

If you don't have an SSH key pair:

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key to EC2 server
ssh-copy-id ubuntu@YOUR_EC2_IP

# Copy private key content for Jenkins credentials
cat ~/.ssh/id_rsa
```

## Step 2: EC2 Server Setup

### Install Docker on Ubuntu Server

```bash
# Update system
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Verify Docker installation
docker --version
```

### Configure EC2 Security Group

1. Go to **AWS Console** → **EC2** → **Security Groups**
2. Select your EC2 instance's security group
3. Add inbound rules:
   - **Type:** SSH, **Port:** 22, **Source:** Your IP
   - **Type:** HTTP, **Port:** 80, **Source:** 0.0.0.0/0
   - **Type:** Custom TCP, **Port:** 3000, **Source:** 0.0.0.0/0
   - **Type:** Custom TCP, **Port:** 8080, **Source:** 0.0.0.0/0

## Step 3: Jenkins Pipeline Configuration

### Create New Jenkins Job

1. Go to **Jenkins Dashboard**
2. Click **New Item**
3. Enter job name: `nodejs-ci-cd-pipeline`
4. Select **Pipeline**
5. Click **OK**

### Configure Pipeline

1. In the job configuration:
   - **Pipeline script from SCM**
   - **SCM:** Git
   - **Repository URL:** Your Git repository URL
   - **Branch:** `*/master` (or your main branch)
   - **Script Path:** `Jenkinsfile`

2. Save the configuration

### Update Jenkinsfile Variables

Before running the pipeline, update these variables in the Jenkinsfile:

```groovy
environment {
  DOCKERHUB_REPO = 'your-dockerhub-username/nodejs-ci-cd-app'
  IMAGE_TAG = "${env.BUILD_NUMBER}"
  EC2_HOST = 'YOUR_EC2_PUBLIC_IP'
}
```

## Step 4: Pipeline Execution

### Manual Pipeline Run

1. Go to your Jenkins job
2. Click **Build Now**
3. Monitor the build progress in **Console Output**

### Pipeline Stages Explained

1. **Checkout** - Downloads code from Git repository
2. **Build Docker Image** - Creates Docker image with your app
3. **Testing** - Runs automated tests (currently skipped for speed)
4. **Pushing to Docker Hub** - Uploads image to Docker Hub
5. **Deploy to Docker** - Deploys to EC2 server

## Step 5: Verification

### Check Application Status

1. **SSH into your EC2 server:**
   ```bash
   ssh ubuntu@YOUR_EC2_IP
   ```

2. **Check running containers:**
   ```bash
   sudo docker ps
   ```

3. **View container logs:**
   ```bash
   sudo docker logs nodejs-ci-cd-app
   ```

### Test Application

1. **Open browser and visit:** `http://YOUR_EC2_IP`
2. **Test API endpoint:** `http://YOUR_EC2_IP/api/message`
3. **Expected response:**
   ```json
   {"message": "Hello from Jenkins CI/CD Node.js app!"}
   ```

## Troubleshooting

### Common Issues

#### 1. Docker Hub Push Fails
- Verify Docker Hub credentials in Jenkins
- Check if repository name matches your Docker Hub username
- Ensure Docker Hub repository exists

#### 2. SSH Connection Fails
- Verify SSH key is correctly added to Jenkins credentials
- Test SSH connection manually: `ssh ubuntu@YOUR_EC2_IP`
- Check EC2 security group allows SSH (port 22)

#### 3. Application Not Accessible
- Check EC2 security group allows HTTP (port 80)
- Verify Docker container is running: `sudo docker ps`
- Check container logs: `sudo docker logs nodejs-ci-cd-app`

#### 4. Jenkins Build Fails
- Check Jenkins console output for detailed error messages
- Verify all required plugins are installed
- Ensure Docker is installed on Jenkins server

### Debug Commands

```bash
# Check Jenkins Docker installation
docker --version

# Test Docker Hub login
docker login

# Check EC2 Docker installation
ssh ubuntu@YOUR_EC2_IP "docker --version"

# Test application locally
curl http://YOUR_EC2_IP/api/message
```

## Pipeline Customization

### Enable Tests

To enable automated testing, update the Testing stage in Jenkinsfile:

```groovy
stage('Testing') {
  steps {
    script {
      sh 'docker run --rm -v $(pwd):/usr/src/app -w /usr/src/app node:20-alpine sh -c "npm install --only=dev && npm test"'
    }
  }
}
```

### Add Environment Variables

Add environment-specific configurations:

```groovy
environment {
  NODE_ENV = 'production'
  PORT = '3000'
}
```

### Notification Setup

Add email notifications on build failure:

```groovy
post {
  failure {
    emailext (
      subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
      body: "Build failed. Check console output for details.",
      to: "admin@yourcompany.com"
    )
  }
}
```

## Security Considerations

1. **Use Docker Hub Access Tokens** instead of passwords
2. **Rotate SSH keys** regularly
3. **Restrict EC2 security groups** to specific IP ranges
4. **Use Jenkins secrets** for sensitive data
5. **Enable HTTPS** for production deployments

## Monitoring and Maintenance

### Regular Tasks

1. **Monitor build history** for failed deployments
2. **Update Docker images** regularly
3. **Check EC2 server resources** (CPU, memory, disk)
4. **Review security groups** and access logs
5. **Backup Jenkins configuration** regularly

### Performance Optimization

1. **Use Docker layer caching** for faster builds
2. **Implement parallel stages** for independent tasks
3. **Use Jenkins agents** for distributed builds
4. **Monitor build times** and optimize slow stages

This completes the setup of a production-ready CI/CD pipeline for your Node.js application.
