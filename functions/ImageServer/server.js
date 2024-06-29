const jsreport = require('jsreport')()

if (process.env.JSREPORT_CLI) {
  // export jsreport instance to make it possible to use jsreport-cli
  module.exports = jsreport
} else {
  jsreport
    .init()
    .then(() => {
      // running
    })
    .catch((e) => {
      // error during startup
      console.error(e)
      process.exit(1)
    })
}
