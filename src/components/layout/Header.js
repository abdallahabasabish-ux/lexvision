import { t } from '../../i18n.js'

export default function Header() {
  const navItems = [
    { label: 'nav.home', href: '/' },
    { label: 'nav.about', href: '/about' },
    { label: 'nav.services', href: '/services' },
    { label: 'nav.practiceAreas', href: '/practice-areas' },
    { label: 'nav.lawyers', href: '/lawyers' },
    { label: 'nav.articles', href: '/articles' },
    { label: 'nav.faq', href: '/faq' },
    { label: 'nav.contact', href: '/contact' }
  ]

  return `
    <nav class="fixed top-0 left-0 right-0 z-50 glass shadow-sm border-b border-white/20">
      <div class="container mx-auto px-4 flex items-center justify-between h-20">
        <div class="flex items-center gap-2">
          <img src="/public/assets/logo.svg" alt="Logo" class="h-12" />
          <span class="font-bold text-xl text-primary">مكتب المحاماة</span>
        </div>

        <ul class="hidden lg:flex items-center gap-8 font-medium">
          ${navItems.map(item => `
            <li><a href="${item.href}" class="hover:text-secondary transition-colors">${t(item.label)}</a></li>
          `).join('')}
        </ul>

        <div class="flex items-center gap-4">
          <button class="text-primary hover:text-secondary transition-colors" aria-label="بحث">
            <i class="fas fa-search"></i>
          </button>
          <button class="text-primary hover:text-secondary transition-colors" aria-label="تبديل اللغة">
            <i class="fas fa-globe"></i>
          </button>
          <button class="lg:hidden text-primary" id="menuToggle">
            <i class="fas fa-bars text-2xl"></i>
          </button>
        </div>
      </div>
    </nav>
  `
}
