# @dennerparreiras/control-panel

[![npm version](https://img.shields.io/npm/v/@dennerparreiras/control-panel.svg)](https://www.npmjs.com/package/@dennerparreiras/control-panel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)

A powerful CLI tool for managing mobile and web application environments, versions, and build processes.

![Control Panel Demo](https://via.placeholder.com/800x400?text=Control+Panel+Demo)

## Features

- **Multi-environment Support**: Easily switch between development, staging, and production environments
- **Multi-platform Support**: Manage iOS, Android, and Web platforms from a single interface
- **Version Management**: Update app version across all platform-specific files
- **Environment Configuration**: Generate and manage environment-specific configuration files
- **Build Process**: Streamlined build and deployment commands for all platforms
- **Device Management**: List and select physical devices or simulators/emulators

## Installation

### Global Installation

```bash
npm install -g @dennerparreiras/control-panel
```

### Local Installation

```bash
npm install --save-dev @dennerparreiras/control-panel
```

## Getting Started

### Quick Start

After installation, you can run the control panel using:

```bash
# Full command
control-panel

# Shorthand
cp
```

### First-time Setup

1. Create a `control-panel-data.json` file in your project root (see example in Configuration section)
2. Set up your environment files in the specified locations
3. Create platform-specific scripts as needed (examples in the `/examples` directory)
4. Run the control panel to get started

## Usage

### Command Line

Once installed globally, you can run the control panel using:

```bash
# Full command
control-panel

# Shorthand
cp
```

### Configuration

Create a `control-panel-data.json` file in your project root to configure the tool:

```json
{
  "environment": {
    "development": {
      "enabled": true,
      "original-env-location": "(project_root)/environment/.env.development"
    },
    "staging": {
      "enabled": true,
      "original-env-location": "(project_root)/environment/.env.staging"
    },
    "production": {
      "enabled": true,
      "original-env-location": "(project_root)/environment/.env.production"
    }
  },
  "android": {
    "enabled": true,
    "scripts": {
      "pre-run-script-location": "./../scripts/android/pre-run.js",
      "run-script-location": "./../scripts/android/run.js",
      "pre-script": "node scripts/android/pre-run.js",
      "post-script": "node scripts/android/post-run.js",
      "run-script": "node scripts/android/run.js",
      "build-script": "node scripts/android/build.js",
      "release-script": "node scripts/android/release.js"
    }
  },
  "ios": {
    "enabled": true,
    "scripts": {
      "pre-run-script-location": "./../scripts/ios/pre-run.js",
      "run-script-location": "./../scripts/ios/run.js",
      "pre-script": "node scripts/ios/pre-run.js",
      "post-script": "node scripts/ios/post-run.js",
      "run-script": "node scripts/ios/run.js",
      "build-script": "node scripts/ios/build.js",
      "release-script": "node scripts/ios/release.js"
    }
  },
  "web": {
    "enabled": true,
    "scripts": {
      "pre-run-script-location": "./../scripts/web/pre-run.js",
      "run-script-location": "./../scripts/web/run.js",
      "pre-script": "node scripts/web/pre-run.js",
      "post-script": "node scripts/web/post-run.js",
      "run-script": "node scripts/web/run.js",
      "build-script": "node scripts/web/build.js",
      "deploy-script": "node scripts/web/deploy.js"
    }
  },
  "version": {
    "enabled": true,
    "platforms": {
      "ios": {
        "project_file": "ios/myapp.xcodeproj/project.pbxproj",
        "bundle_id": {
          "production": "com.company.myapp",
          "staging": "com.company.myapp-staging"
        }
      },
      "android": {
        "build_gradle": "android/app/build.gradle"
      }
    }
  },
  "ui": {
    "title_banner": " 📊 PROJECT CONTROL PANEL 📊 ",
    "status_enabled": "✓",
    "status_disabled": "✗",
    "colors": {
      "development": "green",
      "staging": "yellow",
      "production": "red",
      "ios": "blue",
      "android": "green",
      "web": "cyan"
    }
  }
}
```

### Command Line Options

```
Usage: control-panel [options]

Options:
  -v, --version          Print version information and exit
  -e, --env <env>        Set environment (development, staging, production)
  -p, --platform <plat>  Set platform (ios, android, web)
  -a, --action <action>  Set action (debug, release, build, deploy)
  -s, --server           Start React Native server
  -f, --fresh            Start server with fresh cache
  --verbose              Show detailed output
  -h, --help             Display help information
```

### Examples

```bash
# Run interactively
control-panel

# Switch to staging environment
control-panel --env staging

# Debug iOS app with development environment
control-panel --env development --platform ios --action debug

# Build Android app for production
control-panel --env production --platform android --action build

# Start React Native server with fresh cache
control-panel --server --fresh

# Deploy web app to staging
control-panel --env staging --platform web --action deploy
```

## Programmatic Usage

You can also use the Control Panel programmatically in your Node.js scripts:

```typescript
import { ControlPanel } from '@dennerparreiras/control-panel';

// Initialize with custom configuration path
const controlPanel = new ControlPanel({
  configPath: './custom-control-panel-data.json',
});

// Or use default configuration path
// const controlPanel = new ControlPanel();

// Examples of programmatic usage
async function runExamples() {
  // Switch environment
  await controlPanel.switchEnvironment('staging');
  
  // Update app version
  await controlPanel.updateVersion('1.2.3', 123);
  
  // Run iOS debug build
  await controlPanel.runAction({
    platform: 'ios',
    environment: 'development',
    action: 'debug',
  });
  
  // Start React Native server
  await controlPanel.startServer({ fresh: true });
}

runExamples().catch(console.error);
```

## Project Structure

The project is organized into several modules:

- **Android**: Handles Android-specific operations
- **iOS**: Handles iOS-specific operations
- **Web**: Handles web platform operations
- **Environment**: Manages environment configuration and switching
- **Version**: Manages version updates across platforms
- **UI**: Controls the interactive CLI interface
- **ReactNative**: Manages React Native server operations
- **Utils**: Provides utility functions used across modules

Each module follows a modular architecture with its own types, implementation, and API.

## Scripts and Hooks

The control panel supports custom scripts for each platform:

- **Pre-run Scripts**: Execute before running an application
- **Run Scripts**: Execute the main run command
- **Post-run Scripts**: Execute after running an application
- **Build Scripts**: Handle the build process
- **Release/Deploy Scripts**: Handle the release or deployment process

Example scripts are available in the `/examples/scripts` directory.

## Requirements

- Node.js 14.0 or later
- For iOS development: macOS with Xcode installed
- For Android development: Android SDK installed

## Troubleshooting

### Common Issues

1. **Configuration not found**: Ensure `control-panel-data.json` exists in your project root
2. **Script execution errors**: Check script paths and execution permissions
3. **Environment switching issues**: Verify environment file paths are correct

### Debug Mode

Run the control panel with the `--verbose` flag for detailed output:

```bash
control-panel --verbose
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## About

Created and maintained by [Denner Parreiras](https://company.com).
