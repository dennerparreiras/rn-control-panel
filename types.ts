/**
 * Control Panel Types
 *
 * This file contains the main type definitions used throughout the Control Panel modules.
 * It provides a centralized location for core type definitions.
 */

/**
 * Control Panel Configuration
 *
 * Represents the structure of the control-panel-data.json file
 */
export interface ControlPanelConfig {
  environment: EnvironmentConfig;
  android: PlatformConfig;
  ios: PlatformConfig;
  web: PlatformConfig;
  version: VersionConfig;
  ui: UIConfig;
}

/**
 * Environment Configuration
 *
 * Defines the configuration for different environments (development, staging, production)
 */
export interface EnvironmentConfig {
  [key: string]: {
    enabled: boolean;
    "original-env-location": string;
  };
}

/**
 * Platform Configuration
 *
 * Defines the configuration for a specific platform (Android, iOS, Web)
 */
export interface PlatformConfig {
  enabled: boolean;
  scripts: {
    "pre-run-script-location"?: string;
    "run-script-location"?: string;
    "pre-script"?: string;
    "post-script"?: string;
    "run-script"?: string;
    "build-script"?: string;
    "release-script"?: string;
    "deploy-script"?: string;
  };
}

/**
 * Version Configuration
 *
 * Defines the configuration for version management
 */
export interface VersionConfig {
  enabled: boolean;
  platforms: {
    ios: {
      project_file: string;
      bundle_id: {
        production: string;
        staging: string;
      };
    };
    android: {
      build_gradle: string;
    };
  };
}

/**
 * UI Configuration
 *
 * Defines the configuration for the control panel UI
 */
export interface UIConfig {
  title_banner: string;
  status_enabled: string;
  status_disabled: string;
  colors: {
    [key: string]: string;
  };
}

/**
 * Menu Option
 *
 * Defines the structure of a menu option
 */
export interface MenuOption {
  key: string;
  label: string;
  color: string;
  icon?: string;
  description?: string | { [platform: string]: string };
  version?: string;
}

/**
 * App Information
 *
 * Defines the structure of app information from package.json
 */
export interface AppInfo {
  name: string;
  version: string;
  company: string;
  metadataApp?: {
    versionCode: number;
  };
}

/**
 * Environment Status
 *
 * Defines the structure of environment file status
 */
export interface EnvironmentStatus {
  exists: boolean;
  type: string | null;
}

/**
 * Device Information
 *
 * Defines the structure of device information
 */
export interface DeviceInfo {
  id: string;
  name: string;
  category?: string;
  platform?: string;
  osVersion?: string;
  status?: string;
  index?: number;
  modelName?: string;
}

/**
 * Categorized Devices
 *
 * Defines the structure for categorized devices (iOS)
 */
export interface CategorizedDevices {
  physicalDevices: DeviceInfo[];
  offlineDevices: DeviceInfo[];
  simulators: DeviceInfo[];
}

/**
 * Command Line Arguments
 *
 * Defines the structure of parsed command line arguments
 */
export interface CommandLineArgs {
  environment: string | null;
  platform: string | null;
  action: string | null;
  operation: string | null;
  serverOption?: string;
  verbose: boolean;
}

/**
 * Version Info
 *
 * Defines the structure of version information
 */
export interface VersionInfo {
  version: string;
  versionCode: number;
}

/**
 * Spinner
 *
 * Defines the structure of a spinner animation
 */
export interface Spinner {
  update: (newText: string) => void;
  stop: (finalText?: string) => void;
}

/**
 * Variant Info
 *
 * Defines the structure of Android variant information
 */
export interface VariantInfo {
  flavor: string;
  buildType: string;
  variantName: string;
  lowerVariantName: string;
}

/**
 * UI Configuration Options
 *
 * Defines the configuration options for the UI
 */
export interface UIConfigOptions {
  environment: MenuOption[];
  platform: MenuOption[];
  actionStandard: MenuOption[];
  actionWeb: MenuOption[];
}

/**
 * UI Theme
 *
 * Defines the UI theme configuration
 */
export interface UITheme {
  titleBanner: (text: string) => void;
  sectionHeader: (text: string) => void;
  frameLine: () => void;
  infoItem: (key: string, value: string, color?: string) => void;
  statusEnabled: string;
  statusDisabled: string;
  warning: (text: string) => string;
  error: (text: string) => string;
  success: (text: string) => string;
  info: (text: string) => string;
}
