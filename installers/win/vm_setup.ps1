
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


& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName copyto --username parallexprovider --password parallex --target-directory /tmp/ "$scriptsPath\add_sudo_user.sh"
Start-Sleep -Seconds 1
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName copyto --username parallexprovider --password parallex --target-directory /tmp/ "$scriptsPath\setup_ssh.sh"
Start-Sleep -Seconds 1
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName run --exe "/bin/bash" --username parallexprovider --password parallex --wait-stdout -- -c "bash /tmp/add_sudo_user.sh"
Start-Sleep -Seconds 1
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName run --exe "/bin/bash" --username parallexprovider --password parallex --wait-stdout -- -c "echo parallex | sudo -S bash /tmp/setup_ssh.sh"
Start-Sleep -Seconds 1

# Need to download plink
$plinkUrl="https://the.earth.li/~sgtatham/putty/latest/w64/plink.exe"
Write-Output "Downloading PLink..."
Invoke-WebRequest -Uri $plinkUrl -OutFile "$plinkFolderPath\plink.exe"

