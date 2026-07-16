// ============================================
// AUTH MODULE - الإصدار المحسن
// ============================================
(function() {
  'use strict';

  // التحقق من تحميل Firebase
  if (typeof firebase === 'undefined' || !firebase.auth) {
    console.error('❌ Firebase Auth is not loaded.');
    return;
  }

  // استخدام المتغيرات العمومية (مهيأة مسبقاً)
  const auth = firebase.auth();
  const db = firebase.firestore ? firebase.firestore() : null;

  // ============================================
  // عناصر DOM المشتركة
  // ============================================
  const toastEl = document.getElementById('toast');

  // ============================================
  // Helper: عرض إشعار (Toast)
  // ============================================
  function showToast(message, type = 'info') {
    if (!toastEl) {
      console.warn('⚠️ Toast element not found.');
      return;
    }
    toastEl.textContent = message;
    toastEl.className = 'toast show ' + type;
    clearTimeout(toastEl._timeout);
    toastEl._timeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 5000);
  }

  // ============================================
  // Helper: حالة تحميل الزر
  // ============================================
  function setLoading(btn, textEl, spinnerEl, isLoading) {
    if (!btn || !textEl || !spinnerEl) return;
    btn.disabled = isLoading;
    textEl.style.display = isLoading ? 'none' : 'inline';
    spinnerEl.style.display = isLoading ? 'inline-block' : 'none';
  }

  // ============================================
  // HELPER: جلب بيانات المستخدم من Firestore
  // ============================================
  async function fetchUserProfile(uid) {
    if (!db) return null;
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) {
        return doc.data();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    return null;
  }

  // ============================================
  // HELPER: تحديث اسم المستخدم في الواجهة
  // ============================================
  function updateUserDisplay(user) {
    const nameDisplay = document.getElementById('userNameDisplay');
    if (!nameDisplay) return;
    if (user) {
      // محاولة جلب الاسم من Firestore أولاً
      if (db) {
        db.collection('users').doc(user.uid).get()
          .then(doc => {
            if (doc.exists) {
              const data = doc.data();
              nameDisplay.textContent = 'مرحباً، ' + (data.fullName || user.displayName || user.email.split('@')[0]);
            } else {
              nameDisplay.textContent = 'مرحباً، ' + (user.displayName || user.email.split('@')[0]);
            }
          })
          .catch(() => {
            nameDisplay.textContent = 'مرحباً، ' + (user.displayName || user.email.split('@')[0]);
          });
      } else {
        nameDisplay.textContent = 'مرحباً، ' + (user.displayName || user.email.split('@')[0]);
      }
    } else {
      nameDisplay.textContent = 'مرحباً، زائر';
    }
  }

  // ============================================
  // LOGIN
  // ============================================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');

    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe').checked;
      const emailError = document.getElementById('emailError');
      const passwordError = document.getElementById('passwordError');

      // إعادة تعيين الأخطاء
      emailError?.classList.remove('show');
      passwordError?.classList.remove('show');
      document.getElementById('email')?.classList.remove('error');
      document.getElementById('password')?.classList.remove('error');

      // التحقق من صحة الإدخال
      let valid = true;
      if (!email || !email.includes('@')) {
        if (emailError) emailError.classList.add('show');
        document.getElementById('email')?.classList.add('error');
        valid = false;
      }
      if (!password || password.length < 6) {
        if (passwordError) passwordError.classList.add('show');
        document.getElementById('password')?.classList.add('error');
        valid = false;
      }
      if (!valid) return;

      setLoading(loginBtn, loginText, loginSpinner, true);

      // تعيين وضع الاستمرارية أولاً (قبل تسجيل الدخول)
      const persistence = rememberMe 
        ? firebase.auth.Auth.Persistence.LOCAL 
        : firebase.auth.Auth.Persistence.SESSION;
      
      auth.setPersistence(persistence)
        .then(() => {
          return auth.signInWithEmailAndPassword(email, password);
        })
        .then((userCredential) => {
          const user = userCredential.user;
          showToast('مرحباً بك، تم تسجيل الدخول بنجاح!', 'success');
          // تحديث اسم المستخدم في الواجهة (سيتم بعد التوجيه)
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);
        })
        .catch((error) => {
          let msg = 'فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.';
          switch (error.code) {
            case 'auth/user-not-found':
              msg = 'لم يتم العثور على مستخدم بهذا البريد.';
              break;
            case 'auth/wrong-password':
              msg = 'كلمة المرور غير صحيحة.';
              break;
            case 'auth/too-many-requests':
              msg = 'تم تعطيل الحساب مؤقتاً بسبب محاولات كثيرة. حاول لاحقاً.';
              break;
            case 'auth/invalid-email':
              msg = 'البريد الإلكتروني غير صحيح.';
              break;
          }
          showToast(msg, 'error');
          setLoading(loginBtn, loginText, loginSpinner, false);
        });
    });
  }

  // ============================================
  // REGISTER
  // ============================================
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const registerBtn = document.getElementById('registerBtn');
    const registerText = document.getElementById('registerText');
    const registerSpinner = document.getElementById('registerSpinner');

    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const role = document.getElementById('regRole').value;
      const nameError = document.getElementById('nameError');
      const emailError = document.getElementById('regEmailError');
      const passwordError = document.getElementById('regPasswordError');

      // إعادة تعيين الأخطاء
      nameError?.classList.remove('show');
      emailError?.classList.remove('show');
      passwordError?.classList.remove('show');

      let valid = true;
      if (!fullName) {
        if (nameError) nameError.classList.add('show');
        valid = false;
      }
      if (!email || !email.includes('@')) {
        if (emailError) emailError.classList.add('show');
        valid = false;
      }
      if (!password || password.length < 6) {
        if (passwordError) passwordError.classList.add('show');
        valid = false;
      }
      if (!valid) return;

      setLoading(registerBtn, registerText, registerSpinner, true);

      auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          // تحديث اسم العرض في Authentication
          return user.updateProfile({ displayName: fullName })
            .then(() => {
              // حفظ البيانات في Firestore
              if (db) {
                return db.collection('users').doc(user.uid).set({
                  uid: user.uid,
                  fullName: fullName,
                  email: email,
                  role: role,
                  status: 'pending', // بانتظار الموافقة من المالك
                  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
              }
              return Promise.resolve();
            })
            .then(() => {
              // إرسال بريد تأكيد
              return user.sendEmailVerification();
            })
            .then(() => {
              showToast('تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني.', 'success');
              setLoading(registerBtn, registerText, registerSpinner, false);
              setTimeout(() => {
                window.location.href = 'login.html';
              }, 2000);
            });
        })
        .catch((error) => {
          let msg = 'فشل إنشاء الحساب.';
          switch (error.code) {
            case 'auth/email-already-in-use':
              msg = 'هذا البريد الإلكتروني مستخدم بالفعل.';
              break;
            case 'auth/weak-password':
              msg = 'كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل).';
              break;
            case 'auth/invalid-email':
              msg = 'البريد الإلكتروني غير صحيح.';
              break;
          }
          showToast(msg, 'error');
          setLoading(registerBtn, registerText, registerSpinner, false);
        });
    });
  }

  // ============================================
  // FORGOT PASSWORD
  // ============================================
  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    const resetBtn = document.getElementById('resetBtn');
    const resetText = document.getElementById('resetText');
    const resetSpinner = document.getElementById('resetSpinner');

    forgotForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = document.getElementById('resetEmail').value.trim();
      const errorEl = document.getElementById('resetEmailError');

      if (!email || !email.includes('@')) {
        if (errorEl) errorEl.style.display = 'block';
        return;
      }
      if (errorEl) errorEl.style.display = 'none';

      setLoading(resetBtn, resetText, resetSpinner, true);

      auth.sendPasswordResetEmail(email)
        .then(() => {
          showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.', 'success');
          setLoading(resetBtn, resetText, resetSpinner, false);
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 3000);
        })
        .catch((error) => {
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
  // مراقبة حالة المصادقة (مركزية)
  // ============================================
  let currentUser = null;

  auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
      // تحديث اسم المستخدم في جميع الصفحات
      updateUserDisplay(user);
    } else {
      // المستخدم غير مسجل
      const nameDisplay = document.getElementById('userNameDisplay');
      if (nameDisplay) nameDisplay.textContent = '';
    }
  });

  // ============================================
  // إعادة توجيه تلقائي للصفحات العامة
  // ============================================
  const currentPage = window.location.pathname.split('/').pop();
  const publicPages = ['login.html', 'register.html', 'forgot-password.html'];
  if (publicPages.includes(currentPage)) {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // مستخدم مسجل الدخول، نعيد توجيهه إلى لوحة التحكم
        window.location.href = 'dashboard.html';
      }
    });
  }

  // ============================================
  // دوال عمومية للاستخدام في الصفحات الأخرى
  // ============================================

  // التحقق من المصادقة (Guard)
  window.authGuard = function() {
    return new Promise((resolve, reject) => {
      if (currentUser) {
        resolve(currentUser);
      } else {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          if (user) {
            resolve(user);
          } else {
            reject('غير مسجل الدخول');
          }
        });
      }
    });
  };

  // تسجيل الخروج
  window.logout = function() {
    auth.signOut()
      .then(() => {
        showToast('تم تسجيل الخروج بنجاح.', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 500);
      })
      .catch((error) => {
        console.error('Logout error:', error);
        showToast('حدث خطأ أثناء تسجيل الخروج.', 'error');
      });
  };

  // جلب المستخدم الحالي
  window.getCurrentUser = function() {
    return currentUser;
  };

  // جلب بيانات المستخدم من Firestore
  window.getUserProfile = function(uid) {
    return fetchUserProfile(uid);
  };

  // تصدير المتغيرات للاستخدام العام
  window.firebaseAuth = auth;
  window.firebaseDb = db;

  console.log('✅ Auth module initialized successfully.');
})();
