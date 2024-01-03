# Define VM parameters
$vmName = "TestVM"
$vmMemoryMB = 2048  # Memory in megabytes
$vmDiskSizeMB = 10960  # Disk size in megabytes
$isoURL = "https://releases.ubuntu.com/20.04/ubuntu-20.04.3-live-server-amd64.iso"  # Ubuntu ISO URL
$adapterName = "Ethernet"  # Name of the host network adapter to bridge with

# Combine directory path and file name
$vmVHDPath = "C:\Users\aniru\OneDrive\Documents\Anirudh\Senior-Spring\CIS4010\Parallex\vms"
$fullVHDPath = Join-Path -Path $vmVHDPath -ChildPath "$vmName.vdi"

# Check if the directory for VHD path exists, if not, create it
if (!(Test-Path -Path $vmVHDPath) -or !(Test-Path -Path $fullVHDPath)) {
    New-Item -Path $vmVHDPath -ItemType Directory -Force
}

# Download and install VirtualBox silently
$virtualBoxInstallerUrl = "https://download.virtualbox.org/virtualbox/7.0.12/VirtualBox-7.0.12-159484-Win.exe"  # Update to the latest version
$virtualBoxInstallerPath = "$env:TEMP\VirtualBox-Installer.exe"
Invoke-WebRequest -Uri $virtualBoxInstallerUrl -OutFile $virtualBoxInstallerPath
Start-Process -FilePath $virtualBoxInstallerPath -ArgumentList "/S" -Wait

# Create VM with VirtualBox
VBoxManage createvm --name $vmName --ostype "Ubuntu_64" --register
VBoxManage modifyvm $vmName --memory $vmMemoryMB
VBoxManage createhd --filename "$fullVHDPath" --size $vmDiskSizeMB --format VDI
VBoxManage storagectl $vmName --name "SATA Controller" --add sata --controller IntelAhci
VBoxManage storageattach $vmName --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium "$fullVHDPath"
VBoxManage storageattach $vmName --storagectl "SATA Controller" --port 1 --device 0 --type dvddrive --medium $isoURL

# Set the VM's network adapter to Bridged mode
VBoxManage modifyvm $vmName --nic1 bridged --bridgeadapter1 $adapterName





