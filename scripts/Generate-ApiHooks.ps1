# Generate-ApiHooks.ps1
# Fetches OpenAPI specs from both services and generates React Query hooks
#
# Note: This script intentionally ignores unexpected positional args (some terminals/tools inject extra tokens
# like "server"). We parse $args manually to be resilient.

$OnlineMenuUrl = "https://localhost:5006"
$IdentityUrl = "http://localhost:5002"
$QuestionerUrl = "https://localhost:5004"
$ContentUrl = "http://localhost:5009"
$NotificationUrl = "http://localhost:5015"
$SkipDownload = $false

for ($i = 0; $i -lt $args.Count; $i++) {
    switch ($args[$i]) {
        "-OnlineMenuUrl" {
            if ($i + 1 -lt $args.Count) {
                $OnlineMenuUrl = $args[$i + 1]
                $i++
            }
            continue
        }
        "-IdentityUrl" {
            if ($i + 1 -lt $args.Count) {
                $IdentityUrl = $args[$i + 1]
                $i++
            }
            continue
        }
        "-QuestionerUrl" {
            if ($i + 1 -lt $args.Count) {
                $QuestionerUrl = $args[$i + 1]
                $i++
            }
            continue
        }
        "-ContentUrl" {
            if ($i + 1 -lt $args.Count) {
                $ContentUrl = $args[$i + 1]
                $i++
            }
            continue
        }
        "-NotificationUrl" {
            if ($i + 1 -lt $args.Count) {
                $NotificationUrl = $args[$i + 1]
                $i++
            }
            continue
        }
        "-SkipDownload" {
            $SkipDownload = $true
            continue
        }
        default {
            # Ignore unknown args (e.g., "server")
            continue
        }
    }
}

$ErrorActionPreference = "Stop"

# Colors
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }

$ScriptDir = $PSScriptRoot
$ClientAppDir = Split-Path $ScriptDir -Parent
$SwaggerDir = [System.IO.Path]::Combine($ClientAppDir, "src", "server", "swagger")

Write-Host ""
Write-Host "API Hooks Generator - Multi-Service Setup" -ForegroundColor Magenta
Write-Host ""

# Compatibility wrapper for Windows PowerShell 5.1 (no -SkipCertificateCheck)
function Invoke-OpenApi {
    param([string]$Uri)
    $irmParams = @{ Uri = $Uri }
    $irmCmd = Get-Command Invoke-RestMethod
    $supportsSkip = $irmCmd.Parameters.ContainsKey("SkipCertificateCheck")
    $isHttps = $Uri -like "https://*"

    $originalProtocol = $null
    $originalCallback = $null

    if ($isHttps) {
        # Use TLS 1.2 and accept self-signed certs for local dev endpoints.
        $originalProtocol = [Net.ServicePointManager]::SecurityProtocol
        $originalCallback = [Net.ServicePointManager]::ServerCertificateValidationCallback
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        [Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
    }

    try {
        if ($supportsSkip) {
            $irmParams.SkipCertificateCheck = $true
        }
        return Invoke-RestMethod @irmParams
    }
    finally {
        if ($isHttps) {
            [Net.ServicePointManager]::SecurityProtocol = $originalProtocol
            [Net.ServicePointManager]::ServerCertificateValidationCallback = $originalCallback
        }
    }
}

function Save-OpenApi {
    param(
        [string]$Uri,
        [string]$OutFile
    )

    try {
        $spec = Invoke-OpenApi $Uri
        $spec | ConvertTo-Json -Depth 100 | Out-File -FilePath $OutFile -Encoding UTF8
        return
    } catch {
        Write-Warning "Invoke-RestMethod failed, trying curl.exe..."
    }

    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if ($null -eq $curl) {
        throw "curl.exe not found; cannot download $Uri"
    }

    $curlArgs = @("-sS", "-k", $Uri, "-o", $OutFile)
    $proc = Start-Process -FilePath $curl.Source -ArgumentList $curlArgs -NoNewWindow -Wait -PassThru
    if ($proc.ExitCode -ne 0 -or -not (Test-Path $OutFile)) {
        throw "curl.exe failed to download $Uri"
    }
}

# Create swagger directory if it doesn't exist
if (-not (Test-Path $SwaggerDir)) {
    Write-Info "Creating swagger directory..."
    New-Item -ItemType Directory -Path $SwaggerDir | Out-Null
}

# Download OpenAPI specs
if (-not $SkipDownload) {
    Write-Info "Downloading OpenAPI specifications..."
    Write-Host ""

    # OnlineMenuSaaS API
    Write-Info "  [1/5] OnlineMenuSaaS API ($OnlineMenuUrl)..."
    try {
        Save-OpenApi "$OnlineMenuUrl/swagger/v1/swagger.json" (Join-Path $SwaggerDir "onlinemenu.json")
        Write-Success "    OK - OnlineMenuSaaS spec downloaded"
    } catch {
        Write-Error "    FAIL - Could not download OnlineMenuSaaS spec"
        Write-Warning "    Make sure OnlineMenuSaaS is running on $OnlineMenuUrl"
        Write-Warning "    Error: $_"
    }

    # IdentityService API
    Write-Info "  [2/5] IdentityService API ($IdentityUrl)..."
    try {
        # Try standard path first
        try {
            Save-OpenApi "$IdentityUrl/swagger/v1/swagger.json" (Join-Path $SwaggerDir "identity.json")
        } catch {
            # Try alternative path
            Write-Warning "    Trying alternative path..."
            Save-OpenApi "$IdentityUrl/swagger.json" (Join-Path $SwaggerDir "identity.json")
        }
        Write-Success "    OK - IdentityService spec downloaded"
    } catch {
        Write-Error "    FAIL - Could not download IdentityService spec"
        Write-Warning "    Make sure IdentityService is running on $IdentityUrl"
        Write-Warning "    Error: $_"
    }

    # QuestionerService API
    Write-Info "  [3/5] QuestionerService API ($QuestionerUrl)..."
    try {
        Save-OpenApi "$QuestionerUrl/swagger/v1/swagger.json" (Join-Path $SwaggerDir "questioner.json")
        Write-Success "    OK - QuestionerService spec downloaded"
    } catch {
        Write-Error "    FAIL - Could not download QuestionerService spec"
        Write-Warning "    Make sure QuestionerService is running on $QuestionerUrl"
        Write-Warning "    Error: $_"
    }

    # ContentService API
    Write-Info "  [4/5] ContentService API ($ContentUrl)..."
    try {
        Save-OpenApi "$ContentUrl/swagger/v1/swagger.json" (Join-Path $SwaggerDir "content.json")
        Write-Success "    OK - ContentService spec downloaded"
    } catch {
        Write-Error "    FAIL - Could not download ContentService spec"
        Write-Warning "    Make sure ContentService is running on $ContentUrl"
        Write-Warning "    Error: $_"
    }

    # NotificationService API
    Write-Info "  [5/5] NotificationService API ($NotificationUrl)..."
    try {
        Save-OpenApi "$NotificationUrl/swagger/v1/swagger.json" (Join-Path $SwaggerDir "notification.json")
        Write-Success "    OK - NotificationService spec downloaded"
    } catch {
        Write-Error "    FAIL - Could not download NotificationService spec"
        Write-Warning "    Make sure NotificationService is running on $NotificationUrl"
        Write-Warning "    Error: $_"
    }

    Write-Host ""
} else {
    Write-Info "Skipping download (using existing swagger files)..."
    Write-Host ""
}

# Verify swagger files exist
$onlineMenuFile = Join-Path $SwaggerDir "onlinemenu.json"
$identityFile = Join-Path $SwaggerDir "identity.json"
$questionerFile = Join-Path $SwaggerDir "questioner.json"
$contentFile = Join-Path $SwaggerDir "content.json"
$notificationFile = Join-Path $SwaggerDir "notification.json"

if (-not (Test-Path $onlineMenuFile)) {
    Write-Error "OnlineMenuSaaS swagger file not found: $onlineMenuFile"
    Write-Warning "Run without -SkipDownload to fetch the specs"
    exit 1
}

if (-not (Test-Path $identityFile)) {
    Write-Error "IdentityService swagger file not found: $identityFile"
    Write-Warning "Run without -SkipDownload to fetch the specs"
    exit 1
}

if (-not (Test-Path $questionerFile)) {
    Write-Error "QuestionerService swagger file not found: $questionerFile"
    Write-Warning "Run without -SkipDownload to fetch the specs"
    exit 1
}

if (-not (Test-Path $contentFile)) {
    Write-Error "ContentService swagger file not found: $contentFile"
    Write-Warning "Run without -SkipDownload to fetch the specs"
    exit 1
}

if (-not (Test-Path $notificationFile)) {
    Write-Error "NotificationService swagger file not found: $notificationFile"
    Write-Warning "Run without -SkipDownload to fetch the specs"
    exit 1
}

# Generate hooks with Orval
Write-Info "Generating React Query hooks with Orval..."
Write-Host ""

Push-Location $ClientAppDir

try {
    # Run orval to generate hooks for both APIs
    Write-Info "  Running Orval code generation..."
    npx orval --config orval.config.js

    if ($LASTEXITCODE -eq 0) {
        Write-Success "  OK - Hooks generated successfully"

        # Run post-processing fix for React Query v5 compatibility
        Write-Info "  Running React Query v5 compatibility fix..."
        node (Join-Path $ScriptDir "fix-generated-hooks.js")
    } else {
        Write-Error "  FAIL - Orval generation failed"
        exit 1
    }

    Write-Host ""
    Write-Success "API Hooks Generated Successfully!"
    Write-Host ""

    Write-Info "Generated hooks:"
    Write-Host "  OnlineMenuSaaS:       src/server/autoGeneratedHooks/onlinemenu/" -ForegroundColor White
    Write-Host "  IdentityService:      src/server/autoGeneratedHooks/identity/" -ForegroundColor White
    Write-Host "  QuestionerService:    src/server/autoGeneratedHooks/questioner/" -ForegroundColor White
    Write-Host "  ContentService:       src/server/autoGeneratedHooks/content/" -ForegroundColor White
    Write-Host "  NotificationService:  src/server/autoGeneratedHooks/notification/" -ForegroundColor White
    Write-Host ""

    Write-Info "Usage in components:"
    Write-Host "  For OnlineMenuSaaS APIs" -ForegroundColor Gray
    Write-Host '  import { useListTenantMenus } from "@/server/autoGeneratedHooks/onlinemenu";' -ForegroundColor Gray
    Write-Host ""
    Write-Host "  For IdentityService APIs" -ForegroundColor Gray
    Write-Host '  import { useLogin, useListUsers } from "@/server/autoGeneratedHooks/identity";' -ForegroundColor Gray
    Write-Host ""
    Write-Host "  For QuestionerService APIs" -ForegroundColor Gray
    Write-Host '  import { useListQuestionerTemplates } from "@/server/autoGeneratedHooks/questioner";' -ForegroundColor Gray
    Write-Host ""
    Write-Host "  For ContentService APIs" -ForegroundColor Gray
    Write-Host '  import { useRequestUploadUrl, useCompleteUpload } from "@/server/autoGeneratedHooks/content";' -ForegroundColor Gray
    Write-Host ""
    Write-Host "  For NotificationService APIs" -ForegroundColor Gray
    Write-Host '  import { useSendSms, useSendEmail } from "@/server/autoGeneratedHooks/notification";' -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Error "Error during hook generation"
    Write-Warning "Error details: $_"
    exit 1
} finally {
    Pop-Location
}

Write-Info "Next steps:"
Write-Host "  1. All environment URLs are configured (IDENTITY_API_URL, CONTENT_API_URL, NOTIFICATION_API_URL, etc.)" -ForegroundColor Green
Write-Host "  2. Each service has its own httpClient (httpClientContent.ts, httpClientNotification.ts, etc.)" -ForegroundColor Green
Write-Host "  3. Import and use the generated hooks in your components" -ForegroundColor Yellow
Write-Host ""
