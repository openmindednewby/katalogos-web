param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev', 'test', 'prod')]
    [string]$Environment
)

$ErrorActionPreference = 'Stop'

# 1) Update app.json extra.env (used by the app if needed)
$appJsonPath = "app.json"
$appJson = Get-Content $appJsonPath -Raw | ConvertFrom-Json
$appJson.expo.extra.env = $Environment
$appJson | ConvertTo-Json -Depth 10 | Set-Content $appJsonPath

# 2) Load .env.<env> file into current process env so EXPO_PUBLIC_* are available at build time
$envFilePath = ".env.$Environment"
if (Test-Path $envFilePath) {
    Write-Host "Loading environment variables from $envFilePath"
    Get-Content $envFilePath | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith('#')) { return }
        $kv = $line -split '=', 2
        if ($kv.Length -eq 2) {
            $key = $kv[0].Trim()
            $val = $kv[1].Trim()
            # Strip optional quotes
            if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Trim('"') }
            if ($val.StartsWith("'") -and $val.EndsWith("'")) { $val = $val.Trim("'") }
            Set-Item -Path "Env:$key" -Value $val
            Write-Host "  set $key=$val"
        }
    }
} else {
    Write-Host "No $envFilePath found; continuing without loading .env vars."
}

Write-Host "Environment set to: $Environment"
# Note: --offline bypasses the dependency version check that can fail with
# "Body is unusable: Body has already been read" error in getNativeModuleVersionsAsync
# This is a known Expo CLI bug: https://github.com/expo/expo/issues/28179
npx expo start --web --port 8084 --clear --offline
