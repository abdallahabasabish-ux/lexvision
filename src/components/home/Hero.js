import { t } from '../../i18n.js'

export default function Hero() {
  return `
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/95 to-primary/80 text-white">
      <!-- خلفية متحركة -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-[url('/public/assets/hero-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-primary to-transparent"></div>
      </div>

      <div class="container relative z-10 mx-auto px-4 py-20 text-center" data-aos="fade-up">
        <div class="inline-block mb-6 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <i class="fas fa-scale-balanced text-4xl text-secondary"></i>
        </div>
        <h1 class="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          ${t('hero.title')}
        </h1>
        <p class="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8">
          ${t('hero.subtitle')}
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="/consultation" class="px-8 py-4 bg-secondary hover:bg-secondary-light text-primary font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
            ${t('hero.ctaConsult')}
          </a>
          <a href="/contact" class="px-8 py-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold rounded-xl transition-all border border-white/30 hover:border-white/50">
            ${t('hero.ctaContact')}
          </a>
        </div>
      </div>

      <!-- أمواج زخرفية -->
      <div class="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" class="w-full h-20">
          <path d="M0,0 C300,100 600,0 900,60 L1200,0 L1200,120 L0,120 Z" fill="#ffffff" opacity="0.9"></path>
        </svg>
      </div>
    </section>
  `
}
