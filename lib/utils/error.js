/**
 * Error Handler - Centralized error management and reporting
 * Collects, categorizes, and reports errors from all modules
 */

import { getLogger } from './logger.js';
import { Bus } from './event-bus.js';

const log = getLogger('ErrorHandler');

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR LEVELS
═══════════════════════════════════════════════════════════════════════════ */

export const ERROR_LEVELS = {
  DEBUG: 0,       // Debug information (non-errors)
  WARNING: 1,     // Non-critical issues that don't break functionality
  ERROR: 2,       // Errors that affect functionality but are recoverable
  CRITICAL: 3     // Critical errors that may break the application
};

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR CATEGORIES
═══════════════════════════════════════════════════════════════════════════ */

export const ERROR_CATEGORIES = {
  INIT: 'initialization',
  MODULE: 'module',
  NETWORK: 'network',
  DOM: 'dom',
  STORAGE: 'storage',
  PARSING: 'parsing',
  UNKNOWN: 'unknown'
};

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR STORAGE
═══════════════════════════════════════════════════════════════════════════ */

class ErrorStore {
  constructor(maxSize = 100) {
    this.errors = [];
    this.maxSize = maxSize;
    this.listeners = [];
  }

  /**
   * Add an error to the store
   */
  add(errorData) {
    this.errors.unshift(errorData); // Add to beginning
    
    // Trim to max size
    if (this.errors.length > this.maxSize) {
      this.errors = this.errors.slice(0, this.maxSize);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(errorData);
      } catch (e) {
        console.error('[ErrorHandler] Listener error:', e);
      }
    });

    // Persist to localStorage for debugging
    this.persistToStorage();
  }

  /**
   * Get all errors
   */
  getAll() {
    return [...this.errors];
  }

  /**
   * Get errors by level
   */
  getByLevel(level) {
    return this.errors.filter(err => err.level === level);
  }

  /**
   * Get errors by category
   */
  getByCategory(category) {
    return this.errors.filter(err => err.category === category);
  }

  /**
   * Get errors by module
   */
  getByModule(moduleName) {
    return this.errors.filter(err => err.module === moduleName);
  }

  /**
   * Clear all errors
   */
  clear() {
    this.errors = [];
    this.persistToStorage();
  }

  /**
   * Subscribe to new errors
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  /**
   * Persist errors to localStorage for debugging
   */
  persistToStorage() {
    try {
      const key = 'ao3h:error-history';
      const data = JSON.stringify(this.errors.slice(0, 50)); // Keep last 50
      localStorage.setItem(key, data);
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Load errors from localStorage
   */
  loadFromStorage() {
    try {
      const key = 'ao3h:error-history';
      const data = localStorage.getItem(key);
      if (data) {
        this.errors = JSON.parse(data);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   ERROR HANDLER
═══════════════════════════════════════════════════════════════════════════ */

export class ErrorHandler {
  constructor() {
    this.store = new ErrorStore();
    this.enabled = true;
    this.showToasts = true;
    
    // Load previous errors
    this.store.loadFromStorage();

    // Setup global error handler
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Catch unhandled errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        if (!this.enabled) return;
        
        this.report({
          message: event.message || 'Unhandled error',
          error: event.error,
          level: ERROR_LEVELS.ERROR,
          category: ERROR_CATEGORIES.UNKNOWN,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });
      });

      // Catch unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        if (!this.enabled) return;
        
        this.report({
          message: 'Unhandled promise rejection',
          error: event.reason,
          level: ERROR_LEVELS.ERROR,
          category: ERROR_CATEGORIES.UNKNOWN,
          context: {
            promise: event.promise
          }
        });
      });
    }
  }

  /**
   * Report an error
   * @param {Object} options - Error options
   * @param {string} options.message - Error message
   * @param {Error} options.error - Error object
   * @param {number} options.level - Error level (ERROR_LEVELS)
   * @param {string} options.category - Error category (ERROR_CATEGORIES)
   * @param {string} options.module - Module name
   * @param {Object} options.context - Additional context
   */
  report({
    message = 'Unknown error',
    error = null,
    level = ERROR_LEVELS.ERROR,
    category = ERROR_CATEGORIES.UNKNOWN,
    module = 'unknown',
    context = {}
  } = {}) {
    if (!this.enabled) return;

    // Create error data
    const errorData = {
      id: this.generateId(),
      timestamp: Date.now(),
      message,
      level,
      levelName: this.getLevelName(level),
      category,
      module,
      context,
      stack: error?.stack || new Error().stack,
      errorName: error?.name,
      errorMessage: error?.message
    };

    // Store error
    this.store.add(errorData);

    // Log to console
    this.logToConsole(errorData);

    // Emit event via bus
    this.emitEvent(errorData);

    // Show toast if enabled
    if (this.showToasts && level >= ERROR_LEVELS.ERROR) {
      this.showToast(errorData);
    }

    return errorData;
  }

  /**
   * Generate unique error ID
   */
  generateId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get level name
   */
  getLevelName(level) {
    return Object.keys(ERROR_LEVELS).find(key => ERROR_LEVELS[key] === level) || 'UNKNOWN';
  }

  /**
   * Log error to console
   */
  logToConsole(errorData) {
    const { level, message, module, errorMessage, stack } = errorData;
    
    const prefix = `[AO3H][${module}][${errorData.levelName}]`;
    const fullMessage = errorMessage ? `${message}: ${errorMessage}` : message;

    switch (level) {
      case ERROR_LEVELS.DEBUG:
        console.debug(prefix, fullMessage);
        break;
      case ERROR_LEVELS.WARNING:
        console.warn(prefix, fullMessage);
        break;
      case ERROR_LEVELS.ERROR:
        console.error(prefix, fullMessage);
        if (stack) console.error('Stack:', stack);
        break;
      case ERROR_LEVELS.CRITICAL:
        console.error('🚨', prefix, fullMessage);
        if (stack) console.error('Stack:', stack);
        break;
    }
  }

  /**
   * Emit error event via event bus
   */
  emitEvent(errorData) {
    try {
      // Étape 313 : Bus importé directement (avant : lecture W.AO3H / W.AO3H_Common)
      const bus = Bus;
      if (bus && typeof bus.emit === 'function') {
        // Emit general error event
        bus.emit('error', errorData);
        
        // Emit level-specific event
        bus.emit(`error:${errorData.levelName.toLowerCase()}`, errorData);
        
        // Emit category-specific event
        bus.emit(`error:${errorData.category}`, errorData);
      }
    } catch (e) {
      console.error('[ErrorHandler] Failed to emit event:', e);
    }
  }

  /**
   * Show toast notification
   */
  showToast(errorData) {
    try {
      const { message, levelName, module } = errorData;
      
      // Create toast element
      const toast = document.createElement('div');
      toast.className = 'ao3h-error-toast';
      toast.setAttribute('data-level', levelName.toLowerCase());
      toast.innerHTML = `
        <div class="ao3h-error-toast-header">
          <span class="ao3h-error-toast-icon">${levelName === 'CRITICAL' ? '🚨' : '⚠️'}</span>
          <span class="ao3h-error-toast-title">${levelName}</span>
          <button class="ao3h-error-toast-close">×</button>
        </div>
        <div class="ao3h-error-toast-body">
          <strong>${module}:</strong> ${message}
        </div>
      `;

      // Add CSS if not already added
      this.ensureToastStyles();

      // Add to page
      document.body.appendChild(toast);

      // Close button
      const closeBtn = toast.querySelector('.ao3h-error-toast-close');
      closeBtn.addEventListener('click', () => toast.remove());

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (toast.parentNode) {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 300);
        }
      }, 5000);
    } catch (e) {
      console.error('[ErrorHandler] Failed to show toast:', e);
    }
  }

  /**
   * Ensure toast styles are injected
   */
  ensureToastStyles() {
    if (document.getElementById('ao3h-error-toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'ao3h-error-toast-styles';
    style.textContent = `
      .ao3h-error-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        max-width: 400px;
        background: #fff;
        border-left: 4px solid #f44336;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
        opacity: 1;
        transition: opacity 0.3s ease;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
      }
      .ao3h-error-toast[data-level="critical"] {
        border-left-color: #d32f2f;
        animation: ao3h-error-pulse 2s infinite;
      }
      .ao3h-error-toast[data-level="warning"] {
        border-left-color: #ff9800;
      }
      .ao3h-error-toast-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 12px 8px 12px;
        border-bottom: 1px solid #eee;
      }
      .ao3h-error-toast-icon {
        font-size: 18px;
      }
      .ao3h-error-toast-title {
        flex: 1;
        font-weight: 600;
        color: #333;
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 0.5px;
      }
      .ao3h-error-toast-close {
        background: none;
        border: none;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 24px;
        height: 24px;
      }
      .ao3h-error-toast-close:hover {
        color: #333;
      }
      .ao3h-error-toast-body {
        padding: 12px;
        color: #666;
        line-height: 1.4;
      }
      @keyframes ao3h-error-pulse {
        0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        50% { box-shadow: 0 4px 20px rgba(211,47,47,0.4); }
      }
      @media (prefers-color-scheme: dark) {
        .ao3h-error-toast {
          background: #2b2b2b;
          color: #e0e0e0;
        }
        .ao3h-error-toast-header {
          border-bottom-color: #444;
        }
        .ao3h-error-toast-title {
          color: #e0e0e0;
        }
        .ao3h-error-toast-body {
          color: #b0b0b0;
        }
        .ao3h-error-toast-close {
          color: #888;
        }
        .ao3h-error-toast-close:hover {
          color: #fff;
        }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  /**
   * Get error statistics
   */
  getStats() {
    const all = this.store.getAll();
    return {
      total: all.length,
      byLevel: {
        debug: this.store.getByLevel(ERROR_LEVELS.DEBUG).length,
        warning: this.store.getByLevel(ERROR_LEVELS.WARNING).length,
        error: this.store.getByLevel(ERROR_LEVELS.ERROR).length,
        critical: this.store.getByLevel(ERROR_LEVELS.CRITICAL).length
      },
      byCategory: Object.keys(ERROR_CATEGORIES).reduce((acc, key) => {
        acc[ERROR_CATEGORIES[key]] = this.store.getByCategory(ERROR_CATEGORIES[key]).length;
        return acc;
      }, {}),
      recent: all.slice(0, 10)
    };
  }

  /**
   * Enable/disable error handler
   */
  setEnabled(enabled) {
    this.enabled = !!enabled;
  }

  /**
   * Enable/disable toast notifications
   */
  setShowToasts(show) {
    this.showToasts = !!show;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SINGLETON INSTANCE
═══════════════════════════════════════════════════════════════════════════ */

export const errorHandler = new ErrorHandler();

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC API
═══════════════════════════════════════════════════════════════════════════ */

// Étape 313 : poses window.AO3H_ErrorHandler / AO3H_Common.ErrorHandler et bloc CJS
// supprimés. Ce fichier n'a jamais fait partie du graphe Vite ; côté legacy, le seul
// lecteur (core/lifecycle.js) résout avec fallback (`||`) et un guard. Exports ES seuls.

console.log('[AO3H] ✅ Error handler initialized');
