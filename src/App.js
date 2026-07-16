import router from './router.js'
import Header from './components/layout/Header.js'
import Footer from './components/layout/Footer.js'

export default class App {
  constructor() {
    this.container = null
    this.currentPage = null
  }

  mount(selector) {
    this.container = document.querySelector(selector)
    if (!this.container) return

    // عرض التطبيق
    this.render()
    // مراقبة تغيير المسار
    window.addEventListener('popstate', () => this.render())
  }

  async render() {
    const path = window.location.pathname || '/'
    const PageComponent = router.resolve(path)

    // إنشاء الصفحة
    this.currentPage = new PageComponent()

    // بناء الهيكل
    this.container.innerHTML = `
      <div class="flex flex-col min-h-screen">
        <header id="app-header"></header>
        <main id="app-main" class="flex-1"></main>
        <footer id="app-footer"></footer>
      </div>
    `

    // تحميل الهيدر والفوتر (مرة واحدة)
    this.loadHeaderFooter()

    // تحميل محتوى الصفحة
    const mainEl = document.getElementById('app-main')
    mainEl.innerHTML = await this.currentPage.render()
    this.currentPage.afterRender?.()
  }

  loadHeaderFooter() {
    const headerEl = document.getElementById('app-header')
    const footerEl = document.getElementById('app-footer')
    if (headerEl) headerEl.innerHTML = Header()
    if (footerEl) footerEl.innerHTML = Footer()
  }
}
