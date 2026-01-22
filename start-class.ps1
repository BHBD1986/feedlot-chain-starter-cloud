# ============================
# Feedlot Chain - Class Start
# ============================

$ErrorActionPreference = "Stop"

$ROOT   = "C:\Users\kwkip\projects\Feedlot_Block\feedlot-chain-starter"
$PORTAL = Join-Path $ROOT "portal"
$ENVFILE = Join-Path $PORTAL ".env"
$VIEWER = Join-Path $ROOT "viewer"
$VIEWER_PORT = 3000
$PORTAL_PORT = 3001

function Get-LanIPv4 {
  # Best signal: the interface used for the default route (0.0.0.0/0)
  $defaultRoute = Get-NetRoute -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue |
                  Sort-Object -Property RouteMetric, InterfaceMetric |
                  Select-Object -First 1

  $badName = '(?i)wsl|vEthernet|hyper-v|virtual|vmware|docker|tunnel|vpn|wireguard|zerotier|tailscale|loopback|bluetooth'

  if ($defaultRoute) {
    $ifIndex = $defaultRoute.InterfaceIndex
    $ip = Get-NetIPAddress -InterfaceIndex $ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue |
          Where-Object { $_.IPAddress -ne "127.0.0.1" } |
          Select-Object -First 1

    $adapter = Get-NetAdapter -InterfaceIndex $ifIndex -ErrorAction SilentlyContinue

    if ($ip -and $adapter -and ($adapter.Name -notmatch $badName) -and ($adapter.InterfaceDescription -notmatch $badName)) {
      return $ip.IPAddress
    }
  }

  # Fallback: pick an "Up" Wi-Fi/Ethernet adapter that isn't virtual
  $candidates = Get-NetAdapter -Physical -ErrorAction SilentlyContinue |
    Where-Object { $_.Status -eq "Up" -and $_.Name -notmatch $badName -and $_.InterfaceDescription -notmatch $badName }

  foreach ($a in $candidates) {
    $ip = Get-NetIPAddress -InterfaceIndex $a.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue |
          Where-Object { $_.IPAddress -ne "127.0.0.1" } |
          Select-Object -First 1
    if ($ip) { return $ip.IPAddress }
  }

  return "127.0.0.1"
}


Write-Host "`n=== Feedlot Chain: Class Start ===`n"
Write-Host "Project: $ROOT"
Write-Host "Portal:  $PORTAL"
Write-Host "Viewer:  $VIEWER`n"

# Basic checks
if (-not (Test-Path (Join-Path $ROOT "hardhat.config.js"))) { throw "hardhat.config.js not found. Wrong folder?" }
if (-not (Test-Path $ENVFILE)) { throw ".env not found at $ENVFILE (portal missing?)" }
if (-not (Test-Path (Join-Path $VIEWER "index.html"))) {
  Write-Host "NOTE: viewer\index.html not found. Viewer will not be started." -ForegroundColor Yellow
}

# 1) Start Hardhat node (new window)
Write-Host "1) Starting Hardhat node (new window)..."
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$ROOT`"; npx hardhat node"
)

Start-Sleep -Seconds 2

# 2) Deploy contract + setup roles
Write-Host "2) Deploying contract..."
Push-Location $ROOT

$deployOut = & npx hardhat run .\scripts\deploy.js --network localhost 2>&1
$deployText = $deployOut | Out-String
Write-Host $deployText

$match = [regex]::Match($deployText, "FeedlotLedger deployed to:\s*(0x[a-fA-F0-9]{40})")
if (-not $match.Success) { throw "Could not parse deployed contract address from deploy output." }
$contract = $match.Groups[1].Value
Write-Host "Contract Address: $contract"

$env:CONTRACT_ADDRESS = $contract

Write-Host "3) Setting up roles..."
$rolesOut = & npx hardhat run .\scripts\setupRoles.js --network localhost 2>&1
Write-Host ($rolesOut | Out-String)

Pop-Location

# 3) Update portal\.env CONTRACT_ADDRESS
Write-Host "4) Updating portal .env CONTRACT_ADDRESS..."
$envLines = Get-Content $ENVFILE -ErrorAction Stop
if ($envLines -match '^CONTRACT_ADDRESS=') {
  $envLines = $envLines -replace '^CONTRACT_ADDRESS=.*$', "CONTRACT_ADDRESS=$contract"
} else {
  $envLines += "CONTRACT_ADDRESS=$contract"
}
Set-Content -Path $ENVFILE -Value $envLines -Encoding UTF8
Write-Host "Updated: $ENVFILE"

# 4) Start portal (new window)
Write-Host "5) Starting Portal server (new window)..."
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$PORTAL`"; node server.js"
)

# 5) Start viewer (new window) if present
if (Test-Path (Join-Path $VIEWER "index.html")) {
  Write-Host "6) Starting Viewer server (new window)..."
  # Use npx serve without permanently installing if you prefer:
  Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd `"$ROOT`"; npx serve `"$VIEWER`" -l $VIEWER_PORT"
  )
}

# 6) Print URLs
$ip = Get-LanIPv4

Write-Host "`n=== URLs to share ==="
Write-Host "Portal (your PC):       http://localhost:$PORTAL_PORT"
Write-Host "Portal (students):      http://$ip`:$PORTAL_PORT"
if (Test-Path (Join-Path $VIEWER "index.html")) {
  Write-Host "Viewer (your PC):       http://localhost:$VIEWER_PORT"
  Write-Host "Viewer (students):      http://$ip`:$VIEWER_PORT"
} else {
  Write-Host "Viewer:                 (not started - missing viewer\index.html)" -ForegroundColor Yellow
}
Write-Host "Blockchain RPC:         http://127.0.0.1:8545"
Write-Host "Contract Address:       $contract"
Write-Host "`nDone. Leave the node + portal + viewer windows running.`n"
