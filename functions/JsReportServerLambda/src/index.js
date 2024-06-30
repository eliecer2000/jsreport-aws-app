const JsReport = require('jsreport')
const FS = require('fs-extra')
const path = require('path')
const os = require('os')
const { v4: uuidv4 } = require('uuid')

const chromium = require('@sparticuz/chromium')
chromium.setHeadlessMode = true
let jsreport
const init = (async () => {
  // this speeds up cold start by some ~500ms
  precreateExtensionsLocationsCache()
  jsreport = JsReport({
    configFile: path.join(__dirname, 'prod.config.json'),
    chrome: {
      launchOptions: {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true
      }
    }
  })
  await FS.copy(path.join(__dirname, 'data'), '/tmp/data')
  return jsreport.init()
})()

exports.handler = async (event) => {
  await init
  const reportId = `${
    process.env.extensions_fsStoreAwsS3Persistence_prefix || 'default'
  }-outputs/${event.renderRequest.reportId || uuidv4()}`

  await jsreport.render({
    ...event.renderRequest,
    options: { reports: { save: true, blobName: reportId } }
  })

  const response = {
    statusCode: 200,
    body: {
      reportId
    }
  }

  return response
}

async function precreateExtensionsLocationsCache() {
  const rootDir = path.join(path.dirname(require.resolve('jsreport')), '../../')
  const locationsPath = path.join(rootDir, 'node_modules/locations.json')

  if (FS.existsSync(locationsPath)) {
    console.log('locations.json found, extensions crawling will be skipped')
    const locations = JSON.parse(FS.readFileSync(locationsPath)).locations
    const tmpLocationsPath = path.join(
      os.tmpdir(),
      'jsreport',
      'core',
      'locations.json'
    )
    FS.ensureFileSync(tmpLocationsPath)
    FS.writeFileSync(
      tmpLocationsPath,
      JSON.stringify({
        [path.join(rootDir, 'node_modules') + '/']: {
          rootDirectory: rootDir,
          locations: locations.map((l) =>
            path.join(rootDir, l).replace(/\\/g, '/')
          ),
          lastSync: Date.now()
        }
      })
    )
  } else {
    console.log('locations.json not found, the startup will be a bit slower')
  }
}
