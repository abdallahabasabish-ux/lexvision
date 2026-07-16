import ar from './locales/ar.json'
import en from './locales/en.json'

const locales = { ar, en }
let currentLocale = 'ar'

export function initI18n(locale) {
  currentLocale = locale || 'ar'
  document.documentElement.lang = currentLocale
  document.documentElement.dir = currentLocale === 'ar' ? 'rtl' : 'ltr'
}

export function t(key) {
  const keys = key.split('.')
  let value = locales[currentLocale]
  for (const k of keys) {
    value = value?.[k]
    if (!value) break
  }
  return value || key
}

export function setLocale(locale) {
  if (locales[locale]) {
    currentLocale = locale
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    // إعادة تحميل الصفحة لتحديث النصوص
    window.dispatchEvent(new Event('localechange'))
  }
}
