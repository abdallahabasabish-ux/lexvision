// ============================================
// DASHBOARD MODULE
// ============================================
(function() {
  'use strict';

  // Check if Firebase is ready
  if (typeof firebase === 'undefined' || !firebase.auth) {
    console.error('Firebase not loaded.');
    return;
  }

  const auth = firebase.auth();
  const db = firebase.firestore ? firebase.firestore() : null;

  // Guard: redirect if not logged in
  auth.onAuthStateChanged(function(user) {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    // Display user name if available
    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay && user.displayName) {
      nameDisplay.textContent = 'مرحباً، ' + user.displayName;
    } else if (nameDisplay && user.email) {
      nameDisplay.textContent = 'مرحباً، ' + user.email.split('@')[0];
    }
    // Load dashboard data
    loadDashboardData(user);
  });

  // ============================================
  // LOAD DATA FROM FIRESTORE
  // ============================================
  function loadDashboardData(user) {
    if (!db) {
      console.warn('Firestore not available. Using mock data.');
      populateMockData();
      return;
    }

    // Fetch counts
    const promises = [];

    // Total Cases
    promises.push(
      db.collection('cases').where('lawyerId', '==', user.uid).get()
        .then(snap => snap.size)
        .catch(() => 0)
    );

    // Total Clients
    promises.push(
      db.collection('clients').where('lawyerId', '==', user.uid).get()
        .then(snap => snap.size)
        .catch(() => 0)
    );

    // Upcoming Sessions (today and future)
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    promises.push(
      db.collection('sessions')
        .where('lawyerId', '==', user.uid)
        .where('date', '>=', todayStr)
        .get()
        .then(snap => snap.size)
        .catch(() => 0)
    );

    // Pending Tasks
    promises.push(
      db.collection('tasks')
        .where('lawyerId', '==', user.uid)
        .where('status', '==', 'pending')
        .get()
        .then(snap => snap.size)
        .catch(() => 0)
    );

    Promise.all(promises)
      .then(function(results) {
        document.getElementById('totalCases').textContent = results[0];
        document.getElementById('totalClients').textContent = results[1];
        document.getElementById('upcomingSessions').textContent = results[2];
        document.getElementById('pendingTasks').textContent = results[3];
      })
      .catch(function(err) {
        console.error('Error loading stats:', err);
        populateMockData();
      });

    // Load charts data
    loadCharts(user);
  }

  // ============================================
  // CHARTS
  // ============================================
  function loadCharts(user) {
    if (!db) {
      renderMockCharts();
      return;
    }

    // Cases by type
    db.collection('cases')
      .where('lawyerId', '==', user.uid)
      .get()
      .then(function(snapshot) {
        const types = {};
        snapshot.forEach(function(doc) {
          const data = doc.data();
          const type = data.type || 'أخرى';
          types[type] = (types[type] || 0) + 1;
        });
        const labels = Object.keys(types);
        const values = Object.values(types);
        renderCasesChart(labels, values);
      })
      .catch(function() {
        renderMockCharts();
      });

    // Monthly revenue (mock for now, will be replaced with real data)
    renderRevenueChart([12000, 18000, 15000, 22000, 19000, 25000]);
  }

  // ============================================
  // RENDER CHARTS
  // ============================================
  function renderCasesChart(labels, data) {
    const ctx = document.getElementById('casesChart')?.getContext('2d');
    if (!ctx) return;
    if (window._casesChart) window._casesChart.destroy();
    window._casesChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#3b82f6', '#16A34A', '#F59E0B', '#DC2626', '#8b5cf6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  function renderRevenueChart(data) {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;
    if (window._revenueChart) window._revenueChart.destroy();
    window._revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        datasets: [{
          label: 'الإيرادات (ريال)',
          data: data,
          backgroundColor: 'rgba(189,157,96,0.6)',
          borderColor: '#bd9d60',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // ============================================
  // MOCK DATA (for testing without Firebase)
  // ============================================
  function populateMockData() {
    document.getElementById('totalCases').textContent = '42';
    document.getElementById('totalClients').textContent = '38';
    document.getElementById('upcomingSessions').textContent = '7';
    document.getElementById('pendingTasks').textContent = '12';
  }

  function renderMockCharts() {
    renderCasesChart(['تجاري', 'جنائي', 'أسرة', 'عمل'], [12, 8, 10, 6]);
    renderRevenueChart([10000, 15000, 12000, 20000, 18000, 22000]);
  }

})();
