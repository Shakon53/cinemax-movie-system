$ErrorActionPreference = 'Stop'
$cli = Join-Path $env:LOCALAPPDATA 'CineMaxTools\aws-cli\aws.exe'
if (!(Test-Path -LiteralPath $cli)) { throw 'AWS CLI not found. Install from https://aws.amazon.com/cli/' }
& $cli @args
exit $LASTEXITCODE
