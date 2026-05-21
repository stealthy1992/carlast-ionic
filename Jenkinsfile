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
        bat 'appium driver list --installed'
        bat 'npm list wdio-mochawesome-reporter'
        bat 'emulator -list-avds'
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
    stage('Start Emulator') {
        steps {
            bat '''
            @echo off
            adb devices | findstr /C:"emulator-5554" | findstr /C:"device" >nul 2>&1
            if %errorlevel% == 0 (
                echo Emulator already running, skipping start
            ) else (
                echo Starting Pixel_4 emulator...
                start /B emulator -avd Pixel_4 -no-window -no-audio -no-snapshot-load
                echo Waiting 90 seconds for emulator to boot...
                ping -n 91 127.0.0.1 >nul
                echo Done waiting
            )
            '''
            // Small additional buffer before querying device properties
            bat 'ping -n 6 127.0.0.1 >nul'
            bat 'adb -s emulator-5554 shell getprop ro.product.model'
            bat 'adb -s emulator-5554 shell getprop ro.build.version.release'
        }
    }
    stage('Prepare Report Dir') {
        steps {
            bat 'if not exist reports\\appium mkdir reports\\appium'
        }
    }
    stage('Run Appium Tests') {
      steps {
        // catchError lets the stage finish and marks it UNSTABLE
        // instead of FAILED, so the pipeline keeps going
        catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
          bat 'npm run test:appium'
        }
      }
    }
    stage('Generate Test Report') {
        steps {
            catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
            // Rename any .log reporter files to .json so mochawesome-merge can find them
            bat '''
                @echo off
                if exist reports\\appium\\*.log (
                for %%f in (reports\\appium\\*.log) do (
                    echo Renaming %%f to %%~nf.json
                    rename "%%f" "%%~nf.json"
                )
                )
            '''
            bat 'npx mochawesome-merge reports/appium/*.json -o reports/appium/merged.json'
            bat 'npx marge reports/appium/merged.json --reportDir reports/appium/html --inline'
            }
        }
        post {
            always {
            publishHTML(target: [
                allowMissing         : true,
                alwaysLinkToLastBuild: true,
                keepAll              : true,
                reportDir            : 'reports/appium/html',
                reportFiles          : 'merged.html',
                reportName           : 'Appium Test Report'
            ])
            }
        }
    }
  }
  post {
    always {
        // Gracefully kill the emulator; allowEmptyArchive-style tolerance with || exit 0
        bat 'taskkill /F /IM emulator.exe /T || echo No emulator process found'
        archiveArtifacts artifacts: 'android/app/build/outputs/apk/debug/*.apk', fingerprint: true
        archiveArtifacts artifacts: 'appium.log', allowEmptyArchive: true
        archiveArtifacts artifacts: 'tests/appium/**/*.png,tests/appium/**/*.jpg', allowEmptyArchive: true
        archiveArtifacts artifacts: 'reports/appium/**/*', allowEmptyArchive: true
    }
 }
}