[CmdletBinding()]
param(
    [switch]$AutoConfirm,
    [switch]$AllowDirty
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Info {
    param([string]$Message)
    Write-Host "    $Message" -ForegroundColor Gray
}

function Write-Warn {
    param([string]$Message)
    Write-Host "WARN: $Message" -ForegroundColor Yellow
}

function Write-ErrorAndExit {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit 1
}

function Get-RelativePath {
    param(
        [string]$BasePath,
        [string]$TargetPath
    )

    $baseUri = [Uri]::new((Resolve-Path -LiteralPath $BasePath).ProviderPath + [IO.Path]::DirectorySeparatorChar)
    $targetUri = [Uri]::new((Resolve-Path -LiteralPath $TargetPath).ProviderPath)
    $relative = $baseUri.MakeRelativeUri($targetUri).ToString()
    return $relative -replace "/", [IO.Path]::DirectorySeparatorChar
}

function Get-DirectorySizeBytes {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return 0
    }

    $measure = Get-ChildItem -LiteralPath $Path -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum
    return [long]($measure.Sum)
}

function Test-GitAvailable {
    try {
        git --version *>$null
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-GitAvailable)) {
    Write-ErrorAndExit "git is required but was not found in PATH."
}

$gitRoot = (git rev-parse --show-toplevel 2>$null).Trim()
if (-not $gitRoot) {
    Write-ErrorAndExit "This script must be executed inside the AgendaAmiga git repository."
}

Set-Location -LiteralPath $gitRoot

$initialStatus = git status --porcelain
if ($initialStatus -and -not $AllowDirty) {
    Write-ErrorAndExit "Working tree has changes. Commit or stash them, or re-run with -AllowDirty."
}

$sizeBeforeBytes = Get-DirectorySizeBytes -Path $gitRoot

Write-Step "Backing up .env and .env.example files"
$envFiles = Get-ChildItem -Path $gitRoot -Recurse -Force -File | Where-Object { $_.Name -in @(".env", ".env.example") }
$backupRoot = Join-Path ([IO.Path]::GetTempPath()) ("agendaamiga-env-backup-" + [Guid]::NewGuid().ToString("N"))
$envSnapshots = @()
if ($envFiles.Count -gt 0) {
    foreach ($file in $envFiles) {
        $relative = Get-RelativePath -BasePath $gitRoot -TargetPath $file.FullName
        $destination = Join-Path $backupRoot $relative
        $destinationDir = Split-Path -Path $destination -Parent
        if (-not (Test-Path -LiteralPath $destinationDir)) {
            New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
        }
        Copy-Item -LiteralPath $file.FullName -Destination $destination -Force
        $envSnapshots += [PSCustomObject]@{
            RelativePath = $relative
            BackupPath   = $destination
        }
        Write-Info "Backed up $relative"
    }
} else {
    Write-Warn "No .env or .env.example files were found to back up."
}

Write-Step "Removing temporary directories and files"
$removableDirectoryNames = @(
    "node_modules",
    "dist",
    "build",
    ".cache",
    ".turbo",
    ".next",
    "out",
    "coverage",
    "tmp",
    "temp",
    "dev-dist",
    "node_modules_tmp_cleanup"
)

$directoriesRemoved = @()
Get-ChildItem -Path $gitRoot -Recurse -Directory -Force -ErrorAction SilentlyContinue |
    Where-Object { $removableDirectoryNames -contains $_.Name } |
    ForEach-Object {
        try {
            Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction Stop
            $directoriesRemoved += Get-RelativePath -BasePath $gitRoot -TargetPath $_.FullName
        } catch {
            Write-Warn "Unable to remove directory $($_.FullName): $($_.Exception.Message)"
        }
    }

$removableFileExtensions = @(".log", ".pid", ".tsbuildinfo")
$filesRemoved = @()
Get-ChildItem -Path $gitRoot -Recurse -File -Force -ErrorAction SilentlyContinue |
    Where-Object { $removableFileExtensions -contains $_.Extension } |
    ForEach-Object {
        try {
            $relative = Get-RelativePath -BasePath $gitRoot -TargetPath $_.FullName
            Remove-Item -LiteralPath $_.FullName -Force -ErrorAction Stop
            $filesRemoved += $relative
        } catch {
            Write-Warn "Unable to remove file $($_.FullName): $($_.Exception.Message)"
        }
    }

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
        if ($response -match "^(y|yes)$") {
            $executeClean = $true
        }
    }
}

if ($executeClean) {
    Write-Step "Running git clean -xfd"
    git clean -xfd
} else {
    Write-Info "Skipped git clean -xfd"
}

Write-Step "Restoring backed up .env files"
foreach ($snapshot in $envSnapshots) {
    $targetPath = Join-Path $gitRoot $snapshot.RelativePath
    $targetDir = Split-Path -Path $targetPath -Parent
    if (-not (Test-Path -LiteralPath $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    Copy-Item -LiteralPath $snapshot.BackupPath -Destination $targetPath -Force
    Write-Info "Restored $($snapshot.RelativePath)"
}

if (Test-Path -LiteralPath $backupRoot) {
    Remove-Item -LiteralPath $backupRoot -Recurse -Force -ErrorAction SilentlyContinue
}

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
    if (-not (Test-Path -LiteralPath $gitkeepPath)) {
        New-Item -ItemType File -Path $gitkeepPath -Force | Out-Null
    }
}

Write-Step "Normalizing line endings commit"
git add -A
$hasStagedChanges = -not [string]::IsNullOrWhiteSpace((git diff --cached --name-only))
if ($hasStagedChanges) {
    git commit -m "chore(clean): normalize line endings" | Out-Null
} else {
    Write-Info "No changes staged for line ending normalization."
}

Write-Step "Running Prettier if available"
$prettierExecutable = Join-Path $gitRoot "node_modules" "bin" "prettier"
if (-not (Test-Path -LiteralPath $prettierExecutable)) {
    $prettierExecutable = Join-Path $gitRoot "node_modules" ".bin" "prettier"
}
if (Test-Path -LiteralPath $prettierExecutable) {
    npx prettier . --write
    git add -A
    $hasPrettierChanges = -not [string]::IsNullOrWhiteSpace((git diff --cached --name-only))
    if ($hasPrettierChanges) {
        git commit -m "style: run prettier across the repo" | Out-Null
    } else {
        Write-Info "Prettier did not modify any files."
    }
} else {
    Write-Info "Prettier not found in node_modules; skipping formatter."
}

$sizeAfterBytes = Get-DirectorySizeBytes -Path $gitRoot
$freedBytes = $sizeBeforeBytes - $sizeAfterBytes
if ($freedBytes -lt 0) {
    $freedBytes = 0
}
$freedMb = [math]::Round($freedBytes / 1MB, 2)

$essentialDirectories = @(
    "apps/api/prisma/",
    "apps/api/src/",
    "apps/frontend/src/",
    "packages/shared/src/",
    "docs/",
    ".husky/",
    ".github/",
    "scripts/"
)

Write-Step "Summary"
Write-Info ("Space freed: {0:N2} MB" -f $freedMb)
Write-Info "Preserved directories:"
foreach ($dir in $essentialDirectories) {
    Write-Info "  - $dir"
}
Write-Info "Recreated directories:"
if ($recreatedDirectories.Count -gt 0) {
    foreach ($dir in $recreatedDirectories) {
        Write-Info "  - $dir"
    }
} else {
    Write-Info "  - None needed"
}
Write-Info "Final git status:"
git status --short

Write-Host ""
Write-Host "✅ Diretório AgendaAmiga limpo e pronto para uso! Reinstale dependências com `npm ci`." -ForegroundColor Green
