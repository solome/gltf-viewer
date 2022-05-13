const fs = require('fs')
const path = require('path')
const del = require('del')
const { execSync } = require('child_process')

process.chdir(path.join(__dirname, '../'))

async function main() {

  await del(['lib'])
  fs.mkdirSync('lib')

  console.log("packaging...")

  console.log("[packaging] compile source code")
  execSync(`npx babel "./resources/gltf-viewer" --out-dir "./lib" --extensions ".ts,.tsx" --config-file "./dev-tools/babel.config.js"`)

  console.log("[packaging] emit ts declaration")
  execSync(`npx tsc --project "./dev-tools/tsconfig.build.json"`)

  console.log("[packaging] done: " + path.join(__dirname, '../lib'))
}

main()