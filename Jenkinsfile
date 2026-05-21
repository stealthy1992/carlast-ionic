pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 60, unit: 'MINUTES')
  }

  environment {
    CI = 'true'
    VITE_SANITY_PROJECT_ID = 'bushe0bq'
    VITE_SANITY_DATASET = 'production'
    VITE_SANITY_API_VERSION = '2022-03-10'
    VITE_RENT_API_URL = 'https://carlast.vercel.app/api/submit-rent'
  }

  stages {
    stage('Verify Tools') {
      steps {
        bat 'node --version'
        bat 'npm --version'
        bat 'java -version'
        bat 'where adb'
        bat 'where appium'
        bat 'adb devices'
      }
    }

    stage('Install Dependencies') {
      steps {
        bat 'npm ci'
      }
    }

    stage('Write Mobile Env') {
      steps {
        writeFile file: '.env.local', text: """VITE_SANITY_PROJECT_ID=${env.VITE_SANITY_PROJECT_ID}
VITE_SANITY_DATASET=${env.VITE_SANITY_DATASET}
VITE_SANITY_API_VERSION=${env.VITE_SANITY_API_VERSION}
VITE_RENT_API_URL=${env.VITE_RENT_API_URL}
"""
      }
    }

    stage('Build Ionic') {
      steps {
        bat 'npm run build'
        bat 'npx cap sync android'
      }
    }

    stage('Build Debug APK') {
      steps {
        dir('android') {
          bat '.\\gradlew.bat assembleDebug'
        }
      }
    }

    stage('Run Appium Tests') {
      steps {
        bat 'npm run test:appium'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'android/app/build/outputs/apk/debug/*.apk', fingerprint: true
      archiveArtifacts artifacts: 'appium.log', allowEmptyArchive: true
      archiveArtifacts artifacts: 'tests/appium/**/*.png,tests/appium/**/*.jpg', allowEmptyArchive: true
    }
  }
}
