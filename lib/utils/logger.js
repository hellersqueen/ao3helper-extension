/**
 * Centralized Logger - Unified logging system for AO3 Helper
 * Replaces the scattered console.log calls and multiple logging patterns
 */

// Étape 313 : import direct (le build legacy strippe la ligne — getGlobalWindow est
// alors fourni par globals.js, concaténé avant ce fichier). L'ancienne résolution via
// window.AO3H_Globals appelait par erreur `._getGlobalWindow()` (méthode inexistante) —
// bug latent jamais déclenché : branche morte côté Vite (interop CJS), et pose sur
// unsafeWindow vs test sur window côté Tampermonkey.
import { getGlobalWindow } from './globals.js';

/**
 * Log levels - higher numbers include lower levels
 */
export const LOG_LEVELS = {
  SILENT: 0,    // No logging
  ERROR: 1,     // Only errors
  WARN: 2,      // Errors and warnings
  INFO: 3,      // Errors, warnings, and info
  DEBUG: 4      // All logs including debug
};

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  level: LOG_LEVELS.INFO,  // Default to INFO level
  debug: false,            // Global DEBUG flag
  productionMode: false,   // Production mode (silences debug/info)
  prefix: '[AO3H]',        // Default prefix for all logs
  timestamp: false,        // Whether to include timestamps
  groupSimilar: true       // Group similar consecutive messages
};

/**
 * Logger class that provides standardized logging across the application
 */
export class Logger {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.lastMessage = null;
    this.repeatCount = 0;
    this.timers = new Map(); // For timing operations
  }

  /**
   * Update logger configuration
   * @param {Object} newConfig - New configuration options
   */
  configure(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Format a log message with prefix and optional timestamp
   * @private
   */
  _formatMessage(level, context, args) {
    const parts = [];
    
    // Add prefix
    if (this.config.prefix) {
      parts.push(this.config.prefix);
    }
    
    // Add timestamp if enabled
    if (this.config.timestamp) {
      const now = new Date();
      const time = now.toISOString().substr(11, 12); // HH:mm:ss.sss
      parts.push(`[${time}]`);
    }
    
    // Add level indicator
    const levelIndicators = {
      error: '[X]',
      warn: '[!]',
      info: '',
      debug: '[D]'
    };
    
    if (levelIndicators[level]) {
      parts.push(levelIndicators[level]);
    }
    
    // Add context if provided
    if (context) {
      parts.push(`[${context}]`);
    }
    
    return parts.length > 0 ? [parts.join(' '), ...args] : args;
  }

  /**
   * Check if message should be grouped with previous message
   * @private
   */
  _shouldGroup(message) {
    if (!this.config.groupSimilar) return false;
    
    const messageStr = Array.isArray(message) ? message.join(' ') : String(message);
    
    if (this.lastMessage === messageStr) {
      this.repeatCount++;
      return true;
    }
    
    // If we had repeats, show the count
    if (this.repeatCount > 0) {
      console.log(`${this.config.prefix} (previous message repeated ${this.repeatCount} times)`);
      this.repeatCount = 0;
    }
    
    this.lastMessage = messageStr;
    return false;
  }

  /**
   * Internal logging method
   * @private
   */
  _log(level, levelNum, context, args) {
    // In production mode, only log errors and warnings
    if (this.config.productionMode && levelNum > LOG_LEVELS.WARN) {
      return;
    }
    
    // Check if this level should be logged
    if (levelNum > this.config.level) return;
    
    // Special case for debug - also check global debug flag
    if (level === 'debug' && !this.config.debug) return;
    
    const formattedArgs = this._formatMessage(level, context, args);
    
    // Check for message grouping
    if (this._shouldGroup(formattedArgs)) return;
    
    // Use appropriate console method
    const consoleMethod = {
      error: console.error,
      warn: console.warn,
      info: console.log,
      debug: console.log
    }[level] || console.log;
    
    consoleMethod.apply(console, formattedArgs);
  }

  /**
   * Log an error message
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    this._log('error', LOG_LEVELS.ERROR, null, args);
  }

  /**
   * Log a warning message
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    this._log('warn', LOG_LEVELS.WARN, null, args);
  }

  /**
   * Log an info message
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    this._log('info', LOG_LEVELS.INFO, null, args);
  }

  /**
   * Log a debug message
   * @param {...any} args - Arguments to log
   */
  debug(...args) {
    this._log('debug', LOG_LEVELS.DEBUG, null, args);
  }

  /**
   * Create a contextual logger for a specific component
   * @param {string} context - Context name (e.g., 'core', 'menu', 'modules')
   * @returns {Object} Contextual logger with error, warn, info, debug methods
   */
  context(context) {
    return {
      error: (...args) => this._log('error', LOG_LEVELS.ERROR, context, args),
      warn: (...args) => this._log('warn', LOG_LEVELS.WARN, context, args),
      info: (...args) => this._log('info', LOG_LEVELS.INFO, context, args),
      debug: (...args) => this._log('debug', LOG_LEVELS.DEBUG, context, args),
      
      // Convenience methods
      log: (...args) => this._log('info', LOG_LEVELS.INFO, context, args),
      err: (...args) => this._log('error', LOG_LEVELS.ERROR, context, args),
      dbg: (...args) => this._log('debug', LOG_LEVELS.DEBUG, context, args)
    };
  }

  /**
   * Start a timer for performance measurement
   * @param {string} name - Timer name
   */
  time(name) {
    this.timers.set(name, performance.now());
  }

  /**
   * End a timer and log the elapsed time
   * @param {string} name - Timer name
   * @param {string} [context] - Optional context
   */
  timeEnd(name, context = null) {
    if (!this.timers.has(name)) {
      this.warn('Timer not found:', name);
      return;
    }
    
    const startTime = this.timers.get(name);
    const elapsed = performance.now() - startTime;
    this.timers.delete(name);
    
    this._log('info', LOG_LEVELS.INFO, context, [`Timer ${name}:`, `${elapsed.toFixed(2)}ms`]);
  }

  /**
   * Log with a specific level
   * @param {string} level - Log level ('error', 'warn', 'info', 'debug')
   * @param {...any} args - Arguments to log
   */
  log(level, ...args) {
    const levelNum = {
      error: LOG_LEVELS.ERROR,
      warn: LOG_LEVELS.WARN,
      info: LOG_LEVELS.INFO,
      debug: LOG_LEVELS.DEBUG
    }[level] || LOG_LEVELS.INFO;
    
    this._log(level, levelNum, null, args);
  }

  /**
   * Create a guard function that wraps another function with error handling
   * @param {Function} fn - Function to guard
   * @param {string} [label] - Optional label for error messages
   * @param {string} [context] - Optional context for logging
   * @returns {Function} Guarded function
   */
  guard(fn, label = '', context = null) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this._log('error', LOG_LEVELS.ERROR, context, ['Guard error', label, error]);
        return undefined;
      }
    };
  }
}

// Create the global logger instance
const globalLogger = new Logger();

// Configure based on environment
try {
  const W = getGlobalWindow();
  const ao3h = W.AO3H || {};
  
  if (ao3h.env) {
    globalLogger.configure({
      debug: !!ao3h.env.DEBUG,
      level: ao3h.env.DEBUG ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO
    });
  }
} catch (e) {
  // Silently fail if environment detection fails
}

/**
 * Get a contextual logger for a specific component
 * This is the main function modules should use
 * 
 * @param {string} context - Context/component name
 * @returns {Object} Contextual logger
 */
export function getLogger(context = null) {
  return context ? globalLogger.context(context) : {
    error: globalLogger.error.bind(globalLogger),
    warn: globalLogger.warn.bind(globalLogger),
    info: globalLogger.info.bind(globalLogger),
    debug: globalLogger.debug.bind(globalLogger),
    log: globalLogger.info.bind(globalLogger),
    err: globalLogger.error.bind(globalLogger),
    dbg: globalLogger.debug.bind(globalLogger)
  };
}

/**
 * Configure the global logger
 * @param {Object} config - Configuration options
 */
export function configureLogger(config) {
  globalLogger.configure(config);
}

/**
 * Enable production mode (only errors and warnings)
 * Can be called at runtime to reduce noise
 */
export function setProductionMode(enabled = true) {
  globalLogger.configure({ productionMode: !!enabled });
  
  const W = getGlobalWindow();
  if (W.AO3H?.env) {
    W.AO3H.env.PRODUCTION_MODE = !!enabled;
  }
  
  console.log(`[AO3H] Production mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
}

/**
 * Check if production mode is enabled
 * @returns {boolean}
 */
export function isProductionMode() {
  return globalLogger.config.productionMode;
}

/**
 * Enable debug mode (all logs including debug)
 */
export function setDebugMode(enabled = true) {
  globalLogger.configure({ 
    debug: !!enabled,
    level: enabled ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO
  });
  
  const W = getGlobalWindow();
  if (W.AO3H?.env) {
    W.AO3H.env.DEBUG = !!enabled;
  }
  
  console.log(`[AO3H] Debug mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
}

/**
 * Create a guard function using the global logger
 * @param {Function} fn - Function to guard
 * @param {string} label - Label for error messages
 * @returns {Function} Guarded function
 */
export function createGuard(fn, label = '') {
  return globalLogger.guard(fn, label);
}

// Étape 313 : le bloc de pose window.AO3H_Logger / AO3H_Log / AO3H_Set* et l'objet
// legacyLogger qui l'alimentait sont supprimés. Côté Vite c'était une branche morte
// (interop CJS) ; côté legacy, les lecteurs (core/*.js) ont tous un fallback.
// Les exports ES ci-dessus font foi.
