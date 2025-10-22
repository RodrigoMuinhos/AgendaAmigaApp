# scripts/clean.ps1
# Limpeza segura do repositório AgendaAmiga (Windows PowerShell 5.1+ ou PowerShell 7+)

[CmdletBinding()]
param(
    [switch]$AutoConfirm,
    [switch]$AllowDirty
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step ([string]$Message) { Write-Host "==> $Message" -ForegroundColor Cyan }
function Write-Info ([string]$Message) { Write-Host "    $Message" -ForegroundColor Gray }
function Write-Warn ([string]$Message) { Write-Host "WARN: $Message" -ForegroundColor Yellow }
function Write-ErrX ([string]$Message) { Write-Host "ERROR: $Message" -ForegroundColor Red; exit 1 }

function Test-GitAvailable {
    try { git --version *>$null; return $true } catch { return $false }
}

function Get-RelativePath {
    param([string]$BasePath, [string]$TargetPath)
    $baseUri   = [Uri]::new((Resolve-Path -LiteralPath $BasePath).ProviderPath + [IO.Path]::DirectorySeparatorChar)
    $targetUri = [Uri]::new((Resolve-Path -LiteralPath $TargetPath).ProviderPath)
    $relative  = $baseUri.MakeRelativeUri($targetUri).ToString()
    return $relative -replace "/", [IO.Path]::DirectorySeparatorChar
}

function Get-DirectorySizeBytes {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return 0 }
    $m = Get-ChildItem -LiteralPath $Path -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum
    return [long]($m.Sum)
}

if (-not (Test-GitAvailable)) { Write-ErrX "git is required but was not found in PATH." }

$gitRoot = (git rev-parse --show-toplevel 2>$null).Trim()
if (-not $gitRoot) { Write-ErrX "This script must be executed inside the AgendaAmiga git repository." }

Set-Location -LiteralPath $gitRoot

# Proteção: evita apagar alterações não commitadas (use -AllowDirty para forçar)
$initialStatus = git status --porcelain
if ($initialStatus -and -not $AllowDirty) {
    Write-ErrX "Working tree has changes. Commit or stash them, or re-run with -AllowDirty."
}

$sizeBeforeBytes = Get-DirectorySizeBytes -Path $gitRoot

# 1) Backup de .env / .env.example
Write-Step "Backing up .env and .env.example files"
$envFiles = Get-ChildItem -Path $gitRoot -Recurse -Force -File |
    Where-Object { $_.Name -in @(".env", ".env.example") }

$backupRoot   = Join-Path ([IO.Path]::GetTempPath()) ("agendaamiga-env-backup-" + [Guid]::NewGuid().ToString("N"))
$envSnapshots = @()

if ($envFiles.Count -gt 0) {
    foreach ($file in $envFiles) {
        $relative     = Get-RelativePath -BasePath $gitRoot -TargetPath $file.FullName
        $destination  = Join-Path $backupRoot $relative
        $destinationDir = Split-Path -Path $destination -Parent
        if (-not (Test-Path -LiteralPath $destinationDir)) { New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null }
        Copy-Item -LiteralPath $file.FullName -Destination $destination -Force
        $envSnapshots += [PSCustomObject]@{ RelativePath = $relative; BackupPath = $destination }
        Write-Info "Backed up $relative"
    }
} else {
    Write-Warn "No .env or .env.example files were found to back up."
}

# 2) Remoção de diretórios/arquivos temporários (sem pipes que passem strings)
Write-Step "Removing temporary directories and files"

function Remove-DirsSafe {
  param([string[]]$Dirs)
  foreach ($dir in $Dirs) {
    try {
      $full = Join-Path $gitRoot $dir
      if (Test-Path -LiteralPath $full) {
        $item = Get-Item -LiteralPath $full -ErrorAction SilentlyContinue
        if ($null -ne $item -and $item.PSIsContainer) {
          Write-Info ("Removing dir: {0}" -f (Get-RelativePath -BasePath $gitRoot -TargetPath $item.FullName))
          Remove-Item -LiteralPath $item.FullName -Recurse -Force -ErrorAction Stop
        }
      }
    } catch { Write-Warn ("Unable to remove dir {0}: {1}" -f $dir, $_.Exception.Message) }
  }
}

function Remove-FilesByPatternSafe {
  param([string[]]$Patterns)
  foreach ($pattern in $Patterns) {
    try {
      $files = Get-ChildItem -Path $gitRoot -Recurse -Filter $pattern -File -Force -ErrorAction SilentlyContinue
      foreach ($f in $files) {
        Write-Info ("Removing file: {0}" -f (Get-RelativePath -BasePath $gitRoot -TargetPath $f.FullName))
        Remove-Item -LiteralPath $f.FullName -Force -ErrorAction Stop
      }
    } catch { Write-Warn ("Failed while removing pattern {0}: {1}" -f $pattern, $_.Exception.Message) }
  }
}

$DirsToRemove = @(
  "node_modules","dist","build",".cache",".turbo",".next","out","coverage",
  "tmp","temp","apps/frontend/dev-dist","node_modules_tmp_cleanup"
)
$FilePatterns = @("*.log","*.pid","*.tsbuildinfo")

Remove-DirsSafe           -Dirs $DirsToRemove
Remove-FilesByPatternSafe -Patterns $FilePatterns

# 3) Preview do git clean
Write-Step "Previewing git clean"
$dryRunOutput = git clean -xfdn
if ([string]::IsNullOrWhiteSpace($dryRunOutput)) {
    Write-Info "git clean -xfdn reports no additional files to remove."
} else {
    Write-Host $dryRunOutput
}

$executeClean = $false
if (-not [string]::IsNullOrWhiteSpace($dryRunOutput)) {
    if ($AutoConfirm) {
        $executeClean = $true
    } else {
        $response = Read-Host "Proceed with git clean -xfd? (y/N)"
        if ($response -match "^(y|yes)$") { $executeClean = $true }
    }
}

if ($executeClean) {
    Write-Step "Running git clean -xfd"
    git clean -xfd
} else {
    Write-Info "Skipped git clean -xfd"
}

# 4) Restaura .env do backup
Write-Step "Restoring backed up .env files"
foreach ($snapshot in $envSnapshots) {
    $targetPath = Join-Path $gitRoot $snapshot.RelativePath
    $targetDir  = Split-Path -Path $targetPath -Parent
    if (-not (Test-Path -LiteralPath $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
    Copy-Item -LiteralPath $snapshot.BackupPath -Destination $targetPath -Force
    Write-Info "Restored $($snapshot.RelativePath)"
}
if (Test-Path -LiteralPath $backupRoot) { Remove-Item -LiteralPath $backupRoot -Recurse -Force -ErrorAction SilentlyContinue }

# 5) Recria diretórios importantes (com .gitkeep)
Write-Step "Recreating required directories with .gitkeep"
$directoriesToEnsure = @(
  "apps/api/prisma/seeds",
  "apps/api/prisma/scripts",
  "apps/frontend/public"
)
$recreatedDirectories = @()
foreach ($relativeDir in $directoriesToEnsure) {
    $fullPath = Join-Path $gitRoot $relativeDir
    if (-not (Test-Path -LiteralPath $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        $recreatedDirectories += $relativeDir
    }
    $gitkeepPath = Join-Path $fullPath ".gitkeep"
    if (-not (Test-Path -LiteralPath $gitkeepPath)) { New-Item -ItemType File -Path $gitkeepPath -Force | Out-Null }
}

# 6) Commit de normalização de finais de linha (se houver algo staged)
Write-Step "Normalizing line endings commit"
git add -A
$hasStagedChanges = -not [string]::IsNullOrWhiteSpace((git diff --cached --name-only))
if ($hasStagedChanges) {
    git commit -m "chore(clean): normalize line endings" | Out-Null
} else {
    Write-Info "No changes staged for line ending normalization."
}

# 7) Prettier (se existir)
Write-Step "Running Prettier if available"
$prettierBin = @(
  (Join-Path $gitRoot "node_modules\.bin\prettier.cmd"),
  (Join-Path $gitRoot "node_modules\.bin\prettier"),
  (Join-Path $gitRoot "node_modules\bin\prettier")
) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if ($prettierBin) {
    npx prettier . --write
    git add -A
    $hasPrettierChanges = -not [string]::IsNullOrWhiteSpace((git diff --cached --name-only))
    if ($hasPrettierChanges) { git commit -m "style: run prettier across the repo" | Out-Null }
    else { Write-Info "Prettier did not modify any files." }
} else {
    Write-Info "Prettier not found in node_modules; skipping formatter."
}

# 8) Sumário
$sizeAfterBytes = Get-DirectorySizeBytes -Path $gitRoot
$freedBytes     = [math]::Max(0, ($sizeBeforeBytes - $sizeAfterBytes))
$freedMb        = [math]::Round($freedBytes / 1MB, 2)

$essentialDirectories = @(
  "apps/api/prisma/","apps/api/src/","apps/frontend/src/","packages/shared/src/",
  "docs/",".husky/",".github/","scripts/"
)

Write-Step "Summary"
Write-Info ("Space freed: {0:N2} MB" -f $freedMb)
Write-Info "Preserved directories:"
foreach ($d in $essentialDirectories) { Write-Info "  - $d" }
Write-Info "Recreated directories:"
if ($recreatedDirectories.Count -gt 0) { foreach ($d in $recreatedDirectories) { Write-Info "  - $d" } }
else { Write-Info "  - None needed" }
Write-Info "Final git status:"
git status --short

Write-Host ""
Write-Host "✅ Diretório AgendaAmiga limpo e pronto para uso! Reinstale dependências com `npm ci`." -ForegroundColor Green
