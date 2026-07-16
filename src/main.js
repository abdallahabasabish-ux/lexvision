import 'https://abdallahabasabish-ux.github.io/lexvision/assets/css/main.css'   // <-- تم تصحيح المسار
import App from './App.js'
import { initI18n } from './i18n.js'

// تهيئة اللغة
initI18n('ar')

// تشغيل التطبيق
const app = new App()
app.mount('#app')
