/**
 * Version Module
 *
 * This module handles version management for the control panel.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import semver from 'semver';
import { VersionManager as IVersionManager } from './types';
import { ControlPanelConfig } from '../types';
import { Utils } from '../Utils';

/**
 * Version Manager Implementation
 * 
 * Implementation of version management operations
 */
class VersionManagerImpl implements IVersionManager {
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
   * Read the package.json file
   *
   * @returns Package.json contents
   */
  public readPackageJson(): any {
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
   * Write to the package.json file
   *
   * @param packageJson - Package JSON object to write
   * @returns Success status
   */
  public writePackageJson(packageJson: any): boolean {
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
   * Update iOS project.pbxproj file with new version
   *
   * @param newVersion - New app version
   * @param environment - Current environment
   * @returns Success status
   */
  public updateIOSPbxproj(newVersion: string, environment: string): boolean {
    try {
      const iosConfig = this.config.version.platforms.ios;
      const pbxprojPath = path.resolve(process.cwd(), iosConfig.project_file);
      const productBundleIdentifier = iosConfig.bundle_id.production;
      const productBundleIdentifierStaging = iosConfig.bundle_id.staging;

      let pbxprojContent = fs.readFileSync(pbxprojPath, 'utf8');

      pbxprojContent = pbxprojContent.replace(
        /MARKETING_VERSION = ((?!1\.0)[^;])+;/g,
        `MARKETING_VERSION = ${newVersion};`
      );

      pbxprojContent = pbxprojContent.replace(
        /CURRENT_PROJECT_VERSION = \d+;/,
        'CURRENT_PROJECT_VERSION = 1;'
      );

      const bundleIdentifier =
        environment === 'production'
          ? productBundleIdentifier
          : productBundleIdentifierStaging;

      // Update bundle identifiers
      pbxprojContent = pbxprojContent.replace(
        new RegExp(`PRODUCT_BUNDLE_IDENTIFIER = "${productBundleIdentifierStaging}(\\.[^";]*)?";`, 'g'),
        `PRODUCT_BUNDLE_IDENTIFIER = "${productBundleIdentifier}$1";`
      );

      pbxprojContent = pbxprojContent.replace(
        new RegExp(`PRODUCT_BUNDLE_IDENTIFIER = "${productBundleIdentifier}(\\.[^";]*)?";`, 'g'),
        `PRODUCT_BUNDLE_IDENTIFIER = "${bundleIdentifier}$1";`
      );

      // Handle dynamically generated bundle identifiers
      pbxprojContent = pbxprojContent.replace(
        /PRODUCT_BUNDLE_IDENTIFIER = "com\.walrus\.\$\([^)]+\)";/g,
        'PRODUCT_BUNDLE_IDENTIFIER = "com.walrus.$(PRODUCT_NAME:rfc1034identifier)";'
      );

      fs.writeFileSync(pbxprojPath, pbxprojContent, 'utf8');
      console.log(
        chalk.green('iOS project.pbxproj updated successfully.')
      );
      return true;
    } catch (error) {
      console.error(
        chalk.red(`Failed to update iOS project file: ${(error as Error).message}`)
      );
      return false;
    }
  }

  /**
   * Update Android build.gradle file with new version
   *
   * @param newVersion - New app version
   * @returns Success status
   */
  public updateAndroidBuildGradle(newVersion: string): boolean {
    try {
      const androidBuildGradlePath = path.resolve(
        process.cwd(),
        this.config.version.platforms.android.build_gradle
      );
      let buildGradleContent = fs.readFileSync(androidBuildGradlePath, 'utf8');

      buildGradleContent = buildGradleContent.replace(
        /versionName "[^"]+"/,
        `versionName "${newVersion}"`
      );

      buildGradleContent = buildGradleContent.replace(
        /versionCode \d+/,
        'versionCode 1'
      );

      fs.writeFileSync(androidBuildGradlePath, buildGradleContent, 'utf8');
      console.log(
        chalk.green('Android build.gradle updated successfully.')
      );
      return true;
    } catch (error) {
      console.error(
        chalk.red(`Failed to update Android build file: ${(error as Error).message}`)
      );
      return false;
    }
  }

  /**
   * Display version info and options to the user
   *
   * @returns Promise resolving to new version info
   */
  public async promptVersionUpdate(): Promise<VersionInfo> {
    const packageJson = this.readPackageJson();
    const currentVersion = packageJson.version;
    const currentVersionCode = packageJson.metadataApp?.versionCode || 0;

    console.log(chalk.bold.cyan('\nVersion Management'));
    console.log(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(`  ${chalk.dim('CURRENT VERSION'.padEnd(25))} │ ${chalk.green(currentVersion)}`);
    console.log(`  ${chalk.dim('CURRENT VERSION CODE'.padEnd(25))} │ ${chalk.yellow(currentVersionCode.toString())}`);
    console.log(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

    console.log(chalk.cyan('Select a version update type:'));

    // Create version options using semver
    const patchVersion = semver.inc(currentVersion, 'patch');
    const minorVersion = semver.inc(currentVersion, 'minor');
    const majorVersion = semver.inc(currentVersion, 'major');

    const versionOptions = [
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
      // Handle color mapping more safely
      let optionText;
      switch(option.color) {
        case 'green':
          optionText = chalk.green(`[${option.key}]`);
          break;
        case 'yellow':
          optionText = chalk.yellow(`[${option.key}]`);
          break;
        case 'red':
          optionText = chalk.red(`[${option.key}]`);
          break;
        case 'blue':
          optionText = chalk.blue(`[${option.key}]`);
          break;
        case 'gray':
          optionText = chalk.gray(`[${option.key}]`);
          break;
        default:
          optionText = `[${option.key}]`;
      }
      console.log(`  ${optionText} ${option.label}`);
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

    if (!selectedOption) {
      console.log(chalk.red('⚠ Invalid selection. Using current version.'));
      return { 
        version: currentVersion, 
        versionCode: currentVersionCode 
      };
    }

    let newVersion = selectedOption.version;

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
        const parsedVersionCode = parseInt(customVersionCode, 10);
        if (isNaN(parsedVersionCode)) {
          console.log(
            chalk.red('⚠ Invalid version code. Using current version code.')
          );
        } else {
          newVersionCode = parsedVersionCode;
        }
      }
    }

    console.log(
      chalk.green(
        `✓ Selected version: ${newVersion}, version code: ${newVersionCode}\n`
      )
    );

    return { version: newVersion as string, versionCode: newVersionCode };
  }

  /**
   * Update version across all app files
   *
   * @param version - New version string
   * @param versionCode - New version code
   * @param environment - Current environment
   * @returns Success status
   */
  public updateVersion(version: string, versionCode: number, environment: string): boolean {
    const spinner = this.utils.showSpinner('Updating app version...');
    let success = true;

    try {
      // Update package.json
      const packageJson = this.readPackageJson();
      packageJson.version = version;

      if (!packageJson.metadataApp) {
        packageJson.metadataApp = {};
      }
      packageJson.metadataApp.versionCode = versionCode;

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
 * Create and export the Version manager implementation
 * 
 * @param config - Control panel configuration
 * @param utils - Utilities instance
 * @returns An implementation of the VersionManager interface
 */
export function createVersionManager(config: ControlPanelConfig, utils: Utils): IVersionManager {
  return new VersionManagerImpl(config, utils);
}

// For backward compatibility
export const VersionManager = createVersionManager;

// Exportar os tipos também
export * from './types'; 