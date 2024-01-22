
$vmName = "ParallexProviderVM"
$scriptsPath = "$env:USERPROFILE\VirtualBox VMs\SetupScripts"
$plinkFolderPath = "$env:USERPROFILE\VirtualBox VMs\PLink"

# Check if the directory for VHD path exists, if not, create it
if (!(Test-Path -Path $scriptsPath)) {
    New-Item -Path $scriptsPath -ItemType Directory -Force
}

if (!(Test-Path -Path $plinkFolderPath)) {
    New-Item -Path $pLinkFolderPath -ItemType Directory -Force
}


$scriptDirectory = $PSScriptRoot
$sudoToCopy = Join-Path $scriptDirectory -ChildPath "add_sudo_user.sh"
$sudoFile = Join-Path $destinationDirectory -ChildPath "add_sudo_user.sh"
Copy-Item -Path $sudoToCopy -Destination $sudoFile -Force

$sshToCopy = Join-Path $scriptDirectory -ChildPath "setup_ssh.sh"
$sshFile = Join-Path $destinationDirectory -ChildPath "setup_ssh.sh"

Copy-Item -Path $sshToCopy -Destination $sshFile -Force


Write-Output "Moving files to guest..."
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName copyto --username parallexprovider --password parallex --target-directory /tmp/ "$scriptsPath\add_sudo_user.sh"
Start-Sleep -Seconds 1
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName copyto --username parallexprovider --password parallex --target-directory /tmp/ "$scriptsPath\setup_ssh.sh"
Start-Sleep -Seconds 1
Write-Output "Adding parallexprovider to sudoers..."
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName run --exe "/bin/bash" --username parallexprovider --password parallex --wait-stdout -- -c "bash /tmp/add_sudo_user.sh"
Start-Sleep -Seconds 2
Write-Output "Initializing SSH service..."
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName run --exe "/bin/bash" --username parallexprovider --password parallex --wait-stdout -- -c "echo parallex | sudo -S bash /tmp/setup_ssh.sh"
Start-Sleep -Seconds 2

# Need to download plink
$plinkUrl="https://the.earth.li/~sgtatham/putty/latest/w64/plink.exe"
Write-Output "Downloading PLink..."
Invoke-WebRequest -Uri $plinkUrl -OutFile "$plinkFolderPath\plink.exe"

$vmIP = Invoke-Expression -Command "& 'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe' guestproperty get '$vmName' '/VirtualBox/GuestInfo/Net/0/V4/IP'"
$outputPrefix = "Value: "
$vmIP = $vmIP -replace $outputPrefix

Write-Output "y" | & "$plinkFolderPath\plink.exe" -ssh parallexprovider@$vmIP -pw parallex "exit"
Start-Sleep -Seconds 2

