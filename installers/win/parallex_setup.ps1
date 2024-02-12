Start-Sleep -Seconds 2
$vmName = "ParallexProviderVM"
$scriptsPath = "$env:USERPROFILE\VirtualBox VMs\SetupScripts"
$plinkFolderPath = "$env:USERPROFILE\VirtualBox VMs\PLink"

if (!(Test-Path -Path $scriptsPath)) {
    New-Item -Path $scriptsPath -ItemType Directory -Force
}

$currDirectory = $PSScriptRoot
$parallexEnvFileToCopy = Join-Path $currDirectory -ChildPath "init_parallex_env.sh"
$parallexEnvFile = Join-Path $scriptsPath -ChildPath "init_parallex_env.sh"
Copy-Item -Path $parallexEnvFileToCopy -Destination $parallexEnvFile -Force

$parallexYamlToCopy = Join-Path $currDirectory -ChildPath "parallex_runtime.yml"
$parallexYamlFile = Join-Path $scriptsPath -ChildPath "parallex_runtime.yml"
Copy-Item -Path $parallexYamlToCopy -Destination $parallexYamlFile -Force


Write-Output "Moving files to guest..."
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName copyto --username parallexprovider --password parallex --target-directory /home/parallexprovider/ "$scriptsPath\init_parallex_env.sh"
Start-Sleep -Seconds 2
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName copyto --username parallexprovider --password parallex --target-directory /home/parallexprovider/ "$scriptsPath\parallex_runtime.yml"
Start-Sleep -Seconds 2

Write-Output "Setting up Parallex Runtime..."

$vmIP = Invoke-Expression -Command "& 'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' guestproperty get '$vmName' '/VirtualBox/GuestInfo/Net/0/V4/IP'"
$outputPrefix = "Value: "
$vmIP = $vmIP -replace $outputPrefix
Start-Sleep -Seconds 2
& "$plinkFolderPath\plink.exe" -ssh -batch parallexprovider@$vmIP -pw parallex "dos2unix ~/init_parallex_env.sh"
& "$plinkFolderPath\plink.exe" -ssh -batch parallexprovider@$vmIP -pw parallex "dos2unix ~/parallex_runtime.yml"
& "$plinkFolderPath\plink.exe" -ssh -batch parallexprovider@$vmIP -pw parallex "bash ~/init_parallex_env.sh"
