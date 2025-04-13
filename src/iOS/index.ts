/**
 * iOS Module
 *
 * This module handles iOS-specific operations including device listing,
 * environment setup, and running applications.
 */

import chalk from 'chalk';
import { exec } from 'child_process';
import { ControlPanelConfig, DeviceInfo, CategorizedDevices } from '../types';
import { Utilities } from '../Utils/types';

/**
 * iOS Handler
 *
 * Handles iOS operations
 */
class iOSHandler {
  private config: ControlPanelConfig;
  private utils: Utilities;

  /**
   * Constructor
   *
   * @param config Control panel configuration
   * @param utils Utility functions
   */
  constructor(config: ControlPanelConfig, utils: Utilities) {
    this.config = config;
    this.utils = utils;
  }

  /**
   * List Devices
   *
   * List available iOS devices and simulators
   *
   * @returns Promise resolving to categorized device list
   */
  async listDevices(): Promise<CategorizedDevices> {
    try {
      const rawDeviceList = await this.utils.executeCommand(
        'xcrun xctrace list devices 2>&1',
        'Getting iOS device list',
        { stdio: 'pipe' }
      );

      // Categories for devices
      const categorizedDevices: CategorizedDevices = {
        physicalDevices: [],
        offlineDevices: [],
        simulators: [],
      };

      const lines = rawDeviceList.split('\n');
      let currentCategory: 'physicalDevices' | 'offlineDevices' | 'simulators' | null = null;

      // Process the output line by line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check for section markers
        if (line.startsWith('==')) {
          if (line === '== Devices ==') {
            currentCategory = 'physicalDevices';
          } else if (line === '== Devices Offline ==') {
            currentCategory = 'offlineDevices';
          } else if (line.includes('Simulator')) {
            currentCategory = 'simulators';
          }
          continue;
        }

        // Skip empty lines
        if (!line) {
          continue;
        }

        // Look for lines containing device info
        if (line && !line.startsWith('==') && currentCategory) {
          // Format examples from the log:
          // - Denner (18.3.2) (00008120-000A541A0AE9A01E)
          // - iPhone 15 Plus Simulator (18.4) (64108282-3A60-48F7-82BD-416174AA274E)

          let deviceInfo: DeviceInfo | null = null;

          // Standard format: Device Name (version) (device-id)
          const standardMatch = line.match(
            /^(.+?)\s+(\([0-9.]+\))?\s+\(([^)]+)\)$/
          );
          if (standardMatch) {
            const name = standardMatch[1].trim();
            const version = standardMatch[2]
              ? standardMatch[2].replace(/[()]/g, '')
              : null;
            const id = standardMatch[3].trim();

            deviceInfo = {
              name: name,
              id: id,
              category: currentCategory,
            };

            if (version) {
              deviceInfo.osVersion = version;
            }
          }
          // Format with braces: { platform:iOS Simulator, arch:x86_64, id:ID, OS:18.4, name:iPhone SE (3rd generation) }
          else if (
            line.includes('platform:') &&
            line.includes('OS:') &&
            line.includes('name:')
          ) {
            const platformMatch = line.match(/platform:([^,]+)/);
            const idMatch = line.match(/id:([^,]+)/);
            const osMatch = line.match(/OS:([0-9.]+)/);
            const nameMatch = line.match(/name:([^}]+)/);

            if (platformMatch && idMatch && osMatch && nameMatch) {
              deviceInfo = {
                platform: platformMatch[1].trim(),
                id: idMatch[1].trim(),
                osVersion: osMatch[1].trim(),
                name: nameMatch[1].trim(),
                category: currentCategory,
              };
            }
          }
          // Simple device listing format
          else {
            const simpleMatch = line.match(
              /^(.+?) Simulator \([0-9.]+\) \(([^)]+)\)$/
            );
            if (simpleMatch) {
              const name = simpleMatch[1].trim() + ' Simulator';
              const id = simpleMatch[2].trim();

              // Extract OS version if present in the line
              const osMatch = line.match(/\(([0-9.]+)\)/);

              deviceInfo = {
                name: name,
                id: id,
                category: currentCategory,
              };

              if (osMatch && osMatch[1]) {
                deviceInfo.osVersion = osMatch[1];
              }
            }
          }

          // If we were able to parse a device, add it to the appropriate category
          if (deviceInfo) {
            const deviceName = deviceInfo.name.toLowerCase();

            // For simulators category, only add iPhone simulators
            if (currentCategory === 'simulators') {
              if (deviceName.includes('iphone')) {
                categorizedDevices.simulators.push(deviceInfo);
              }
            }
            // For physical devices, exclude MacBooks and iPads
            else if (currentCategory === 'physicalDevices') {
              if (
                !deviceName.includes('macbook') &&
                !deviceName.includes('ipad')
              ) {
                categorizedDevices.physicalDevices.push(deviceInfo);
              }
            }
            // For offline devices, add all
            else {
              categorizedDevices[currentCategory].push(deviceInfo);
            }
          }
        }
      }

      // Filter simulators to keep only the highest OS version per model
      if (categorizedDevices.simulators.length > 0) {
        categorizedDevices.simulators = this.utils.filterSimulatorsByHighestOSVersion(
          categorizedDevices.simulators
        );
      }

      return categorizedDevices;
    } catch (error) {
      console.error(chalk.red(`Error listing iOS devices: ${(error as Error).message}`));
      return { physicalDevices: [], offlineDevices: [], simulators: [] };
    }
  }

  /**
   * Select Device
   *
   * Display categorized devices with sequential numbering and let user select one
   *
   * @param categorizedDevices Object containing device categories
   * @returns Selected device or null if selection failed
   */
  async selectDevice(categorizedDevices: CategorizedDevices): Promise<DeviceInfo | null> {
    const { physicalDevices, offlineDevices, simulators } = categorizedDevices;
    const allDevices: (DeviceInfo & { index?: number })[] = [];
    let deviceCounter = 1;

    // Display physical devices
    console.log(chalk.bold('\n== Devices =='));
    if (physicalDevices.length > 0) {
      physicalDevices.forEach((device) => {
        console.log(
          chalk.green(`${deviceCounter} - ${device.name} (${device.id})`)
        );
        allDevices.push({ ...device, index: deviceCounter });
        deviceCounter++;
      });
    } else {
      console.log(chalk.yellow('No physical devices connected'));
    }

    // Display offline devices
    if (offlineDevices.length > 0) {
      console.log(chalk.bold('\n== Devices Offline =='));
      offlineDevices.forEach((device) => {
        console.log(
          chalk.gray(`Device unavailable - ${device.name} (${device.id})`)
        );
        // We don't add offline devices to the selectable list
      });
    }

    // Display simulators
    if (simulators.length > 0) {
      console.log(chalk.bold('\n== Simulators =='));
      simulators.forEach((device) => {
        // Only include iPhone simulators
        if (device.name.toLowerCase().includes('iphone')) {
          console.log(
            chalk.cyan(`${deviceCounter} - ${device.name} (${device.id})`)
          );
          allDevices.push({ ...device, index: deviceCounter });
          deviceCounter++;
        }
      });
    }

    // If no devices available, return null
    if (allDevices.length === 0) {
      console.log(
        chalk.red('\n⚠ No iPhone devices or simulators available')
      );
      return null;
    }

    // Ask user to select a device
    return await this.promptForDeviceSelection(allDevices);
  }

  /**
   * Prompt For Device Selection
   *
   * Prompt user to select a device from the numbered list
   *
   * @param allDevices Array of available devices with index property
   * @returns Selected device or null if selection failed
   */
  private async promptForDeviceSelection(
    allDevices: (DeviceInfo & { index?: number })[]
  ): Promise<DeviceInfo | null> {
    let selectedIndex = -1;
    let attempts = 0;
    const maxAttempts = 3;

    while (
      !allDevices.find((d) => d.index === selectedIndex) &&
      attempts < maxAttempts
    ) {
      try {
        const answer = await this.utils.question(
          chalk.yellow('\n→ Select a device by number: ')
        );
        selectedIndex = parseInt(answer.trim(), 10);

        if (
          isNaN(selectedIndex) ||
          !allDevices.find((d) => d.index === selectedIndex)
        ) {
          selectedIndex = -1;
          attempts++;
          console.log(
            chalk.red(
              `⚠ Invalid selection. Please enter a number between 1 and ${allDevices.length}.`
            )
          );

          if (attempts >= maxAttempts) {
            console.log(
              chalk.yellow(
                '\n⚠ Maximum attempts reached. Showing device list again:'
              )
            );
            // Reset attempts counter
            attempts = 0;

            // Re-display the device categories
            console.log(chalk.bold('\n== Devices =='));
            const physicalDevices = allDevices.filter(
              (d) => d.category === 'physicalDevices'
            );
            if (physicalDevices.length > 0) {
              physicalDevices.forEach((device) => {
                console.log(
                  chalk.green(
                    `${device.index} - ${device.name} (${device.id})`
                  )
                );
              });
            } else {
              console.log(chalk.yellow('No physical devices connected'));
            }

            console.log(chalk.bold('\n== Simulators =='));
            const simulators = allDevices.filter(
              (d) => d.category === 'simulators'
            );
            simulators.forEach((device) => {
              console.log(
                chalk.cyan(`${device.index} - ${device.name} (${device.id})`)
              );
            });
          }
        }
      } catch (error) {
        console.error(
          chalk.red(`Error during device selection: ${(error as Error).message}`)
        );
        return null;
      }
    }

    const selectedDevice = allDevices.find((d) => d.index === selectedIndex);
    if (selectedDevice) {
      console.log(chalk.green(`\n✓ Selected device: ${selectedDevice.name}`));
      return selectedDevice;
    }

    return null;
  }

  /**
   * Update Pods
   *
   * Update CocoaPods dependencies
   *
   * @returns Success status
   */
  async updatePods(): Promise<boolean> {
    console.log(chalk.cyan('\n📦 Updating CocoaPods dependencies...'));
    try {
      await this.utils.executeCommand(
        'cd ios && pod install --repo-update',
        'Running pod install with repo update'
      );
      return true;
    } catch (error) {
      console.error(chalk.red(`Error updating CocoaPods: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Setup Environment
   *
   * Set up iOS environment
   *
   * @param environment Environment name
   * @returns Success status
   */
  async setupEnvironment(environment: string): Promise<boolean> {
    const setupEnvCommand = `cd ios && PROJECT_DIR=$(pwd) ./scripts/setup-env.sh ${environment}`;
    console.log(chalk.cyan('\n⚙️ Setting up iOS environment...'));

    try {
      await this.utils.executeCommand(
        setupEnvCommand,
        'Setting up iOS environment'
      );

      // Always update pods for iOS operations
      await this.updatePods();

      return true;
    } catch (error) {
      console.error(chalk.red(`Error during iOS setup: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Get Clean Device Name
   *
   * Extract the base device name without version info
   *
   * @param fullName Full device name with version
   * @returns Clean device name
   */
  getCleanDeviceName(fullName: string): string {
    // Extract just the base name without the version info in parentheses
    // Example: "iPhone 15 Pro Simulator (18.4)" -> "iPhone 15 Pro Simulator"
    const match = fullName.match(/(.*?)(?:\s+\(.*\))?$/);
    return match ? match[1].trim() : fullName;
  }

  /**
   * Execute Debug
   *
   * Execute iOS debug command
   *
   * @param environment Environment name
   * @param target Target scheme name
   * @returns Success status
   */
  async executeDebug(environment: string, target: string): Promise<boolean> {
    try {
      // List all available iOS devices and simulators
      const categorizedDevices = await this.listDevices();

      // Let user select a device
      const selectedDevice = await this.selectDevice(categorizedDevices);

      let command: string;

      if (selectedDevice) {
        // Build the appropriate command based on device type
        const deviceName = this.getCleanDeviceName(selectedDevice.name);

        if (selectedDevice.category === 'simulators') {
          console.log(chalk.green(`✓ Using simulator: ${deviceName}`));
          // Use "Debug" with uppercase D instead of lowercase "debug"
          command = `npx react-native run-ios --scheme "${target}" --simulator "${deviceName}"`;
        } else {
          console.log(chalk.green(`✓ Using device: ${deviceName}`));
          command = `npx react-native run-ios --scheme "${target}" --device "${deviceName}"`;
        }
      } else {
        console.log(
          chalk.yellow(
            '⚠ No device selected. Using default iPhone 15 simulator.'
          )
        );
        command = `npx react-native run-ios --scheme "${target}" --simulator "iPhone 15"`;
      }

      // Execute the command with a much larger buffer
      const execOptions = { maxBuffer: 50 * 1024 * 1024 };
      await this.utils.executeCommand(
        command,
        `Running ${target} on iOS`,
        execOptions
      );

      return true;
    } catch (error) {
      console.error(chalk.red(`Error during iOS debug: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Run Diagnostics
   *
   * Run iOS diagnostics when errors occur
   *
   * @param scheme Scheme name
   * @param configuration Build configuration
   * @returns Promise resolving to diagnostic message
   */
  async runDiagnostics(scheme: string, configuration: string): Promise<string> {
    const buildCommand = `cd ios && xcodebuild -workspace member.xcworkspace -configuration ${configuration} -scheme ${scheme} -destination 'platform=iOS Simulator,name=iPhone 15,OS=18.4' | grep -E "error:|warning:" | head -20`;

    console.log(
      chalk.cyan('\n🔍 Running detailed Xcode build to identify issues...')
    );

    return new Promise((resolve) => {
      exec(buildCommand, (error, stdout, stderr) => {
        if (stdout.trim()) {
          console.log(chalk.yellow('Build issues found:'));
          if (this.utils.verbosity.isVerbose) {
            // Show full output in verbose mode
            console.log(chalk.yellow(stdout));
          } else {
            // Show only first few lines in non-verbose mode
            const lines = stdout.split('\n').slice(0, 5);
            console.log(chalk.yellow(lines.join('\n')));
            if (stdout.split('\n').length > 5) {
              console.log(
                chalk.yellow('[...] Use --verbose to see more output')
              );
            }
          }
        }

        if (stderr && stderr.trim()) {
          console.log(chalk.red('Build errors:'));
          if (this.utils.verbosity.isVerbose) {
            console.log(chalk.red(stderr));
          } else {
            const lines = stderr.split('\n').slice(0, 3);
            console.log(chalk.red(lines.join('\n')));
            if (stderr.split('\n').length > 3) {
              console.log(
                chalk.yellow('[...] Use --verbose to see more output')
              );
            }
          }
        }

        console.log(chalk.cyan('\n💡 Suggestions:'));
        console.log(
          chalk.cyan(
            '1. Try running "cd ios && pod install" to update CocoaPods dependencies'
          )
        );
        console.log(
          chalk.cyan(
            '2. Open the project in Xcode to see detailed error messages: "open ios/member.xcworkspace"'
          )
        );
        console.log(
          chalk.cyan(
            '3. Check if there are any signing identity issues in Xcode'
          )
        );

        resolve(`Completed detailed build check for ${scheme}`);
      });
    });
  }
}

/**
 * Create iOS Handler
 *
 * Factory function to create an iOS handler instance
 *
 * @param config Control panel configuration
 * @param utils Utility functions
 * @returns iOS handler instance
 */
export function createiOSHandler(
  config: ControlPanelConfig,
  utils: Utilities
): iOSHandler {
  return new iOSHandler(config, utils);
} 