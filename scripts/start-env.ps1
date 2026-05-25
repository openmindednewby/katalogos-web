param(
	[ValidateSet('dev', 'test', 'prod')]
	[string]$Environment = 'dev'
)

$ErrorActionPreference = 'Stop'

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'set-environment.ps1') -Environment $Environment
