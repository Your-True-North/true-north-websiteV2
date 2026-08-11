// Compiles the Anger Decoder library to a temp directory and runs its unit
// tests with the Node built in test runner. No new test framework needed.
//
// Usage: node scripts/test-anger-decoder.js

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const REPO_ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(REPO_ROOT, '.anger-decoder-tests')

function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })

  execSync(
    `npx tsc --module commonjs --target es2020 --moduleResolution node --skipLibCheck ` +
      `--esModuleInterop ` +
      `--outDir "${OUT_DIR}" ` +
      `lib/anger-decoder/questions.ts lib/anger-decoder/score.ts lib/anger-decoder/score.test.ts`,
    { cwd: REPO_ROOT, stdio: 'inherit' }
  )

  // tsc collapses the output to the common root, so the compiled files land
  // directly in OUT_DIR rather than under lib/anger-decoder.
  execSync(`node --test "${OUT_DIR}"`, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  })
}

try {
  main()
} finally {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
}
