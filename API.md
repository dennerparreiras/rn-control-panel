# Control Panel API Reference

This document provides detailed information about the programmatic API for the Control Panel.

## Table of Contents

- [Core API](#core-api)
  - [Constructor](#constructor)
  - [Initialize](#initialize)
  - [Switch Environment](#switch-environment)
  - [Update Version](#update-version)
  - [Run Action](#run-action)
  - [Start Server](#start-server)
- [Module-specific APIs](#module-specific-apis)
  - [Environment Manager](#environment-manager)
  - [Version Manager](#version-manager)
  - [iOS Handler](#ios-handler)
  - [Android Handler](#android-handler)
  - [Web Handler](#web-handler)
  - [React Native Handler](#react-native-handler)
- [Complete Usage Example](#complete-usage-example)

## Core API

### Constructor

Creates a new instance of the Control Panel.

```typescript
/**
 * Constructor
 *
 * Creates a new Control Panel instance
 *
 * @param {Object} options - Configuration options
 * @param {string} options.configPath - Path to the configuration file (default: './control-panel-data.json')
 * @returns {ControlPanel} A new Control Panel instance
 */
constructor(options?: { configPath?: string })
```

Example:
```typescript
import { ControlPanel } from '@dennerparreiras/control-panel';

// With default configuration path
const controlPanel = new ControlPanel();

// With custom configuration path
const controlPanelCustom = new ControlPanel({
  configPath: './custom-control-panel-data.json'
});
```

### Initialize

Initializes the Control Panel and sets up the modules.

```typescript
/**
 * Initialize
 *
 * Initializes the Control Panel and processes command line arguments if provided
 *
 * @returns {Promise<void>}
 */
public async initialize(): Promise<void>
```

Example:
```typescript
await controlPanel.initialize();
```

### Switch Environment

Switches to a different environment.

```typescript
/**
 * Switch Environment
 *
 * Switches to the specified environment
 *
 * @param {string} environment - The environment to switch to (development, staging, production)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
public async switchEnvironment(environment: string): Promise<boolean>
```

Example:
```typescript
const success = await controlPanel.switchEnvironment('staging');
if (success) {
  console.log('Successfully switched to staging environment');
}
```

### Update Version

Updates the app version across all platforms.

```typescript
/**
 * Update Version
 *
 * Updates the app version in all platform-specific files
 *
 * @param {string} version - The new version string (e.g., '1.2.3')
 * @param {number} versionCode - The version code (build number)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
public async updateVersion(version: string, versionCode: number): Promise<boolean>
```

Example:
```typescript
const success = await controlPanel.updateVersion('1.2.3', 123);
if (success) {
  console.log('Version updated successfully');
}
```

### Run Action

Runs a specific action for a platform in a given environment.

```typescript
/**
 * Run Action
 *
 * Runs a specific action for a platform in the specified environment
 *
 * @param {Object} options - Action options
 * @param {string} options.platform - The platform (ios, android, web)
 * @param {string} options.environment - The environment (development, staging, production)
 * @param {string} options.action - The action to run (debug, release, build, deploy)
 * @param {string} [options.deviceId] - Optional device ID for iOS/Android
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
public async runAction(options: {
  platform: string;
  environment: string;
  action: string;
  deviceId?: string;
}): Promise<boolean>
```

Example:
```typescript
const success = await controlPanel.runAction({
  platform: 'ios',
  environment: 'development',
  action: 'debug',
  deviceId: '00008030-000A58A11E78802E' // Optional
});
```

### Start Server

Starts the React Native server.

```typescript
/**
 * Start Server
 *
 * Starts the React Native development server
 *
 * @param {Object} options - Server options
 * @param {boolean} [options.fresh=false] - Whether to start with fresh cache
 * @param {boolean} [options.resetCache=false] - Whether to reset cache
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
public async startServer(options?: {
  fresh?: boolean;
  resetCache?: boolean;
}): Promise<boolean>
```

Example:
```typescript
const success = await controlPanel.startServer({ fresh: true });
if (success) {
  console.log('Server started successfully');
}
```

## Module-specific APIs

### Environment Manager

```typescript
/**
 * Environment Manager
 *
 * Manages environment-related operations
 */
interface EnvironmentManager {
  /**
   * Switch Environment
   *
   * Switches to the specified environment
   *
   * @param {string} environment - The environment to switch to
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  switchEnvironment(environment: string): Promise<boolean>;
  
  /**
   * Get Current Environment
   *
   * Gets the current environment
   *
   * @returns {string | null} - The current environment or null if not set
   */
  getCurrentEnvironment(): string | null;
  
  /**
   * Get Available Environments
   *
   * Gets the list of available environments
   *
   * @returns {string[]} - Array of available environments
   */
  getAvailableEnvironments(): string[];
}
```

### Version Manager

```typescript
/**
 * Version Manager
 *
 * Manages version-related operations
 */
interface VersionManager {
  /**
   * Update Version
   *
   * Updates the app version in all platform-specific files
   *
   * @param {string} version - The new version string
   * @param {number} versionCode - The version code (build number)
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  updateVersion(version: string, versionCode: number): Promise<boolean>;
  
  /**
   * Get Current Version
   *
   * Gets the current app version
   *
   * @returns {Promise<VersionInfo | null>} - The current version info or null if not available
   */
  getCurrentVersion(): Promise<VersionInfo | null>;
}
```

### iOS Handler

```typescript
/**
 * iOS Handler
 *
 * Manages iOS-specific operations
 */
interface iOSHandler {
  /**
   * Run Action
   *
   * Runs a specific action for iOS
   *
   * @param {string} action - The action to run
   * @param {string} environment - The environment
   * @param {string} [deviceId] - Optional device ID
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  runAction(action: string, environment: string, deviceId?: string): Promise<boolean>;
  
  /**
   * Get Devices
   *
   * Gets the list of available iOS devices
   *
   * @returns {Promise<DeviceInfo[]>} - Array of device information
   */
  getDevices(): Promise<DeviceInfo[]>;
}
```

### Android Handler

```typescript
/**
 * Android Handler
 *
 * Manages Android-specific operations
 */
interface AndroidHandler {
  /**
   * Run Action
   *
   * Runs a specific action for Android
   *
   * @param {string} action - The action to run
   * @param {string} environment - The environment
   * @param {string} [deviceId] - Optional device ID
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  runAction(action: string, environment: string, deviceId?: string): Promise<boolean>;
  
  /**
   * Get Devices
   *
   * Gets the list of available Android devices
   *
   * @returns {Promise<DeviceInfo[]>} - Array of device information
   */
  getDevices(): Promise<DeviceInfo[]>;
}
```

### Web Handler

```typescript
/**
 * Web Handler
 *
 * Manages web-specific operations
 */
interface WebHandler {
  /**
   * Run Action
   *
   * Runs a specific action for web
   *
   * @param {string} action - The action to run
   * @param {string} environment - The environment
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  runAction(action: string, environment: string): Promise<boolean>;
}
```

### React Native Handler

```typescript
/**
 * React Native Handler
 *
 * Manages React Native server operations
 */
interface ReactNativeHandler {
  /**
   * Start Server
   *
   * Starts the React Native development server
   *
   * @param {Object} options - Server options
   * @param {boolean} [options.fresh=false] - Whether to start with fresh cache
   * @param {boolean} [options.resetCache=false] - Whether to reset cache
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  startServer(options?: {
    fresh?: boolean;
    resetCache?: boolean;
  }): Promise<boolean>;
  
  /**
   * Stop Server
   *
   * Stops the React Native development server
   *
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  stopServer(): Promise<boolean>;
  
  /**
   * Is Server Running
   *
   * Checks if the React Native server is running
   *
   * @returns {Promise<boolean>} - True if running, false otherwise
   */
  isServerRunning(): Promise<boolean>;
}
```

## Complete Usage Example

This example demonstrates how to use the Control Panel programmatically for common tasks:

```typescript
import { ControlPanel } from '@dennerparreiras/control-panel';

async function main() {
  try {
    // Initialize with default configuration
    const controlPanel = new ControlPanel();
    
    // Switch to staging environment
    console.log('Switching to staging environment...');
    const envResult = await controlPanel.switchEnvironment('staging');
    if (!envResult) {
      console.error('Failed to switch environment');
      return;
    }
    
    // Update app version
    console.log('Updating app version...');
    const versionResult = await controlPanel.updateVersion('1.2.3', 123);
    if (!versionResult) {
      console.error('Failed to update version');
      return;
    }
    
    // Run iOS debug build
    console.log('Running iOS debug build...');
    const runResult = await controlPanel.runAction({
      platform: 'ios',
      environment: 'staging',
      action: 'debug'
    });
    if (!runResult) {
      console.error('Failed to run iOS build');
      return;
    }
    
    // Start React Native server with fresh cache
    console.log('Starting React Native server...');
    const serverResult = await controlPanel.startServer({ fresh: true });
    if (!serverResult) {
      console.error('Failed to start server');
      return;
    }
    
    console.log('All operations completed successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
``` 