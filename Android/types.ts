/**
 * Android Module Types
 *
 * This file contains type definitions specific to the Android platform module.
 */

import { DeviceInfo, VariantInfo } from '../types';

/**
 * AndroidHandler
 *
 * Interface defining the methods required for Android platform operations
 */
export interface AndroidHandler {
  /**
   * Set up Android environment
   *
   * @param environment - The target environment (development, staging, production)
   * @returns Promise resolving to setup success status
   */
  setupEnvironment(environment: string): Promise<boolean>;

  /**
   * Get Android build variant based on environment and action
   *
   * @param environment - The target environment code (d, s, p)
   * @param action - The action code (d, r, b)
   * @returns Variant information
   */
  getVariant(environment: string, action: string): VariantInfo;

  /**
   * List available Android devices
   *
   * @returns Promise resolving to list of Android devices
   */
  listDevices(): Promise<DeviceInfo[]>;

  /**
   * Let user select an Android device
   *
   * @returns Promise resolving to selected device ID or "emulator"
   */
  selectDevice(): Promise<string | null>;

  /**
   * Run diagnostics when errors occur
   *
   * @param variant - The variant name
   * @returns Promise resolving to diagnostic results
   */
  runDiagnostics(variant: string): Promise<string>;

  /**
   * Execute debug command
   *
   * @param environment - The target environment
   * @param variant - The variant information
   * @param deviceId - The target device ID
   * @returns Promise resolving to execution success status
   */
  executeDebug(environment: string, variant: VariantInfo, deviceId: string): Promise<boolean>;

  /**
   * Execute release command
   *
   * @param environment - The target environment
   * @param variant - The variant information
   * @param deviceId - The target device ID
   * @returns Promise resolving to execution success status
   */
  executeRelease(environment: string, variant: VariantInfo, deviceId: string): Promise<boolean>;

  /**
   * Execute build command
   *
   * @param environment - The target environment
   * @param variant - The variant information
   * @returns Promise resolving to execution success status
   */
  executeBuild(environment: string, variant: VariantInfo): Promise<boolean>;
}
