# Script to build docker image for DRIVER-EU
$ImageName = "driver-mailserver"
$StartTime = (Get-Date).Millisecond
cd ./../../../packages/mail-manager/mail-server-api
docker build  -f dockerfile.txt --tag=$ImageName .
Write-Host "Create docker image $ImageName'"
Write-Host "Press any key to continue "
$x = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")