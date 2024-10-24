pipeline {
    agent {
        docker {
            image 'node:20.12.0' // Use a Node.js image
            args '-v /var/run/docker.sock:/var/run/docker.sock --user root' // Run as root to have Docker access
        }
    }

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials-id') // Docker Hub credentials stored in Jenkins
        DOCKER_HUB_REPO = 'mootezfarwa/noderepo' // Docker Hub repository name
        KUBECONFIG_CRED = credentials('jenkins-kind') // Kubeconfig or Token Secret ID
    }

    stages {
        stage("Checkout") {
            steps {
                checkout scm // Checkout code from the source control
            }
        }

        stage("Install Docker and kubectl") {
            steps {
                script {
                    // Update package list, install Docker and kubectl
                    sh '''
                    apt-get update
                    apt-get install -y docker.io
                    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
                    chmod +x kubectl
                    mv kubectl /usr/local/bin/
                    '''
                }
            }
        }

        stage("Install Dependencies") {
            steps {
                script {
                    // Install Node.js dependencies
                    sh 'npm install'
                }
            }
        }

        stage("Remove Existing Docker Image") { // New stage to remove existing images
            steps {
                script {
                    sh """
                    if docker images | grep -q 'my-backend-image'; then
                        docker rmi -f my-backend-image:latest
                    fi
                    """
                }
            }
        }

        stage("Build Docker Image") {
            steps {
                script {
                    // Build the Docker image
                    sh 'docker build -t my-backend-image:latest .'
                }
            }
        }

        stage("Push Docker Image to Docker Hub") {
            steps {
                script {
                    // Tag the Docker image for Docker Hub
                    sh "docker tag my-backend-image:latest ${DOCKER_HUB_REPO}:latest"
                    
                    // Push the Docker image to Docker Hub
                    sh "echo ${DOCKER_HUB_CREDENTIALS_PSW} | docker login -u ${DOCKER_HUB_CREDENTIALS_USR} --password-stdin"
                    sh "docker push ${DOCKER_HUB_REPO}:latest"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                // Deploy the application using kubectl
                withKubeConfig([credentialsId: 'jenkins-kind', serverUrl: 'https://192.168.1.76:6443']) {
                    sh 'kubectl apply -f deployment.yaml'
                }
            }
        }
    }

    post {
        always {
            echo 'Build completed.'
        }

        success {
            echo 'Build was successful!'
        }

        failure {
            echo 'Build failed. Check the logs for more information.'
        }
    }
}
