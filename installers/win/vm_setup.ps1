
$vmName = "ParallexProviderVM"
$scriptsPath = "$env:USERPROFILE\VirtualBox VMs\SetupScripts"

# Check if the directory for VHD path exists, if not, create it
if (!(Test-Path -Path $scriptsPath)) {
    New-Item -Path $vmVHDPath -ItemType Directory -Force
}

& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName copyto --username parallexprovider --password parallex --target-directory /tmp/ "$scriptsPath\add_sudo_user.sh"
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName copyto --username parallexprovider --password parallex --target-directory /tmp/ "$sciptsPath\setup_ssh.sh"

& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName run --exe "/bin/bash" --username parallexprovider --password parallex --wait-stdout -- -c "bash /tmp/add_sudo_user.sh"
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" guestcontrol $vmName run --exe "/bin/bash" --username parallexprovider --password parallex --wait-stdout -- -c "echo parallex | sudo -S bash /tmp/setup_ssh.sh"

