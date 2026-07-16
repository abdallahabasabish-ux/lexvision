import Hero from '../components/home/Hero.js'
import Services from '../components/home/Services.js'
import PracticeAreas from '../components/home/PracticeAreas.js'
import Stats from '../components/home/Stats.js'
import WhyUs from '../components/home/WhyUs.js'
import Steps from '../components/home/Steps.js'
import Team from '../components/home/Team.js'
import Articles from '../components/home/Articles.js'
import Testimonials from '../components/home/Testimonials.js'
import FAQ from '../components/home/FAQ.js'
import Consultation from '../components/home/Consultation.js'

export default class Home {
  render() {
    return `
      ${Hero()}
      ${Services()}
      ${PracticeAreas()}
      ${Stats()}
      ${WhyUs()}
      ${Steps()}
      ${Team()}
      ${Articles()}
      ${Testimonials()}
      ${FAQ()}
      ${Consultation()}
    `
  }

  afterRender() {
    // تهيئة AOS
    import('aos').then(AOS => {
      AOS.init({
        duration: 800,
        once: true,
        offset: 80
      })
    })

    // تحميل أي مكتبات إضافية
    // Chart.js, FullCalendar يمكن تهيئتها هنا إذا لزم الأمر
  }
}
