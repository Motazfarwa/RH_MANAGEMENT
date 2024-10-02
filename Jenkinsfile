pipeline {
    agent any

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:20.12.0'
                    reuseNode true
                }
            }
            steps {
                sh '''
                     ls -la
                     node --version
                     npm --version
                     npm ci
                     npm run build
                     ls -la
                '''
            }
        }
    }
}
     
