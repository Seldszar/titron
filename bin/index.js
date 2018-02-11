/* eslint-disable no-console */

const fs = require('fs-plus');
const hjson = require('hjson');
const parse = require('yargs-parser');
const { createApplication } = require('../lib');

try {
  const argv = parse(process.argv.slice(2));
  const configFilePath = fs.resolve(process.cwd(), argv.config || 'config', ['hjson', 'json', '']);
  const config = hjson.parse(fs.readFileSync(configFilePath, 'utf8'));

  createApplication({ config })
    .then((app) => {
      process.on('SIGINT', () => {
        app.close();
      });

      app.start();
    });
} catch (error) {
  console.error('An error occured during the application launch: %s', error.message, {
    error,
  });
}
