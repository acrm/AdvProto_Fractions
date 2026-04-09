#!/usr/bin/env node
import { readFileSync, writeFileSync, appendFileSync } from 'fs'
import { execSync } from 'child_process'

const args = process.argv.slice(2)
const isMinor = args.includes('--minor')
const isStagedOnly = args.includes('--commit-staged-only')
const noCommit = args.includes('--no-commit')
const descIdx = args.indexOf('--desc')
const desc = descIdx !== -1 ? args[descIdx + 1] : 'version bump'

const versionPath = new URL('../version.json', import.meta.url).pathname
const pkgPath = new URL('../package.json', import.meta.url).pathname
const buildNotesPath = new URL('../build-notes.md', import.meta.url).pathname

const version = JSON.parse(readFileSync(versionPath, 'utf8'))
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

if (isMinor) {
  version.minor += 1
  version.build = 1
} else {
  version.build += 1
}

version.currentVersion = `${version.weekCode}-${version.minor}.${version.build}`
pkg.version = version.currentVersion

writeFileSync(versionPath, JSON.stringify(version, null, 2) + '\n')
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
appendFileSync(buildNotesPath, `- ${version.currentVersion} — ${desc}\n`)

console.log(`Version bumped to ${version.currentVersion}`)

if (!noCommit) {
  try {
    if (isStagedOnly) {
      execSync(`git add version.json package.json build-notes.md`, { stdio: 'inherit' })
    } else {
      execSync(`git add version.json package.json build-notes.md`, { stdio: 'inherit' })
    }
    execSync(`git commit -m "${version.currentVersion}: ${desc}"`, { stdio: 'inherit' })
  } catch (e) {
    console.error('Commit failed:', e.message)
  }
}
