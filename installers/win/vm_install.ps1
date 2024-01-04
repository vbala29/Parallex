# Define VM parameters
$vmName = "TestVM"
$vmMemoryMB = 2048  # Memory in megabytes
$vmDiskSizeMB = 10960  # Disk size in megabytes
$isoURL = "https://releases.ubuntu.com/20.04/ubuntu-20.04.3-live-server-amd64.iso"  # Ubuntu ISO URL
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

# Retrieve all network adapters excluding those with "Virtual" in their name and that are up
$nonVirtualAdapters = Get-NetAdapter | Where-Object { $_.Name -notlike '*Virtual*' -and $_.Status -eq 'Up' }

# Select Ethernet adapter if available, otherwise select Wi-Fi
$preferredAdapter = $nonVirtualAdapters | Where-Object { $_.Name -like '*Ethernet*' } | Select-Object -First 1

if (-not $preferredAdapter) {
    $preferredAdapter = $nonVirtualAdapters | Where-Object { $_.Name -like '*Wi-Fi*' } | Select-Object -First 1
}

# Save the name of the preferred adapter in the adapterName variable
$adapterName = $null
if ($preferredAdapter) {
    $adapterName = $preferredAdapter.Name
}

# Output the name of the preferred adapter
if ($adapterName) {
    VBoxManage modifyvm $vmName --nic1 bridged --bridgeadapter1 $adapterName
} else {
    Write-Output "No suitable adapter found."
}
