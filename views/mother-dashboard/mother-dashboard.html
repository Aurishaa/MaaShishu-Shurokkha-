<!-- === File: views/mother-dashboard/mother-dashboard.html (FINAL, WORKING VERSION) === -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mother Dashboard - MaaShishu Shurokkha</title>
    <link rel="stylesheet" href="../../css/main.css">
    <link rel="stylesheet" href="../../css/mother-dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
</head>
<body>
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-header"><a href="#"><img src="../../logo.png" alt="Logo"><h3>MaaShishu Shurokkha</h3></a></div>
            <nav class="sidebar-nav">
                <ul>
                    <li class="active"><a href="#"><i class="fa-solid fa-house fa-fw"></i> Dashboard Home</a></li>
                    <li><a href="../profile-management/profile-management.html"><i class="fa-solid fa-user-pen fa-fw"></i> Profile Management</a></li>
                    <li><a href="../vaccination-tracking/vaccination-tracking.html"><i class="fa-solid fa-syringe fa-fw"></i> Vaccination Tracking</a></li>
                    <li><a href="../appointment-scheduling/appointment-scheduling.html"><i class="fa-solid fa-calendar-check fa-fw"></i> Appointments</a></li>
                    <li><a href="../provider-locator/provider-locator.html"><i class="fa-solid fa-location-dot fa-fw"></i> Find a Provider</a></li>
                    <li><a href="../community-support/community-support.html"><i class="fa-solid fa-people-group fa-fw"></i> Community Support</a></li>
                    <li class="logout-link"><a id="logoutButton" href="#"><i class="fa-solid fa-right-from-bracket fa-fw"></i> Logout</a></li>
                </ul>
            </nav>
            <div class="profile-switcher">
                <a href="#" class="profile-item"><div class="avatar avatar-mother">MN</div><span>My Profile</span></a>
                <a href="../child-dashboard/child-dashboard.html" class="profile-item"><div class="avatar avatar-child">CN</div><span>Child's Dashboard</span></a>
            </div>
        </aside>
        <main class="main-content">
            <header class="main-content-header">
                <!-- This h1 tag has the ID that our JavaScript will target -->
                <h1 id="welcomeMessage">Loading...</h1>
                <p>This is your central hub for managing your and your children's health.</p>
            </header>
            <div class="dashboard-grid">
                <div class="dashboard-card content-card">
                    <div class="card-header"><div class="icon"><i class="fa-solid fa-user"></i></div><h3>Profile Management</h3></div>
                    <div class="card-body"><p>Keep your family's health profiles up-to-date.</p><a href="../profile-management/profile-management.html" class="btn btn-primary">Manage Profiles</a></div>
                </div>
                <div class="dashboard-card content-card">
                    <div class="card-header"><div class="icon"><i class="fa-solid fa-calendar-days"></i></div><h3>Next Appointment</h3></div>
                    <div class="card-body"><p>You have an appointment with Dr. Anika Rahman on <strong>August 15, 2025</strong>.</p><a href="../appointment-scheduling/appointment-scheduling.html" class="btn btn-primary">View Appointments</a></div>
                </div>
            </div>
        </main>
    </div>

    <!-- Script loading order is CRITICAL for this to work -->
    <!-- 1. Load the official Firebase libraries -->
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
    
    <!-- 2. Load YOUR Firebase configuration to initialize the connection -->
    <script src="../../js/firebase-config.js"></script>
    
    <!-- 3. Load the script for this specific page AFTER the connection is made -->
    <script src="../../js/mother-dashboard.js"></script>
</body>
</html><!-- === File: views/mother-dashboard/mother-dashboard.html (FINAL, FUNCTIONAL VERSION) === -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mother Dashboard - MaaShishu Shurokkha</title>
    <link rel="stylesheet" href="../../css/main.css">
    <link rel="stylesheet" href="../../css/mother-dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
</head>
<body>
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-header"><a href="#"><img src="../../logo.png" alt="Logo"><h3>MaaShishu Shurokkha</h3></a></div>
            <nav class="sidebar-nav">
                <ul>
                    <li class="active"><a href="#"><i class="fa-solid fa-house fa-fw"></i> Dashboard Home</a></li>
                    <li><a href="../profile-management/profile-management.html"><i class="fa-solid fa-user-pen fa-fw"></i> Profile Management</a></li>
                    <li><a href="../vaccination-tracking/vaccination-tracking.html"><i class="fa-solid fa-syringe fa-fw"></i> Vaccination Tracking</a></li>
                    <li><a href="../appointment-scheduling/appointment-scheduling.html"><i class="fa-solid fa-calendar-check fa-fw"></i> Appointments</a></li>
                    <li><a href="../provider-locator/provider-locator.html"><i class="fa-solid fa-location-dot fa-fw"></i> Find a Provider</a></li>
                    <li><a href="../community-support/community-support.html"><i class="fa-solid fa-people-group fa-fw"></i> Community Support</a></li>
                    <li class="logout-link"><a id="logoutButton" href="#"><i class="fa-solid fa-right-from-bracket fa-fw"></i> Logout</a></li>
                </ul>
            </nav>
            <div class="profile-switcher">
                <a href="#" class="profile-item"><div class="avatar avatar-mother">MN</div><span>My Profile</span></a>
                <a href="../child-dashboard/child-dashboard.html" class="profile-item"><div class="avatar avatar-child">CN</div><span>Child's Dashboard</span></a>
            </div>
        </aside>
        <main class="main-content">
            <header class="main-content-header"><h1 id="welcomeMessage">Loading...</h1><p>This is your central hub for managing your family's health.</p></header>
            <section class="children-section">
                <div class="children-section-header">
                    <h3>My Children</h3>
                    <!-- This button now has an ID -->
                    <button class="btn btn-primary" id="addChildButton"><i class="fa-solid fa-plus"></i> Add Child</button>
                </div>
                <div id="childrenListContainer">
                    <!-- Child profile cards will be inserted here by JavaScript -->
                </div>
                <div class="empty-state content-card" id="emptyState" style="display: none;">
                    <i class="fa-solid fa-baby fa-3x"></i>
                    <p style="margin-top: 1rem;">You haven't added any child profiles yet.<br>Click "Add Child" to get started.</p>
                </div>
            </section>
        </main>
    </div>

    <!-- The Modal Popup for Adding a Child -->
    <div class="modal-overlay" id="addChildModal">
        <div class="modal-content content-card">
            <div class="modal-header">
                <h2>Add New Child Profile</h2>
                <!-- This button now has an ID -->
                <button class="close-button" id="closeModalButton">×</button>
            </div>
            <!-- This form now has an ID -->
            <form id="addChildForm">
                <div class="form-group"><label for="childName">Child's Full Name</label><input type="text" id="childName" required></div>
                <div class="form-group"><label for="childDob">Date of Birth</label><input type="date" id="childDob" required></div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Save Child Profile</button>
            </form>
        </div>
    </div>

    <!-- ============================================= -->
    <!--      THE CRITICAL SCRIPT TAGS AT THE BOTTOM   -->
    <!-- ============================================= -->
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
    <script src="../../js/firebase-config.js"></script>
    <script src="../../js/mother-dashboard.js"></script>
    <!-- ============================================= -->
</body>
</html>