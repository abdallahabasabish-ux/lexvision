// ============================================
// AUTH MODULE
// ============================================
(function() {
  'use strict';

  // Check if Firebase is loaded
  if (typeof firebase === 'undefined' || !firebase.auth) {
    console.error('Firebase Auth is not loaded.');
    return;
  }

  const auth = firebase.auth();
  const db = firebase.firestore ? firebase.firestore() : null;

  // DOM elements for login
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginText = document.getElementById('loginText');
  const loginSpinner = document.getElementById('loginSpinner');

  // DOM elements for register
  const registerForm = document.getElementById('registerForm');
  const registerBtn = document.getElementById('registerBtn');
  const registerText = document.getElementById('registerText');
  const registerSpinner = document.getElementById('registerSpinner');

  // DOM elements for forgot password
  const forgotForm = document.getElementById('forgotForm');
  const resetBtn = document.getElementById('resetBtn');
  const resetText = document.getElementById('resetText');
  const resetSpinner = document.getElementById('resetSpinner');

  // Toast
  const toastEl = document.getElementById('toast');

  // ============================================
  // Helper: Show Toast
  // ============================================
  function showToast(message, type = 'info') {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = 'toast show ' + type;
    clearTimeout(toastEl._timeout);
    toastEl._timeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 5000);
  }

  // ============================================
  // Helper: Set Button Loading State
  // ============================================
  function setLoading(btn, textEl, spinnerEl, isLoading) {
    if (isLoading) {
      btn.disabled = true;
      textEl.style.display = 'none';
      spinnerEl.style.display = 'inline-block';
    } else {
      btn.disabled = false;
      textEl.style.display = 'inline';
      spinnerEl.style.display = 'none';
    }
  }

  // ============================================
  // LOGIN
  // ============================================
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe').checked;
      const emailError = document.getElementById('emailError');
      const passwordError = document.getElementById('passwordError');

      // Reset errors
      emailError.classList.remove('show');
      passwordError.classList.remove('show');
      document.getElementById('email').classList.remove('error');
      document.getElementById('password').classList.remove('error');

      // Validation
      let valid = true;
      if (!email || !email.includes('@')) {
        emailError.classList.add('show');
        document.getElementById('email').classList.add('error');
        valid = false;
      }
      if (!password || password.length < 6) {
        passwordError.classList.add('show');
        document.getElementById('password').classList.add('error');
        valid = false;
      }
      if (!valid) return;

      setLoading(loginBtn, loginText, loginSpinner, true);

      auth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
          const user = userCredential.user;
          if (rememberMe) {
            // Persist session (Firebase handles this via persistence)
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
          } else {
            auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
          }
          showToast('مرحباً بك، تم تسجيل الدخول بنجاح!', 'success');
          // Redirect to dashboard
          setTimeout(function() {
            window.location.href = 'dashboard.html';
          }, 800);
        })
        .catch(function(error) {
          let msg = 'فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.';
          if (error.code === 'auth/user-not-found') {
            msg = 'لم يتم العثور على مستخدم بهذا البريد.';
          } else if (error.code === 'auth/wrong-password') {
            msg = 'كلمة المرور غير صحيحة.';
          } else if (error.code === 'auth/too-many-requests') {
            msg = 'تم تعطيل الحساب مؤقتاً بسبب محاولات كثيرة. حاول لاحقاً.';
          }
          showToast(msg, 'error');
          setLoading(loginBtn, loginText, loginSpinner, false);
        });
    });
  }

  // ============================================
  // REGISTER
  // ============================================
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const role = document.getElementById('regRole').value;
      const nameError = document.getElementById('nameError');
      const emailError = document.getElementById('regEmailError');
      const passwordError = document.getElementById('regPasswordError');

      // Reset errors
      nameError.classList.remove('show');
      emailError.classList.remove('show');
      passwordError.classList.remove('show');

      let valid = true;
      if (!fullName) {
        nameError.classList.add('show');
        valid = false;
      }
      if (!email || !email.includes('@')) {
        emailError.classList.add('show');
        valid = false;
      }
      if (!password || password.length < 6) {
        passwordError.classList.add('show');
        valid = false;
      }
      if (!valid) return;

      setLoading(registerBtn, registerText, registerSpinner, true);

      auth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
          const user = userCredential.user;
          // Save user data to Firestore
          if (db) {
            return db.collection('users').doc(user.uid).set({
              uid: user.uid,
              fullName: fullName,
              email: email,
              role: role,
              status: 'pending', // pending approval from owner
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(function() {
              // Send email verification
              return user.sendEmailVerification();
            }).then(function() {
              showToast('تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني.', 'success');
              setTimeout(function() {
                window.location.href = 'login.html';
              }, 2000);
            });
          } else {
            showToast('تم إنشاء الحساب ولكن لم يتم حفظ البيانات (Firestore غير متاح).', 'warning');
            setTimeout(function() {
              window.location.href = 'login.html';
            }, 2000);
          }
        })
        .catch(function(error) {
          let msg = 'فشل إنشاء الحساب.';
          if (error.code === 'auth/email-already-in-use') {
            msg = 'هذا البريد الإلكتروني مستخدم بالفعل.';
          } else if (error.code === 'auth/weak-password') {
            msg = 'كلمة المرور ضعيفة جداً.';
          }
          showToast(msg, 'error');
          setLoading(registerBtn, registerText, registerSpinner, false);
        });
    });
  }

  // ============================================
  // FORGOT PASSWORD
  // ============================================
  if (forgotForm) {
    forgotForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = document.getElementById('resetEmail').value.trim();
      const errorEl = document.getElementById('resetEmailError');

      if (!email || !email.includes('@')) {
        errorEl.style.display = 'block';
        return;
      }
      errorEl.style.display = 'none';

      setLoading(resetBtn, resetText, resetSpinner, true);

      auth.sendPasswordResetEmail(email)
        .then(function() {
          showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.', 'success');
          setLoading(resetBtn, resetText, resetSpinner, false);
          setTimeout(function() {
            window.location.href = 'login.html';
          }, 3000);
        })
        .catch(function(error) {
          let msg = 'فشل إرسال رابط الاستعادة. تأكد من البريد الإلكتروني.';
          if (error.code === 'auth/user-not-found') {
            msg = 'لا يوجد مستخدم بهذا البريد الإلكتروني.';
          }
          showToast(msg, 'error');
          setLoading(resetBtn, resetText, resetSpinner, false);
        });
    });
  }

  // ============================================
  // AUTO-REDIRECT IF ALREADY LOGGED IN
  // ============================================
  // Check if current page is login/register/forgot and user is logged in
  const currentPage = window.location.pathname.split('/').pop();
  const publicPages = ['login.html', 'register.html', 'forgot-password.html'];
  if (publicPages.includes(currentPage)) {
    auth.onAuthStateChanged(function(user) {
      if (user) {
        // Already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
      }
    });
  }

  // ============================================
  // PROTECT DASHBOARD PAGES (will be used by dashboard.js)
  // ============================================
  window.authGuard = function() {
    return new Promise(function(resolve, reject) {
      auth.onAuthStateChanged(function(user) {
        if (user) {
          resolve(user);
        } else {
          reject('غير مسجل الدخول');
        }
      });
    });
  };

  // ============================================
  // LOGOUT FUNCTION (available globally)
  // ============================================
  window.logout = function() {
    auth.signOut().then(function() {
      showToast('تم تسجيل الخروج بنجاح.', 'success');
      setTimeout(function() {
        window.location.href = 'login.html';
      }, 500);
    }).catch(function(error) {
      showToast('حدث خطأ أثناء تسجيل الخروج.', 'error');
    });
  };

  // Expose auth object
  window.firebaseAuth = auth;

})();
