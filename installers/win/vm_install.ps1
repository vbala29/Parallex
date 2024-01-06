# Define VM parameters
$vmName = "ParallexProviderVM"
$vmMemoryMB = 2048  # Memory in megabytes
$vmDiskSizeMB = 8960  # Disk size in megabytes
$isoURL = "https://releases.ubuntu.com/focal/ubuntu-20.04.6-live-server-amd64.iso"  # Ubuntu ISO URL
# Combine directory path and file name
$vmVHDPath = "$env:USERPROFILE\VirtualBox VMs"
$fullVHDPath = Join-Path -Path $vmVHDPath -ChildPath "$vmName.vdi"

# Check if the directory for VHD path exists, if not, create it
if (!(Test-Path -Path $vmVHDPath) -or !(Test-Path -Path $fullVHDPath)) {
    New-Item -Path $vmVHDPath -ItemType Directory -Force
}

# Download and install VirtualBox silently
$virtualBoxInstallerUrl = "https://download.virtualbox.org/virtualbox/7.0.12/VirtualBox-7.0.12-159484-Win.exe"  # Update to the latest version
$virtualBoxInstallerPath = "$env:TEMP\VirtualBox-Installer.exe"
$isoPath = "C:\Users\aniru\AppData\Local\Temp\ubuntu-20.04.6-live-server-amd64.iso"
Write-Output "Downloading VirtualBox Installer..."
# Invoke-WebRequest -Uri $virtualBoxInstallerUrl -OutFile $virtualBoxInstallerPath

Write-Output "Installing VirtualBox..."
# Assuming $virtualBoxInstallerPath contains the path to your installer
Start-Process -FilePath $virtualBoxInstallerPath -ArgumentList "-extract", "-silent" -Wait

# Using msiexec for installation
msiexec -i VirtualBox-7.0.12-r159484.msi -passive -norestart

Write-Output "Downloading Ubuntu ISO..."
# Invoke-WebRequest -Uri $isoUrl -OutFile $isoPath

Write-Output "Intializing VM..."
# Create VM with VirtualBox
# Check if the VM exists
$vmExists = & "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" showvminfo $vmName --machinereadable | Select-String -Pattern '^name='

# If the VM exists, delete it
if ($vmExists) {
    & "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" unregistervm $vmName --delete
}

& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" createvm --name $vmName --ostype "Ubuntu_64" --register
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" createhd --filename $fullVHDPath --size $vmDiskSizeMB --format VDI
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" storagectl $vmName --name "SATA Controller" --add sata --controller IntelAhci
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" storageattach $vmName --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium $fullVHDPAth

& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" storagectl $vmName --name "IDE Controller" --add ide

& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" modifyvm $vmName --memory $vmMemoryMB
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" modifyvm $vmName --ioapic on
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" modifyvm $vmName --boot1 dvd --boot2 disk --boot3 none --boot4 none


# Set the VM's network adapter to Bridged mode
# Retrieve all running network adapters excluding those with "Virtual"
$nonVirtualAdapters = Get-NetAdapter | Where-Object { $_.InterfaceDescription -notlike '*Virtual*' -and $_.Status -eq 'Up' }

# Select fastest adapter by link speed
$preferredAdapter = $nonVirtualAdapters | Sort-Object -Property LinkSpeed -Descending | Select-Object -First 1

$adapterName = $null
if ($preferredAdapter) {
    $adapterName = $preferredAdapter.InterfaceDescription
}
if ($adapterName) {
    & "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" modifyvm $vmName --nic1 bridged --bridgeadapter1 "$adapterName"
} else {
    Write-Output "No suitable network adapter found. Update within VirtualBox."
}

# Setup OS on Provider
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" unattended install $vmName --iso=$isoPath --user=parallexprovider --password=parallex --full-user-name="ParallexProvider" --time-zone=UTC
& "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" startvm $vmName