/**
 * Version Module
 *
 * This module handles version management for the application.
 * It provides functions to update version numbers across different platforms.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import semver from 'semver';
import { ControlPanelConfig, VersionInfo, AppInfo, MenuOption } from '../types';
import { Utilities } from '../Utils/types';

/**
 * Version Manager
 *
 * Manages version updates across the application
 */
export class VersionManager {
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
   * Read Package JSON
   *
   * Reads the package.json file
   *
   * @returns Package JSON contents
   */
  readPackageJson(): AppInfo {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson;
    } catch (error) {
      console.error(
        chalk.red(`Failed to read package.json: ${(error as Error).message}`)
      );
      return {
        name: 'unknown',
        version: '0.0.0',
        company: 'unknown',
        metadataApp: { versionCode: 0 },
      };
    }
  }

  /**
   * Write Package JSON
   *
   * Writes to the package.json file
   *
   * @param packageJson Package JSON object to write
   * @returns Success status
   */
  writePackageJson(packageJson: AppInfo): boolean {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2),
        'utf8'
      );
      return true;
    } catch (error) {
      console.error(
        chalk.red(`Failed to write package.json: ${(error as Error).message}`)
      );
      return false;
    }
  }

  /**
   * Update iOS Project File
   *
   * Updates iOS project.pbxproj file with new version
   *
   * @param newVersion New app version
   * @param environment Current environment
   * @returns Success status
   */
  updateIOSPbxproj(newVersion: string, environment: string): boolean {
    try {
      // Check if iOS configuration is enabled
      if (!this.config.version.enabled || !this.config.ios.enabled) {
        console.log(chalk.yellow('iOS version update is disabled in configuration.'));
        return false;
      }

      // Get iOS project file path from configuration
      const pbxprojPath = this.config.version.platforms.ios.project_file;
      
      // Get bundle identifiers from configuration
      const productBundleIdentifier = this.config.version.platforms.ios.bundle_id.production;
      const productBundleIdentifierStaging = this.config.version.platforms.ios.bundle_id.staging;

      // Read the project file
      let pbxprojContent = fs.readFileSync(pbxprojPath, 'utf8');

      // Update marketing version (app display version)
      pbxprojContent = pbxprojContent.replace(
        /MARKETING_VERSION = ((?!1\.0)[^;])+;/g,
        `MARKETING_VERSION = ${newVersion};`
      );

      // Reset build number to 1
      pbxprojContent = pbxprojContent.replace(
        /CURRENT_PROJECT_VERSION = \d+;/,
        'CURRENT_PROJECT_VERSION = 1;'
      );

      // Set the appropriate bundle identifier based on environment
      const bundleIdentifier =
        environment === 'production'
          ? productBundleIdentifier
          : productBundleIdentifierStaging;

      // Update bundle identifiers in the project file
      pbxprojContent = pbxprojContent.replace(
        new RegExp(`PRODUCT_BUNDLE_IDENTIFIER = "${productBundleIdentifierStaging.replace(/\./g, '\\.')}(\\.[^";]*)?";`, 'g'),
        `PRODUCT_BUNDLE_IDENTIFIER = "${productBundleIdentifier}$1";`
      );

      pbxprojContent = pbxprojContent.replace(
        new RegExp(`PRODUCT_BUNDLE_IDENTIFIER = "${productBundleIdentifier.replace(/\./g, '\\.')}(\\.[^";]*)?";`, 'g'),
        `PRODUCT_BUNDLE_IDENTIFIER = "${bundleIdentifier}$1";`
      );

      // Handle dynamic product name identifiers
      pbxprojContent = pbxprojContent.replace(
        /PRODUCT_BUNDLE_IDENTIFIER = "com\.walrus\.\$\([^)]+\)";/g,
        'PRODUCT_BUNDLE_IDENTIFIER = "com.walrus.$(PRODUCT_NAME:rfc1034identifier)";'
      );

      // Write updated content back to the file
      fs.writeFileSync(pbxprojPath, pbxprojContent, 'utf8');
      console.log(chalk.green('iOS project.pbxproj updated successfully.'));
      return true;
    } catch (error) {
      console.error(chalk.red(`Failed to update iOS project file: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Update Android Build Gradle
   *
   * Updates Android build.gradle file with new version
   *
   * @param newVersion New app version
   * @returns Success status
   */
  updateAndroidBuildGradle(newVersion: string): boolean {
    try {
      // Check if Android configuration is enabled
      if (!this.config.version.enabled || !this.config.android.enabled) {
        console.log(chalk.yellow('Android version update is disabled in configuration.'));
        return false;
      }

      // Get Android build.gradle path from configuration
      const androidBuildGradlePath = this.config.version.platforms.android.build_gradle;
      
      // Read the build.gradle file
      let buildGradleContent = fs.readFileSync(androidBuildGradlePath, 'utf8');

      // Update version name (app display version)
      buildGradleContent = buildGradleContent.replace(
        /versionName "[^"]+"/,
        `versionName "${newVersion}"`
      );

      // Reset version code to 1
      buildGradleContent = buildGradleContent.replace(
        /versionCode \d+/,
        'versionCode 1'
      );

      // Write updated content back to the file
      fs.writeFileSync(androidBuildGradlePath, buildGradleContent, 'utf8');
      console.log(chalk.green('Android build.gradle updated successfully.'));
      return true;
    } catch (error) {
      console.error(chalk.red(`Failed to update Android build file: ${(error as Error).message}`));
      return false;
    }
  }

  /**
   * Prompt for Version Update
   *
   * Displays version info and options to the user
   *
   * @returns Promise resolving to new version info
   */
  async promptVersionUpdate(): Promise<VersionInfo> {
    const packageJson = this.readPackageJson();
    const currentVersion = packageJson.version;
    const currentVersionCode = packageJson.metadataApp?.versionCode || 0;

    console.log(chalk.bold.cyan('\nVersion Management'));
    console.log(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(`  ${chalk.dim('CURRENT VERSION'.padEnd(25))} │ ${chalk.green(currentVersion)}`);
    console.log(`  ${chalk.dim('CURRENT VERSION CODE'.padEnd(25))} │ ${chalk.yellow(currentVersionCode.toString())}`);
    console.log(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

    console.log(chalk.cyan('Select a version update type:'));

    // Create version options using semver
    const patchVersion = semver.inc(currentVersion, 'patch') || '';
    const minorVersion = semver.inc(currentVersion, 'minor') || '';
    const majorVersion = semver.inc(currentVersion, 'major') || '';

    const versionOptions: MenuOption[] = [
      {
        key: 'P',
        label: `Patch (${patchVersion})`,
        color: 'green',
        version: patchVersion,
      },
      {
        key: 'N',
        label: `Minor (${minorVersion})`,
        color: 'yellow',
        version: minorVersion,
      },
      {
        key: 'M',
        label: `Major (${majorVersion})`,
        color: 'red',
        version: majorVersion,
      },
      { key: 'C', label: 'Custom version', color: 'blue', version: null },
      {
        key: 'S',
        label: 'Skip version update',
        color: 'gray',
        version: currentVersion,
      },
    ];

    // Display options
    versionOptions.forEach((option) => {
      const colorFn = chalk[option.color as keyof typeof chalk] || chalk.white;
      console.log(`  ${colorFn(`[${option.key}]`)} ${option.label}`);
    });

    // Get user selection
    let selection: string = '';
    const validKeys = versionOptions.map((opt) => opt.key.toLowerCase());

    while (!validKeys.includes(selection.toLowerCase())) {
      selection = await this.utils.question(
        chalk.yellow('→ Choose version update type: ')
      );

      if (await this.utils.handleSpecialCommands(selection, 'version update')) {
        if (selection.toLowerCase() === 'skip') {
          selection = 's'; // Use skip option as default
          break;
        }
        continue;
      }

      if (!validKeys.includes(selection.toLowerCase())) {
        console.log(chalk.red('⚠ Invalid selection. Please try again.'));
      }
    }

    // Find selected option
    const selectedOption = versionOptions.find(
      (opt) => opt.key.toLowerCase() === selection.toLowerCase()
    );

    let newVersion = selectedOption?.version || currentVersion;

    // If custom version selected, prompt for input
    if (selection.toLowerCase() === 'c') {
      newVersion = await this.utils.question(
        chalk.yellow(`Enter custom version (current: ${currentVersion}): `)
      );
      if (!semver.valid(newVersion)) {
        console.log(
          chalk.red('⚠ Invalid version format. Using current version.')
        );
        newVersion = currentVersion;
      }
    }

    // If not skipping, also update version code
    let newVersionCode = currentVersionCode;
    if (selection.toLowerCase() !== 's') {
      console.log(chalk.cyan('\nVersion code update:'));
      const incrementVersionCode = await this.utils.confirm(
        `Increment version code to ${currentVersionCode + 1}?`
      );

      if (incrementVersionCode) {
        newVersionCode = currentVersionCode + 1;
      } else {
        const customVersionCode = await this.utils.question(
          chalk.yellow(
            `Enter custom version code (current: ${currentVersionCode}): `
          )
        );
        newVersionCode = parseInt(customVersionCode, 10);
        if (isNaN(newVersionCode)) {
          console.log(
            chalk.red('⚠ Invalid version code. Using current version code.')
          );
          newVersionCode = currentVersionCode;
        }
      }
    }

    console.log(
      chalk.green(
        `✓ Selected version: ${newVersion}, version code: ${newVersionCode}\n`
      )
    );

    return { version: newVersion, versionCode: newVersionCode };
  }

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
  updateVersion(version: string, versionCode: number, environment: string): boolean {
    const spinner = this.utils.showSpinner('Updating app version...');
    let success = true;

    try {
      // Update package.json
      const packageJson = this.readPackageJson();
      packageJson.version = version;

      if (!packageJson.metadataApp) {
        packageJson.metadataApp = { versionCode };
      } else {
        packageJson.metadataApp.versionCode = versionCode;
      }

      if (!this.writePackageJson(packageJson)) {
        success = false;
      }

      // Update iOS project
      if (!this.updateIOSPbxproj(version, environment)) {
        success = false;
      }

      // Update Android project
      if (!this.updateAndroidBuildGradle(version)) {
        success = false;
      }

      if (success) {
        spinner.stop(chalk.green('App version updated successfully!'));
      } else {
        spinner.stop(
          chalk.red('There were issues updating some version files.')
        );
      }

      return success;
    } catch (error) {
      spinner.stop(
        chalk.red(`Failed to update version: ${(error as Error).message}`)
      );
      return false;
    }
  }
}

/**
 * Create Version Manager
 *
 * Factory function to create a version manager instance
 *
 * @param config Control panel configuration
 * @param utils Utility functions
 * @returns Version manager instance
 */
export function createVersionManager(
  config: ControlPanelConfig,
  utils: Utilities
): VersionManager {
  return new VersionManager(config, utils);
} 