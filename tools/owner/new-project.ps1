<#
.SYNOPSIS
  Scaffold a new study workspace from project-template/.

.DESCRIPTION
  Copies the Autoresearch project scaffold into -Target. This script only CREATES files: an
  existing file is reported and skipped, never overwritten. Use -DryRun to preview.

  The scaffold carries ONE study's minimal layout: the scoping document and one non-normative literature
  layer. It does NOT generate the study's `AGENTS.md` — its constraints, authority order and notation can
  only come from whoever owns the study, and a prefilled placeholder is read as an authority table while
  saying nothing. The general research discipline comes from the Autoresearch preset; do not restate it.

.EXAMPLE
  .\tools\owner\new-project.ps1 -Target D:\studies\my-study -DryRun
  .\tools\owner\new-project.ps1 -Target D:\studies\my-study
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Target,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$templateDir = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\project-template')).Path
$targetDir = [System.IO.Path]::GetFullPath($Target)

Write-Host "template : $templateDir"
Write-Host "target   : $targetDir"
if ($DryRun) { Write-Host "mode     : DRY RUN - nothing will be written" -ForegroundColor Yellow }
Write-Host ''

if (-not (Test-Path -LiteralPath $targetDir)) {
  if ($DryRun) {
    Write-Host "would create: $targetDir"
  } else {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
  }
}

$created = 0
$skipped = 0

Get-ChildItem -LiteralPath $templateDir -Recurse -File -Force | ForEach-Object {
  $relative = $_.FullName.Substring($templateDir.Length + 1)
  $destination = Join-Path $targetDir $relative
  $destinationDir = Split-Path -Parent $destination

  if (Test-Path -LiteralPath $destination) {
    Write-Host "  skip (exists)  $relative" -ForegroundColor DarkGray
    $skipped++
    return
  }

  if ($DryRun) {
    Write-Host "  would create   $relative"
  } else {
    if (-not (Test-Path -LiteralPath $destinationDir)) {
      New-Item -ItemType Directory -Force -Path $destinationDir | Out-Null
    }
    Copy-Item -LiteralPath $_.FullName -Destination $destination
    Write-Host "  created        $relative" -ForegroundColor Green
  }
  $created++
}

Write-Host ''
Write-Host "created=$created  skipped=$skipped"
Write-Host 'Next: write AGENTS.md (what this domain forbids, the authority order, the notation) - the'
Write-Host '      scaffold does not prefill it - then fill 00_scoping.md.'
