/**
 * Version Module Types
 *
 * This file contains type definitions for the Version module.
 */

import { AppInfo, VersionInfo } from '../types';

/**
 * Version Manager Interface
 *
 * Define the interface for the version manager
 */
export interface VersionManager {
  /**
   * Read Package JSON
   *
   * Reads the package.json file
   *
   * @returns Package JSON contents
   */
  readPackageJson(): AppInfo;

  /**
   * Write Package JSON
   *
   * Writes to the package.json file
   *
   * @param packageJson Package JSON object to write
   * @returns Success status
   */
  writePackageJson(packageJson: AppInfo): boolean;

  /**
   * Update iOS Project File
   *
   * Updates iOS project.pbxproj file with new version
   *
   * @param newVersion New app version
   * @param environment Current environment
   * @returns Success status
   */
  updateIOSPbxproj(newVersion: string, environment: string): boolean;

  /**
   * Update Android Build Gradle
   *
   * Updates Android build.gradle file with new version
   *
   * @param newVersion New app version
   * @returns Success status
   */
  updateAndroidBuildGradle(newVersion: string): boolean;

  /**
   * Prompt for Version Update
   *
   * Displays version info and options to the user
   *
   * @returns Promise resolving to new version info
   */
  promptVersionUpdate(): Promise<VersionInfo>;

  /**
   * Update Version
   *
   * Updates version across all app files
   *
   * @param version New version string
   * @param versionCode New version code
   * @param environment Current environment
   * @returns Success status
   */
  updateVersion(version: string, versionCode: number, environment: string): boolean;
} 