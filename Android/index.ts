/**
 * Android Module
 *
 * This module handles Android-specific operations for the control panel.
 */

import chalk from 'chalk';
import type { AndroidHandler } from './types';
import { ControlPanelConfig, DeviceInfo, VariantInfo } from '../types';
import { Utils } from '../Utils';

/**
 * Android Handler Implementation
 *
 * Implementation of Android platform operations
 */
class AndroidHandlerImpl implements AndroidHandler {
  private config: ControlPanelConfig;
  private utils: Utils;

  /**
   * Constructor
   *
   * @param config - Control panel configuration
   * @param utils - Utilities instance
   */
  constructor(config: ControlPanelConfig, utils: Utils) {
    this.config = config;
    this.utils = utils;
  }

  /**
   * Set up Android environment
   *
   * @param environment - The target environment (development, staging, production)
   * @returns Promise resolving to setup success status
   */
  public async setupEnvironment(environment: string): Promise<boolean> {
    const setupScript = `cd android && ./scripts/setup-env.sh ${environment}`;
    console.log(chalk.cyan('\n⚙️ Setting up Android environment...'));

    try {
      await this.utils.executeCommand(
        setupScript,
        'Setting up Android environment'
      );

      return true;
    } catch (error) {
      console.error(chalk.red(`Error during Android setup: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Get Android build variant based on environment and action
   *
   * @param environment - The target environment code (d, s, p)
   * @param action - The action code (d, r, b)
   * @returns Variant information
   */
  public getVariant(environment: string, action: string): VariantInfo {
    let flavor = '';
    let buildType = '';

    // Determine flavor based on environment
    if (environment === 'd') {
      flavor = 'development';
    } else if (environment === 's') {
      flavor = 'staging';
    } else if (environment === 'p') {
      flavor = 'production';
    }

    // Determine build type based on action
    if (action === 'd') {
      buildType = 'Debug';
    } else if (action === 'r' || action === 'b') {
      buildType = 'Release';
    }

    // Create variant name (e.g., developmentDebug, productionRelease)
    const variantName = `${flavor}${buildType}`;
    const lowerVariantName = `${flavor}${buildType.toLowerCase()}`;

    return {
      flavor,
      buildType,
      variantName,
      lowerVariantName
    };
  }

  /**
   * List available Android devices
   *
   * @returns Promise resolving to list of Android devices
   */
  public async listDevices(): Promise<DeviceInfo[]> {
    try {
      const adbDevices = await this.utils.executeCommand(
        'adb devices -l',
        'Getting Android device list',
        { stdio: 'pipe' }
      );

      const devices: DeviceInfo[] = [];
      const lines = adbDevices.split('\n').slice(1); // Skip the first line (header)

      for (const line of lines) {
        if (line.trim()) {
          const deviceMatch = line.match(/^([^\s]+)\s+device\s+(.*)$/);
          if (deviceMatch) {
            const id = deviceMatch[1];
            const details = deviceMatch[2];
            
            // Extract model name if available
            let name = 'Android Device';
            const modelMatch = details.match(/model:([^\s]+)/);
            if (modelMatch) {
              name = modelMatch[1].replace(/_/g, ' ');
            }

            devices.push({
              id,
              name,
              category: 'physicalDevices'
            });
          }
        }
      }

      // Check for available emulators
      const emulators = await this.utils.executeCommand(
        'emulator -list-avds',
        'Getting Android emulator list',
        { stdio: 'pipe' }
      );

      emulators.split('\n').forEach(emulator => {
        if (emulator.trim()) {
          devices.push({
            id: `emulator-${emulator.trim()}`,
            name: emulator.trim(),
            category: 'simulators'
          });
        }
      });

      return devices;
    } catch (error) {
      console.error(chalk.red(`Error listing Android devices: ${(error as Error).message}`));
      return [];
    }
  }

  /**
   * Let user select an Android device
   *
   * @returns Promise resolving to selected device ID or "emulator"
   */
  public async selectDevice(): Promise<string | null> {
    const devices = await this.listDevices();
    
    // If no devices available, return null
    if (devices.length === 0) {
      console.log(chalk.red('\n⚠ No Android devices or emulators available'));
      return null;
    }

    console.log(chalk.bold('\n== Android Devices =='));
    
    // Display physical devices
    const physicalDevices = devices.filter(device => device.category === 'physicalDevices');
    if (physicalDevices.length > 0) {
      physicalDevices.forEach((device, index) => {
        console.log(chalk.green(`${index + 1} - ${device.name} (${device.id})`));
      });
    } else {
      console.log(chalk.yellow('No physical devices connected'));
    }

    // Display emulators
    const emulators = devices.filter(device => device.category === 'simulators');
    if (emulators.length > 0) {
      console.log(chalk.bold('\n== Emulators =='));
      emulators.forEach((device, index) => {
        console.log(chalk.cyan(`${physicalDevices.length + index + 1} - ${device.name}`));
      });
    }

    // Ask user to select a device
    const answer = await this.utils.question(
      chalk.yellow('\n→ Select a device by number (or "e" to use default emulator): ')
    );

    // If user wants to use default emulator
    if (answer.toLowerCase() === 'e') {
      return 'emulator';
    }

    // Parse user selection
    const selectedIndex = parseInt(answer) - 1;
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= devices.length) {
      console.log(chalk.red('⚠ Invalid selection. Using default emulator.'));
      return 'emulator';
    }

    const selectedDevice = devices[selectedIndex];
    console.log(chalk.green(`\n✓ Selected device: ${selectedDevice.name}`));
    return selectedDevice.id;
  }

  /**
   * Run diagnostics when errors occur
   *
   * @param variant - The variant name
   * @returns Promise resolving to diagnostic results
   */
  public async runDiagnostics(variant: string): Promise<string> {
    const gradleCommand = `cd android && ./gradlew :app:compile${variant} --stacktrace`;
    
    console.log(chalk.cyan('\n🔍 Running detailed Gradle build to identify issues...'));
    
    try {
      await this.utils.executeCommand(
        gradleCommand,
        'Running Android diagnostics'
      );
      
      console.log(chalk.cyan('\n💡 Suggestions:'));
      console.log(
        chalk.cyan('1. Try running "cd android && ./gradlew clean" to clean the project')
      );
      console.log(
        chalk.cyan('2. Check Android Studio for detailed error messages')
      );
      console.log(
        chalk.cyan('3. Verify that all dependencies are properly configured in build.gradle')
      );
      
      return `Completed detailed build check for ${variant}`;
    } catch (error) {
      console.error(chalk.red(`Error during diagnostics: ${(error as Error).message}`));
      return `Failed to run diagnostics for ${variant}`;
    }
  }

  /**
   * Execute debug command
   *
   * @param environment - The target environment
   * @param variant - The variant information
   * @param deviceId - The target device ID
   * @returns Promise resolving to execution success status
   */
  public async executeDebug(environment: string, variant: VariantInfo, deviceId: string): Promise<boolean> {
    try {
      const deviceParam = deviceId === 'emulator' ? '' : `-Pandroid.task.apk.install.device.id=${deviceId}`;
      
      const command = `npx react-native run-android --variant=${variant.lowerVariantName} ${deviceParam}`;
      
      await this.utils.executeCommand(
        command,
        `Running Android ${variant.variantName} build`,
        { maxBuffer: 50 * 1024 * 1024 }
      );
      
      return true;
    } catch (error) {
      console.error(chalk.red(`Error during Android debug: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Execute release command
   *
   * @param environment - The target environment
   * @param variant - The variant information
   * @param deviceId - The target device ID
   * @returns Promise resolving to execution success status
   */
  public async executeRelease(environment: string, variant: VariantInfo, deviceId: string): Promise<boolean> {
    try {
      const deviceParam = deviceId === 'emulator' ? '' : `-Pandroid.task.apk.install.device.id=${deviceId}`;
      
      const command = `cd android && ./gradlew install${variant.variantName} ${deviceParam}`;
      
      await this.utils.executeCommand(
        command,
        `Running Android ${variant.variantName} release build`,
        { maxBuffer: 50 * 1024 * 1024 }
      );
      
      return true;
    } catch (error) {
      console.error(chalk.red(`Error during Android release: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Execute build command
   *
   * @param environment - The target environment
   * @param variant - The variant information
   * @returns Promise resolving to execution success status
   */
  public async executeBuild(environment: string, variant: VariantInfo): Promise<boolean> {
    try {
      const command = `cd android && ./gradlew assemble${variant.variantName}`;
      
      await this.utils.executeCommand(
        command,
        `Building Android ${variant.variantName} APK`,
        { maxBuffer: 50 * 1024 * 1024 }
      );
      
      console.log(chalk.green(`\n✓ APK built successfully: ${variant.variantName}`));
      console.log(chalk.gray(`  Check android/app/build/outputs/apk/${variant.flavor}/${variant.buildType.toLowerCase()}/`));
      
      return true;
    } catch (error) {
      console.error(chalk.red(`Error during Android build: ${(error as Error).message}`));
      return false;
    }
  }
}

/**
 * Create and export the Android handler implementation
 * 
 * @param config - Control panel configuration
 * @param utils - Utilities instance
 * @returns An implementation of the AndroidHandler interface
 */
export function createAndroidHandler(config: ControlPanelConfig, utils: Utils): AndroidHandler {
  return new AndroidHandlerImpl(config, utils);
}

// Exportar os tipos também
export * from './types'; 