import Home from './pages/Home.js'
import About from './pages/About.js'
import ServicesPage from './pages/ServicesPage.js'
import PracticeAreasPage from './pages/PracticeAreasPage.js'
import Lawyers from './pages/Lawyers.js'
import Articles from './pages/Articles.js'
import FAQPage from './pages/FAQPage.js'
import Contact from './pages/Contact.js'
import ConsultationRequest from './pages/ConsultationRequest.js'
import PrivacyPolicy from './pages/PrivacyPolicy.js'
import Terms from './pages/Terms.js'
import NotFound from './pages/NotFound.js'

const routes = {
  '/': Home,
  '/about': About,
  '/services': ServicesPage,
  '/practice-areas': PracticeAreasPage,
  '/lawyers': Lawyers,
  '/articles': Articles,
  '/faq': FAQPage,
  '/contact': Contact,
  '/consultation': ConsultationRequest,
  '/privacy': PrivacyPolicy,
  '/terms': Terms,
}

export default {
  resolve(path) {
    const route = routes[path] || NotFound
    return route
  }
}
