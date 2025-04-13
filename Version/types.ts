/**
 * Version Module Types
 *
 * This file contains type definitions specific to the version management module.
 */

/**
 * VersionManager
 *
 * Interface defining the methods required for version management
 */
export interface VersionManager {
  /**
   * Read the package.json file
   *
   * @returns Package.json contents
   */
  readPackageJson(): any;

  /**
   * Write to the package.json file
   *
   * @param packageJson - Package JSON object to write
   * @returns Success status
   */
  writePackageJson(packageJson: any): boolean;

  /**
   * Update iOS project.pbxproj file with new version
   *
   * @param newVersion - New app version
   * @param environment - Current environment
   * @returns Success status
   */
  updateIOSPbxproj(newVersion: string, environment: string): boolean;

  /**
   * Update Android build.gradle file with new version
   *
   * @param newVersion - New app version
   * @returns Success status
   */
  updateAndroidBuildGradle(newVersion: string): boolean;

  /**
   * Display version info and options to the user
   *
   * @returns Promise resolving to new version info
   */
  promptVersionUpdate(): Promise<VersionInfo>;

  /**
   * Update version across all app files
   *
   * @param version - New version string
   * @param versionCode - New version code
   * @param environment - Current environment
   * @returns Success status
   */
  updateVersion(version: string, versionCode: number, environment: string): boolean;
}

/**
 * Version Info
 *
 * Information about app version
 */
export interface VersionInfo {
  version: string;
  versionCode: number;
}

/**
 * Version Update Type
 *
 * Type of version update (patch, minor, major, custom)
 */
export enum VersionUpdateType {
  PATCH = 'patch',
  MINOR = 'minor',
  MAJOR = 'major',
  CUSTOM = 'custom',
  SKIP = 'skip'
}

/**
 * Version Files
 *
 * Paths to files that need version updates
 */
export interface VersionFiles {
  packageJson: string;
  iosPbxproj: string;
  androidBuildGradle: string;
}
