import { t } from '../../i18n.js'

export default function Services() {
  const services = [
    { icon: 'fa-building', key: 'corporate' },
    { icon: 'fa-gavel', key: 'criminal' },
    { icon: 'fa-people-group', key: 'family' },
    { icon: 'fa-briefcase', key: 'labor' }
  ]

  return `
    <section class="py-20 bg-white" data-aos="fade-up">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <span class="text-secondary font-bold text-sm uppercase tracking-wider">${t('services.subtitle')}</span>
          <h2 class="text-3xl md:text-5xl font-bold mt-2">${t('services.title')}</h2>
          <div class="w-24 h-1 bg-secondary mx-auto mt-4 rounded-full"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          ${services.map((s, i) => `
            <div class="group p-8 rounded-xl bg-white shadow-soft hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-secondary/30 text-center" data-aos="fade-up" data-aos-delay="${i*100}">
              <div class="w-20 h-20 mx-auto bg-secondary/10 rounded-full flex items-center justify-center text-secondary text-3xl group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                <i class="fas ${s.icon}"></i>
              </div>
              <h3 class="text-xl font-bold mt-4">${t(`services.items.${s.key}`)}</h3>
              <p class="text-gray-500 mt-2 text-sm">${t(`services.descriptions.${s.key}`)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `
}
