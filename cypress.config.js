const { defineConfig } = require('cypress');

// Port du frontend : 3000 pour docker-compose.prod.yml, 5173 pour dev local
const FRONTEND_PORT = process.env.CYPRESS_FRONTEND_PORT || '5173';
const BASE_URL = `http://localhost:${FRONTEND_PORT}`;

module.exports = defineConfig({
  e2e: {
    baseUrl: BASE_URL,
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  video: false,
  screenshotOnRunFailure: false,
  allowCypressEnv: false,
  retries: {
    runMode: 0,
    openMode: 0
  }
});
