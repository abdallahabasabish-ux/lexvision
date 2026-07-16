import { t } from '../../i18n.js'

export default function Footer() {
  return `
    <footer class="bg-primary text-white py-12">
      <div class="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 class="text-secondary text-xl font-bold mb-4">مكتب المحاماة</h4>
          <p class="text-white/70 text-sm">${t('footer.description')}</p>
        </div>
        <div>
          <h5 class="font-bold mb-4">${t('footer.quickLinks')}</h5>
          <ul class="space-y-2 text-white/70 text-sm">
            <li><a href="/about" class="hover:text-secondary transition">${t('nav.about')}</a></li>
            <li><a href="/services" class="hover:text-secondary transition">${t('nav.services')}</a></li>
            <li><a href="/contact" class="hover:text-secondary transition">${t('nav.contact')}</a></li>
          </ul>
        </div>
        <div>
          <h5 class="font-bold mb-4">${t('footer.contact')}</h5>
          <ul class="space-y-2 text-white/70 text-sm">
            <li><i class="fas fa-phone ml-2"></i>+966 12 345 6789</li>
            <li><i class="fas fa-envelope ml-2"></i>info@lawoffice.com</li>
            <li><i class="fas fa-location-dot ml-2"></i>الرياض، المملكة العربية السعودية</li>
          </ul>
        </div>
        <div>
          <h5 class="font-bold mb-4">${t('footer.social')}</h5>
          <div class="flex gap-4 text-2xl">
            <a href="#" class="hover:text-secondary transition"><i class="fab fa-twitter"></i></a>
            <a href="#" class="hover:text-secondary transition"><i class="fab fa-linkedin"></i></a>
            <a href="#" class="hover:text-secondary transition"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
      <div class="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
        © ${new Date().getFullYear()} ${t('footer.copyright')}
      </div>
    </footer>
  `
}
