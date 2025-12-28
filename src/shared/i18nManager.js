/**
 * Internationalization (i18n) Manager
 * Supports multiple languages with dynamic loading
 */

export class I18nManager {
  constructor() {
    this.currentLanguage = this.loadLanguage();
    this.translations = {};
    this.fallbackLanguage = 'en';
    this.supportedLanguages = ['en', 'es', 'fr', 'de', 'zh'];
  }

  /**
   * Load saved language or detect from browser
   */
  loadLanguage() {
    const saved = localStorage.getItem('ndax-language');
    if (saved) {
      return saved;
    }

    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    return this.supportedLanguages.includes(langCode) ? langCode : 'en';
  }

  /**
   * Set current language
   */
  async setLanguage(langCode) {
    if (!this.supportedLanguages.includes(langCode)) {
      throw new Error(`Unsupported language: ${langCode}`);
    }

    this.currentLanguage = langCode;
    localStorage.setItem('ndax-language', langCode);

    // Load translations if not already loaded
    if (!this.translations[langCode]) {
      await this.loadTranslations(langCode);
    }

    // Dispatch language change event
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: langCode } }));
  }

  /**
   * Load translations for a language
   */
  async loadTranslations(langCode) {
    try {
      const response = await fetch(`/locales/${langCode}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${langCode}`);
      }
      this.translations[langCode] = await response.json();
    } catch (error) {
      console.warn(`Loading translations for ${langCode} failed, using fallback`, error);
      if (langCode !== this.fallbackLanguage) {
        await this.loadTranslations(this.fallbackLanguage);
      }
    }
  }

  /**
   * Get translation for a key
   */
  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];

    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    // Fallback to English if translation not found
    if (!value && this.currentLanguage !== this.fallbackLanguage) {
      let fallback = this.translations[this.fallbackLanguage];
      for (const k of keys) {
        if (fallback && typeof fallback === 'object') {
          fallback = fallback[k];
        } else {
          fallback = undefined;
          break;
        }
      }
      value = fallback;
    }

    // Return key if no translation found
    if (!value) {
      return key;
    }

    // Replace parameters
    return this.interpolate(value, params);
  }

  /**
   * Interpolate parameters in translation string
   */
  interpolate(str, params) {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * Get current language
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  /**
   * Format number according to locale
   */
  formatNumber(number, options = {}) {
    return new Intl.NumberFormat(this.currentLanguage, options).format(number);
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency
    }).format(amount);
  }

  /**
   * Format date according to locale
   */
  formatDate(date, options = {}) {
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
  }

  /**
   * Format relative time
   */
  formatRelativeTime(value, unit) {
    const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });
    return rtf.format(value, unit);
  }

  /**
   * Add listener for language changes
   */
  onLanguageChange(callback) {
    window.addEventListener('languagechange', (e) => callback(e.detail.language));
  }

  /**
   * Remove language change listener
   */
  offLanguageChange(callback) {
    window.removeEventListener('languagechange', callback);
  }
}

// Translation data embedded (can be moved to separate files)
export const translations = {
  en: {
    common: {
      welcome: 'Welcome to NDAX Quantum Engine',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Operation successful',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close'
    },
    dashboard: {
      title: 'Dashboard',
      overview: 'Overview',
      performance: 'Performance',
      analytics: 'Analytics'
    },
    trading: {
      title: 'Trading',
      buy: 'Buy',
      sell: 'Sell',
      price: 'Price',
      amount: 'Amount',
      total: 'Total',
      orderPlaced: 'Order placed successfully'
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
      privacy: 'Privacy'
    }
  },
  es: {
    common: {
      welcome: 'Bienvenido a NDAX Quantum Engine',
      loading: 'Cargando...',
      error: 'Ocurrió un error',
      success: 'Operación exitosa',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar'
    },
    dashboard: {
      title: 'Panel',
      overview: 'Resumen',
      performance: 'Rendimiento',
      analytics: 'Analíticas'
    },
    trading: {
      title: 'Comercio',
      buy: 'Comprar',
      sell: 'Vender',
      price: 'Precio',
      amount: 'Cantidad',
      total: 'Total',
      orderPlaced: 'Orden colocada exitosamente'
    },
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      theme: 'Tema',
      notifications: 'Notificaciones',
      privacy: 'Privacidad'
    }
  },
  fr: {
    common: {
      welcome: 'Bienvenue dans NDAX Quantum Engine',
      loading: 'Chargement...',
      error: 'Une erreur s\'est produite',
      success: 'Opération réussie',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer'
    },
    dashboard: {
      title: 'Tableau de bord',
      overview: 'Aperçu',
      performance: 'Performance',
      analytics: 'Analytique'
    },
    trading: {
      title: 'Trading',
      buy: 'Acheter',
      sell: 'Vendre',
      price: 'Prix',
      amount: 'Montant',
      total: 'Total',
      orderPlaced: 'Commande passée avec succès'
    },
    settings: {
      title: 'Paramètres',
      language: 'Langue',
      theme: 'Thème',
      notifications: 'Notifications',
      privacy: 'Confidentialité'
    }
  },
  de: {
    common: {
      welcome: 'Willkommen bei NDAX Quantum Engine',
      loading: 'Laden...',
      error: 'Ein Fehler ist aufgetreten',
      success: 'Operation erfolgreich',
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      close: 'Schließen'
    },
    dashboard: {
      title: 'Dashboard',
      overview: 'Übersicht',
      performance: 'Leistung',
      analytics: 'Analytik'
    },
    trading: {
      title: 'Handel',
      buy: 'Kaufen',
      sell: 'Verkaufen',
      price: 'Preis',
      amount: 'Betrag',
      total: 'Gesamt',
      orderPlaced: 'Bestellung erfolgreich aufgegeben'
    },
    settings: {
      title: 'Einstellungen',
      language: 'Sprache',
      theme: 'Design',
      notifications: 'Benachrichtigungen',
      privacy: 'Datenschutz'
    }
  },
  zh: {
    common: {
      welcome: '欢迎使用 NDAX Quantum Engine',
      loading: '加载中...',
      error: '发生错误',
      success: '操作成功',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      close: '关闭'
    },
    dashboard: {
      title: '仪表板',
      overview: '概览',
      performance: '性能',
      analytics: '分析'
    },
    trading: {
      title: '交易',
      buy: '买入',
      sell: '卖出',
      price: '价格',
      amount: '数量',
      total: '总计',
      orderPlaced: '订单已成功下达'
    },
    settings: {
      title: '设置',
      language: '语言',
      theme: '主题',
      notifications: '通知',
      privacy: '隐私'
    }
  }
};

// Create singleton instance
export const i18n = new I18nManager();

// Initialize with embedded translations
i18n.translations = translations;
