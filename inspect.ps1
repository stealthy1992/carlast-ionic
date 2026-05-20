# inspect.ps1
# Run this every time you relaunch the app and need Chrome DevTools inspection

Write-Host "Looking for WebView devtools socket..." -ForegroundColor Cyan

# Find the exact socket name with current PID
$rawOutput = adb shell cat /proc/net/unix
$match = $rawOutput | Select-String "webview_devtools_remote_\d+"

if (-not $match) {
    Write-Host "ERROR: No WebView devtools socket found." -ForegroundColor Red
    Write-Host "Make sure your app is running on the emulator first." -ForegroundColor Yellow
    exit 1
}

# Extract just the socket name
$socket = $match.Matches[0].Value
Write-Host "Found socket: $socket" -ForegroundColor Green

# Remove any stale forward
adb forward --remove tcp:9222 2>$null

# Apply fresh forward with correct PID-based socket name
adb forward tcp:9222 "localabstract:$socket"
Write-Host "Port forward set: tcp:9222 -> $socket" -ForegroundColor Green

# Fetch the JSON and extract devtoolsFrontendUrl
Write-Host "Fetching devtools info from http://localhost:9222/json ..." -ForegroundColor Cyan

try {
    $json = Invoke-RestMethod -Uri "http://localhost:9222/json"
    $devtoolsUrl = $json[0].devtoolsFrontendUrl

    if ($devtoolsUrl) {
        Write-Host "Found devtoolsFrontendUrl: $devtoolsUrl" -ForegroundColor Green
        Write-Host "Opening in Chrome..." -ForegroundColor Cyan
        Start-Process "chrome.exe" $devtoolsUrl
    } else {
        Write-Host "ERROR: devtoolsFrontendUrl not found in JSON response." -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: Could not fetch http://localhost:9222/json" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Falling back to opening the JSON page manually." -ForegroundColor Yellow
    Start-Process "chrome.exe" "http://localhost:9222/json"
}