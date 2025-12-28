# PowerShell Script to Update and Launch NDAX Dashboard

# Set-ExecutionPolicy Bypass -Scope Process -Force

# Pull the latest code from the main branch
Write-Output "Pulling the latest code from the main branch..."
git pull origin main

# Run npm install to update/install dependencies
Write-Output "Updating/installing dependencies with npm..."
npm install

# Run npm run build to build the frontend
Write-Output "Building the frontend..."
npm run build

# Start the app using npm start (production mode)
Write-Output "Starting the application in production mode..."
npm start &

# Wait a few seconds for the app to start
Start-Sleep -Seconds 5

# Open the dashboard in the default browser
$dashboardUrl = "http://localhost:3000"
Write-Output "Opening the dashboard at $dashboardUrl..."
Start-Process $dashboardUrl

# Create a desktop shortcut for one-click operation
$shortcutPath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'NDAX Dashboard.lnk')
$scriptPath = [System.IO.Path]::GetFullPath($MyInvocation.MyCommand.Path)
$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $scriptPath
$shortcut.WindowStyle = 1
$shortcut.Save()

Write-Output "Shortcut created at $shortcutPath"