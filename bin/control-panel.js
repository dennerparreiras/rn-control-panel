#!/usr/bin/env node

/**
 * Project Control Panel CLI Entry
 *
 * This script serves as the entry point for the CLI tool.
 * It ensures the right node environment and begins execution of the control panel.
 */

// Import the main module
const { main } = require('../dist/index');

// Execute the main function
main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
