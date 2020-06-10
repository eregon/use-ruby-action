const os = require('os')
const fs = require('fs')
const core = require('@actions/core')
const { performance } = require('perf_hooks')

export async function measure(name, block) {
  return await core.group(name, async () => {
    const start = performance.now()
    try {
      return await block()
    } finally {
      const end = performance.now()
      const duration = (end - start) / 1000.0
      console.log(`Took ${duration.toFixed(2).padStart(6)} seconds`)
    }
  })
}

export function isHeadVersion(rubyVersion) {
  return rubyVersion === 'head' || rubyVersion === 'debug' || rubyVersion === 'mingw' || rubyVersion === 'mswin'
}

export function getVirtualEnvironmentName() {
  const platform = os.platform()
  if (platform === 'linux') {
    return `ubuntu-${findUbuntuVersion()}`
  } else if (platform === 'darwin') {
    return 'macos-latest'
  } else if (platform === 'win32') {
    return 'windows-latest'
  } else {
    throw new Error(`Unknown platform ${platform}`)
  }
}

function findUbuntuVersion() {
  const lsb_release = fs.readFileSync('/etc/lsb-release', 'utf8')
  const match = lsb_release.match(/^DISTRIB_RELEASE=(\d+\.\d+)$/m)
  if (match) {
    return match[1]
  } else {
    throw new Error('Could not find Ubuntu version')
  }
}

// convert windows path like C:\Users\runneradmin to /c/Users/runneradmin
export function win2nix(path) { 
  if (/^[A-Z]:/i.test(path)) {
    // path starts with drive
    path = `/${path[0].toLowerCase()}${path.split(':')[1]}`
  }
  return path.replace(/\\/g, '/').replace(/ /g, '\\ ')
}
