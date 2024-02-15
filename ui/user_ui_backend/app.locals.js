/**
 * File Descrption: Contains information about absolute file paths for use of including files
 */
const path = require('path')

module.exports = {
    models: path.join(__dirname, 'models'),
    scripts: path.join(__dirname, 'scripts'),
    aqmp: path.join(__dirname, "aqmp")
}