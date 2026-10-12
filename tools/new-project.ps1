<#
.SYNOPSIS
  Scaffold a new study workspace from project-template/.

.DESCRIPTION
  Copies the Autoresearch project scaffold into -Target. This script only CREATES files: an
  existing file is reported and skipped, never overwritten. Use -DryRun to preview.

  The scaffold carries domain constraints for ONE study. The general research discipline comes
  from the Autoresearch preset; do not restate it in the generated AGENTS.md.

.EXAMPLE
  .\tools\new-project.ps1 -Target D:\studies\my-study -DryRun
  .\tools\new-project.ps1 -Target D:\studies\my-study
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
  # The template keeps its AGENTS.md inert as AGENTS.md.template, because a live AGENTS.md
  # under the template would be injected as project instructions while it is still a
  # placeholder. Rename it on the way out, where it is meant to be live.
  if ($relative -eq 'AGENTS.md.template') { $relative = 'AGENTS.md' }
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
Write-Host 'Next: fill AGENTS.md (every TODO), then run the research-scoping skill.'
