/**
 * iOS Module Types
 *
 * This file contains type definitions for the iOS module.
 */

import { DeviceInfo, CategorizedDevices } from '../types';

/**
 * iOS Handler Interface
 *
 * Defines the iOS operations handler
 */
export interface iOSHandler {
  /**
   * List Devices
   *
   * List available iOS devices and simulators
   *
   * @returns Promise resolving to categorized device list
   */
  listDevices(): Promise<CategorizedDevices>;

  /**
   * Select Device
   *
   * Display categorized devices with sequential numbering and let user select one
   *
   * @param categorizedDevices Object containing device categories
   * @returns Selected device or null if selection failed
   */
  selectDevice(categorizedDevices: CategorizedDevices): Promise<DeviceInfo | null>;

  /**
   * Update Pods
   *
   * Update CocoaPods dependencies
   *
   * @returns Success status
   */
  updatePods(): Promise<boolean>;

  /**
   * Setup Environment
   *
   * Set up iOS environment
   *
   * @param environment Environment name
   * @returns Success status
   */
  setupEnvironment(environment: string): Promise<boolean>;

  /**
   * Get Clean Device Name
   *
   * Extract the base device name without version info
   *
   * @param fullName Full device name with version
   * @returns Clean device name
   */
  getCleanDeviceName(fullName: string): string;

  /**
   * Execute Debug
   *
   * Execute iOS debug command
   *
   * @param environment Environment name
   * @param target Target scheme name
   * @returns Success status
   */
  executeDebug(environment: string, target: string): Promise<boolean>;

  /**
   * Run Diagnostics
   *
   * Run iOS diagnostics when errors occur
   *
   * @param scheme Scheme name
   * @param configuration Build configuration
   * @returns Promise resolving to diagnostic message
   */
  runDiagnostics(scheme: string, configuration: string): Promise<string>;
} 