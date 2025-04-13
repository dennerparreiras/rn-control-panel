/**
 * Barrel Exports
 * 
 * Este arquivo centraliza exportações para facilitar a importação em outros arquivos
 */

// Exports do módulo Android
export { createAndroidHandler } from './Android';
export type { AndroidHandler } from './Android/types';

// Exports do módulo iOS
export { createiOSHandler } from './iOS';
export type { iOSHandler } from './iOS/types';

// Exports do módulo Environment
export { createEnvironmentManager, EnvironmentManager } from './Environment';
export type { EnvironmentManager as IEnvironmentManager } from './Environment/types';

// Exports do módulo UI
export { UIController } from './UI';
export type { UserInterface } from './UI/types';

// Exports do módulo Utils
export { Utils, VerbosityControlImpl } from './Utils';
export type { Utilities, VerbosityControl } from './Utils/types';

// Exports do módulo Version
export { createVersionManager, VersionManager } from './Version';
export type { VersionManager as IVersionManager } from './Version/types';

// Exports do módulo Web
export { createWebHandler } from './Web';
export type { WebHandler } from './Web/types';

// Exports do módulo ReactNative
export { createReactNativeHandler } from './ReactNative';
export type { ReactNativeHandler, ServerOptions } from './ReactNative/types';

// Exports dos tipos globais
export * from './types'; 