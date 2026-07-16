// ============================================
// CUSTOMERS MODULE (CRUD, Search, Archive, Upload)
// ============================================
(function() {
  'use strict';

  // تأكد من وجود Firebase
  if (typeof firebase === 'undefined' || !firebase.auth) {
    console.error('Firebase not loaded.');
    return;
  }

  const auth = firebase.auth();
  const db = firebase.firestore ? firebase.firestore() : null;
  const storage = firebase.storage ? firebase.storage() : null;

  // عناصر DOM
  const tbody = document.getElementById('customersTableBody');
  const searchInput = document.getElementById('searchInput');
  const filterStatus = document.getElementById('filterStatus');
  const searchBtn = document.getElementById('searchBtn');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const addBtn = document.getElementById('addCustomerBtn');
  const printBtn = document.getElementById('printBtn');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const paginationInfo = document.getElementById('paginationInfo');

  // المودال
  const modal = document.getElementById('customerModal');
  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancel');
  const modalTitle = document.getElementById('modalTitle');
  const customerForm = document.getElementById('customerForm');
  const customerId = document.getElementById('customerId');
  const custName = document.getElementById('custName');
  const custEmail = document.getElementById('custEmail');
  const custPhone = document.getElementById('custPhone');
  const custIdNumber = document.getElementById('custIdNumber');
  const custAddress = document.getElementById('custAddress');
  const custNotes = document.getElementById('custNotes');
  const fileInput = document.getElementById('fileInput');
  const filePreview = document.getElementById('filePreview');
  const modalSubmit = document.getElementById('modalSubmit');
  const modalSubmitText = document.getElementById('modalSubmitText');
  const modalSpinner = document.getElementById('modalSpinner');

  // حالة التطبيق
  let currentPage = 1;
  const pageSize = 10;
  let totalDocs = 0;
  let allCustomers = [];
  let filteredCustomers = [];
  let currentUser = null;

  // ============================================
  // التحقق من المصادقة
  // ============================================
  auth.onAuthStateChanged(function(user) {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    currentUser = user;
    // عرض اسم المستخدم
    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay) {
      nameDisplay.textContent = user.displayName || user.email.split('@')[0];
    }
    loadCustomers();
  });

  // ============================================
  // تحميل العملاء من Firestore
  // ============================================
  function loadCustomers() {
    if (!db) {
      // Mock data إذا لم يتوفر Firestore
      generateMockData();
      return;
    }

    let query = db.collection('clients')
      .where('lawyerId', '==', currentUser.uid)
      .orderBy('createdAt', 'desc');

    // تطبيق الفلتر (حالة النشاط)
    const status = filterStatus.value;
    if (status !== 'all') {
      query = query.where('archived', '==', status === 'archived');
    }

    // تطبيق البحث (نفذه في الذاكرة بعد جلب البيانات)
    // لجعل البحث يعمل على جميع الحقول، نجلب البيانات ثم نفلتر في الذاكرة
    // نستخدم get() بدون limit لتطبيق البحث على الكل، ثم نأخذ الصفحة المطلوبة
    query.get()
      .then(function(snapshot) {
        const customers = [];
        snapshot.forEach(function(doc) {
          const data = doc.data();
          data.id = doc.id;
          customers.push(data);
        });
        allCustomers = customers;
        applySearchAndFilter();
      })
      .catch(function(error) {
        console.error('Error loading customers:', error);
        Swal.fire('خطأ', 'فشل تحميل العملاء: ' + error.message, 'error');
        generateMockData();
      });
  }

  // ============================================
  // تطبيق البحث والفلترة
  // ============================================
  function applySearchAndFilter() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const status = filterStatus.value;

    let filtered = allCustomers;

    // فلترة حسب الحالة
    if (status !== 'all') {
      const archived = status === 'archived';
      filtered = filtered.filter(c => c.archived === archived);
    }

    // بحث في الذاكرة
    if (searchTerm) {
      filtered = filtered.filter(c =>
        (c.fullName && c.fullName.toLowerCase().includes(searchTerm)) ||
        (c.email && c.email.toLowerCase().includes(searchTerm)) ||
        (c.phone && c.phone.includes(searchTerm))
      );
    }

    filteredCustomers = filtered;
    totalDocs = filtered.length;

    // عرض الصفحة الحالية
    renderPage(currentPage);
  }

  // ============================================
  // عرض الصفحة
  // ============================================
  function renderPage(page) {
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, filteredCustomers.length);
    const pageItems = filteredCustomers.slice(start, end);

    tbody.innerHTML = '';
    if (pageItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color: var(--gray-400);">لا يوجد عملاء لعرضهم</td></tr>`;
    } else {
      pageItems.forEach(function(customer, index) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${start + index + 1}</td>
          <td><strong>${customer.fullName || 'غير محدد'}</strong></td>
          <td>${customer.email || '-'}</td>
          <td>${customer.phone || '-'}</td>
          <td>
            <span class="${customer.archived ? 'badge-archived' : 'badge-active'}">
              ${customer.archived ? 'مؤرشف' : 'نشط'}
            </span>
          </td>
          <td>${customer.createdAt ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString('ar-SA') : '-'}</td>
          <td>
            <button class="btn-icon" onclick="window.editCustomer('${customer.id}')" title="تعديل"><i class="fas fa-edit"></i></button>
            <button class="btn-icon" onclick="window.toggleArchiveCustomer('${customer.id}')" title="${customer.archived ? 'إلغاء الأرشفة' : 'أرشفة'}">
              <i class="fas ${customer.archived ? 'fa-undo' : 'fa-archive'}"></i>
            </button>
            <button class="btn-icon danger" onclick="window.deleteCustomer('${customer.id}')" title="حذف"><i class="fas fa-trash"></i></button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    // تحديث معلومات الترقيم
    const totalPages = Math.ceil(totalDocs / pageSize);
    paginationInfo.textContent = `عرض ${start + 1} - ${end} من ${totalDocs} عميل (صفحة ${page} من ${totalPages})`;
    prevPageBtn.disabled = page <= 1;
    nextPageBtn.disabled = page >= totalPages;
  }

  // ============================================
  // إضافة / تعديل عميل (المودال)
  // ============================================
  function openModal(customerData) {
    if (customerData) {
      // تعديل
      modalTitle.textContent = 'تعديل بيانات العميل';
      customerId.value = customerData.id || '';
      custName.value = customerData.fullName || '';
      custEmail.value = customerData.email || '';
      custPhone.value = customerData.phone || '';
      custIdNumber.value = customerData.idNumber || '';
      custAddress.value = customerData.address || '';
      custNotes.value = customerData.notes || '';
      // عرض الملفات المرفقة إذا وجدت
      if (customerData.files && customerData.files.length) {
        filePreview.innerHTML = customerData.files.map(f => `
          <div class="file-item">
            <i class="fas fa-file"></i>
            <span>${f.name}</span>
            <span class="remove-file" onclick="window.removeFile('${customerData.id}', '${f.name}')">&times;</span>
          </div>
        `).join('');
      } else {
        filePreview.innerHTML = '';
      }
      modalSubmitText.textContent = 'تحديث';
    } else {
      // إضافة جديد
      modalTitle.textContent = 'إضافة عميل جديد';
      customerId.value = '';
      customerForm.reset();
      filePreview.innerHTML = '';
      modalSubmitText.textContent = 'حفظ';
    }
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
    customerForm.reset();
    filePreview.innerHTML = '';
    fileInput.value = '';
  }

  // أحداث المودال
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });

  // فتح المودال للإضافة
  addBtn.addEventListener('click', function() {
    openModal(null);
  });

  // جعل editCustomer متاحاً عالمياً
  window.editCustomer = function(id) {
    const customer = allCustomers.find(c => c.id === id);
    if (customer) {
      openModal(customer);
    } else {
      Swal.fire('خطأ', 'لم يتم العثور على العميل', 'error');
    }
  };

  // ============================================
  // حفظ العميل (إضافة أو تعديل)
  // ============================================
  customerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = customerId.value;
    const data = {
      fullName: custName.value.trim(),
      email: custEmail.value.trim(),
      phone: custPhone.value.trim(),
      idNumber: custIdNumber.value.trim(),
      address: custAddress.value.trim(),
      notes: custNotes.value.trim(),
      lawyerId: currentUser.uid,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // التحقق من الحقول المطلوبة
    if (!data.fullName || !data.phone) {
      Swal.fire('تنبيه', 'الاسم ورقم الهاتف مطلوبان', 'warning');
      return;
    }

    // إظهار التحميل
    modalSubmit.disabled = true;
    modalSubmitText.style.display = 'none';
    modalSpinner.style.display = 'inline-block';

    let savePromise;
    if (id) {
      // تحديث
      savePromise = db.collection('clients').doc(id).update(data);
    } else {
      // إضافة
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      data.archived = false;
      data.files = [];
      savePromise = db.collection('clients').add(data);
    }

    savePromise
      .then(function(docRef) {
        // رفع الملفات إن وجدت
        const files = fileInput.files;
        if (files && files.length > 0) {
          const uploadPromises = [];
          const fileNames = [];
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = `clients/${currentUser.uid}/${id || docRef.id}/${Date.now()}_${file.name}`;
            const uploadTask = storage.ref(filePath).put(file);
            const promise = uploadTask.then(function(snapshot) {
              return snapshot.ref.getDownloadURL().then(function(url) {
                return { name: file.name, url: url, path: filePath };
              });
            });
            uploadPromises.push(promise);
          }
          return Promise.all(uploadPromises).then(function(fileData) {
            // تحديث العميل بإضافة روابط الملفات
            const clientId = id || docRef.id;
            return db.collection('clients').doc(clientId).update({
              files: firebase.firestore.FieldValue.arrayUnion(...fileData)
            });
          });
        }
        return Promise.resolve();
      })
      .then(function() {
        Swal.fire('نجاح', id ? 'تم تحديث العميل بنجاح' : 'تم إضافة العميل بنجاح', 'success');
        closeModal();
        loadCustomers(); // إعادة تحميل القائمة
      })
      .catch(function(error) {
        console.error('Error saving customer:', error);
        Swal.fire('خطأ', 'فشل حفظ البيانات: ' + error.message, 'error');
      })
      .finally(function() {
        modalSubmit.disabled = false;
        modalSubmitText.style.display = 'inline';
        modalSpinner.style.display = 'none';
      });
  });

  // ============================================
  // أرشفة / إلغاء أرشفة
  // ============================================
  window.toggleArchiveCustomer = function(id) {
    const customer = allCustomers.find(c => c.id === id);
    if (!customer) return;
    const newArchived = !customer.archived;
    const action = newArchived ? 'أرشفة' : 'إلغاء الأرشفة';
    Swal.fire({
      title: `هل أنت متأكد من ${action} هذا العميل؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#bd9d60',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'نعم',
      cancelButtonText: 'إلغاء'
    }).then(function(result) {
      if (result.isConfirmed) {
        db.collection('clients').doc(id).update({
          archived: newArchived,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(function() {
          Swal.fire('تم', `تم ${action} العميل بنجاح`, 'success');
          loadCustomers();
        }).catch(function(error) {
          Swal.fire('خطأ', 'فشل تحديث الحالة: ' + error.message, 'error');
        });
      }
    });
  };

  // ============================================
  // حذف عميل
  // ============================================
  window.deleteCustomer = function(id) {
    const customer = allCustomers.find(c => c.id === id);
    if (!customer) return;
    Swal.fire({
      title: 'هل أنت متأكد من حذف هذا العميل نهائياً؟',
      text: 'لا يمكن التراجع عن هذا الإجراء!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#bd9d60',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    }).then(function(result) {
      if (result.isConfirmed) {
        // حذف المستندات من التخزين أولاً
        const files = customer.files || [];
        const deletePromises = files.map(function(file) {
          if (file.path) {
            return storage.ref(file.path).delete().catch(function() {});
          }
          return Promise.resolve();
        });
        Promise.all(deletePromises).then(function() {
          return db.collection('clients').doc(id).delete();
        }).then(function() {
          Swal.fire('تم الحذف', 'تم حذف العميل وجميع ملفاته', 'success');
          loadCustomers();
        }).catch(function(error) {
          Swal.fire('خطأ', 'فشل حذف العميل: ' + error.message, 'error');
        });
      }
    });
  };

  // ============================================
  // إزالة ملف مرفق (من التخزين ومن Firestore)
  // ============================================
  window.removeFile = function(clientId, fileName) {
    const customer = allCustomers.find(c => c.id === clientId);
    if (!customer) return;
    const fileToRemove = customer.files.find(f => f.name === fileName);
    if (!fileToRemove) return;
    Swal.fire({
      title: 'حذف الملف',
      text: `هل أنت متأكد من حذف "${fileName}"؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#bd9d60',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    }).then(function(result) {
      if (result.isConfirmed) {
        // حذف من Storage
        const deletePromise = fileToRemove.path ? storage.ref(fileToRemove.path).delete() : Promise.resolve();
        deletePromise.then(function() {
          // إزالة من مصفوفة files في Firestore
          return db.collection('clients').doc(clientId).update({
            files: firebase.firestore.FieldValue.arrayRemove(fileToRemove)
          });
        }).then(function() {
          Swal.fire('تم', 'تم حذف الملف بنجاح', 'success');
          loadCustomers();
        }).catch(function(error) {
          Swal.fire('خطأ', 'فشل حذف الملف: ' + error.message, 'error');
        });
      }
    });
  };

  // ============================================
  // معاينة الملفات عند اختيارها
  // ============================================
  fileInput.addEventListener('change', function() {
    const files = this.files;
    filePreview.innerHTML = '';
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
          <i class="fas fa-file"></i>
          <span>${files[i].name}</span>
          <span class="remove-file" onclick="this.parentElement.remove(); document.getElementById('fileInput').value = '';">&times;</span>
        `;
        filePreview.appendChild(div);
      }
    }
  });

  // ============================================
  // البحث والفلترة
  // ============================================
  searchBtn.addEventListener('click', function() {
    currentPage = 1;
    applySearchAndFilter();
  });
  clearSearchBtn.addEventListener('click', function() {
    searchInput.value = '';
    filterStatus.value = 'all';
    currentPage = 1;
    applySearchAndFilter();
  });
  searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
  filterStatus.addEventListener('change', function() {
    currentPage = 1;
    applySearchAndFilter();
  });

  // ============================================
  // الترقيم (Pagination)
  // ============================================
  prevPageBtn.addEventListener('click', function() {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
    }
  });
  nextPageBtn.addEventListener('click', function() {
    const totalPages = Math.ceil(totalDocs / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      renderPage(currentPage);
    }
  });

  // ============================================
  // طباعة الجدول
  // ============================================
  printBtn.addEventListener('click', function() {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html><head><title>قائمة العملاء</title>
      <style>
        body { font-family: 'Cairo', sans-serif; padding: 2rem; direction: rtl; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: right; }
        th { background: #f0f0f0; }
        h2 { color: #393536; }
      </style>
      </head><body>
      <h2>قائمة العملاء</h2>
      <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-SA')}</p>
      <table>
        <thead><tr><th>#</th><th>الاسم</th><th>البريد</th><th>الهاتف</th><th>الحالة</th></tr></thead>
        <tbody>
    `);
    filteredCustomers.forEach((c, i) => {
      printWindow.document.write(`
        <tr>
          <td>${i+1}</td>
          <td>${c.fullName || ''}</td>
          <td>${c.email || ''}</td>
          <td>${c.phone || ''}</td>
          <td>${c.archived ? 'مؤرشف' : 'نشط'}</td>
        </tr>
      `);
    });
    printWindow.document.write(`</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.print();
  });

  // ============================================
  // بيانات وهمية (للاختبار بدون Firebase)
  // ============================================
  function generateMockData() {
    allCustomers = [
      { id: '1', fullName: 'أحمد محمد', email: 'ahmed@example.com', phone: '0501234567', archived: false, createdAt: { seconds: Date.now()/1000 - 86400 } },
      { id: '2', fullName: 'سارة خالد', email: 'sara@example.com', phone: '0559876543', archived: false, createdAt: { seconds: Date.now()/1000 - 172800 } },
      { id: '3', fullName: 'محمد العتيبي', email: 'mohammed@example.com', phone: '0561112233', archived: true, createdAt: { seconds: Date.now()/1000 - 259200 } },
    ];
    applySearchAndFilter();
  }

})();
