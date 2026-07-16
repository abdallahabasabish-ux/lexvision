import { auth } from '../config/firebase.js'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'

export const authService = {
  login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  },
  register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  },
  logout() {
    return signOut(auth)
  }
}
