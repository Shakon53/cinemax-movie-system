param([string]$Profile = 'default')
$ErrorActionPreference = 'Stop'
$cli = Join-Path $env:LOCALAPPDATA 'CineMaxTools\aws-cli\aws.exe'
if (!(Test-Path -LiteralPath $cli)) { throw 'AWS CLI is not installed.' }
$env:AWS_PAGER = ''
& $cli sts get-caller-identity --profile $Profile --region us-east-1 --no-cli-pager
if ($LASTEXITCODE -ne 0) { throw 'Sign in first: .\scripts\aws.ps1 login --region us-east-1' }
$regionsJson = & $cli ec2 describe-regions --profile $Profile --region us-east-1 --query 'Regions[].RegionName' --output json
if ($LASTEXITCODE -ne 0) { throw 'Cannot list regions. Check EC2 read permissions.' }
foreach ($region in ($regionsJson | ConvertFrom-Json)) {
    Write-Host "Region: $region"
    & $cli ec2 describe-instances --profile $Profile --region $region --filters 'Name=instance-state-name,Values=running,stopped,pending' --query 'Reservations[].Instances[].{Id:InstanceId,State:State.Name,IP:PublicIpAddress,DNS:PublicDnsName,Key:KeyName,Type:InstanceType}' --output table --no-cli-pager
}
