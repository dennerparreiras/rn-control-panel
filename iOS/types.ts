/**
 * iOS Module Types
 *
 * This file contains type definitions specific to the iOS platform module.
 */

import { CategorizedDevices, DeviceInfo } from '../types';

/**
 * iOSHandler
 *
 * Interface defining the methods required for iOS platform operations
 */
export interface iOSHandler {
  /**
   * List available iOS devices and simulators
   *
   * @returns Promise resolving to categorized iOS devices
   */
  listDevices(): Promise<CategorizedDevices>;

  /**
   * Present device selection menu and let user select a device
   *
   * @param categorizedDevices - Object containing categorized iOS devices
   * @returns Promise resolving to selected device or null if selection failed
   */
  selectDevice(categorizedDevices: CategorizedDevices): Promise<DeviceInfo | null>;

  /**
   * Prompt for device selection
   *
   * @param allDevices - Array of devices with index property
   * @returns Promise resolving to selected device or null if selection failed
   */
  promptForDeviceSelection(allDevices: DeviceInfo[]): Promise<DeviceInfo | null>;

  /**
   * Update CocoaPods dependencies
   *
   * @returns Promise resolving to update success status
   */
  updatePods(): Promise<boolean>;

  /**
   * Set up iOS environment
   *
   * @param environment - The target environment (development, staging, production)
   * @returns Promise resolving to setup success status
   */
  setupEnvironment(environment: string): Promise<boolean>;

  /**
   * Extract the base device name without version info
   *
   * @param fullName - Full device name with version
   * @returns Clean device name
   */
  getCleanDeviceName(fullName: string): string;

  /**
   * Execute iOS debug command
   *
   * @param environment - The target environment
   * @param target - The Xcode target scheme
   * @returns Promise resolving to execution success status
   */
  executeDebug(environment: string, target: string): Promise<boolean>;

  /**
   * Execute iOS release command
   *
   * @param environment - The target environment
   * @param target - The Xcode target scheme
   * @param configuration - The build configuration
   * @param selectedDevice - The selected device
   * @returns Promise resolving to execution success status
   */
  executeRelease(
    environment: string,
    target: string,
    configuration: string,
    selectedDevice: DeviceInfo
  ): Promise<boolean>;

  /**
   * Execute iOS build command
   *
   * @param environment - The target environment
   * @param target - The Xcode target scheme
   * @param configuration - The build configuration
   * @returns Promise resolving to execution success status
   */
  executeBuild(
    environment: string,
    target: string,
    configuration: string
  ): Promise<boolean>;

  /**
   * Run iOS diagnostics when errors occur
   *
   * @param scheme - The Xcode scheme
   * @param configuration - The build configuration
   * @returns Promise resolving to diagnostic results
   */
  runDiagnostics(scheme: string, configuration: string): Promise<string>;
}
