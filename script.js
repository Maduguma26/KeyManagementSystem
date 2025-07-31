// Sample Data
const users = [
    { id: 1, name: "Admin User", username: "admin", password: "admin123", role: "admin" },
    { id: 2, name: "John Doe", username: "john.doe", password: "user123", role: "user" },
    { id: 3, name: "Jane Smith", username: "jane.smith", password: "user123", role: "user" },
    { id: 4, name: "Mike Johnson", username: "mike.johnson", password: "user123", role: "user" }
];

const vehicles = [
    { id: 1, name: "Company Sedan", plate: "ABC123", type: "sedan", status: "available" },
    { id: 2, name: "Marketing SUV", plate: "XYZ789", type: "suv", status: "available" },
    { id: 3, name: "Delivery Van", plate: "VAN456", type: "van", status: "in-use", holder: "John Doe" },
    { id: 4, name: "Service Truck", plate: "TRK789", type: "truck", status: "available" },
    { id: 5, name: "Executive Car", plate: "EXE001", type: "sedan", status: "in-use", holder: "Jane Smith" },
    { id: 6, name: "Sales SUV", plate: "SAL002", type: "suv", status: "available" },
    { id: 7, name: "Maintenance Van", plate: "MNT003", type: "van", status: "in-use", holder: "Mike Johnson" },
    { id: 8, name: "Manager's Car", plate: "MGR004", type: "sedan", status: "available" }
];

const activityLog = [
    { id: 1, action: "login", user: "admin", time: "2023-06-15 09:30:00" },
    { id: 2, action: "check-out", user: "John Doe", vehicle: "Delivery Van", time: "2023-06-15 10:15:00" },
    { id: 3, action: "check-out", user: "Jane Smith", vehicle: "Executive Car", time: "2023-06-15 10:30:00" },
    { id: 4, action: "check-out", user: "Mike Johnson", vehicle: "Maintenance Van", time: "2023-06-15 11:00:00" },
    { id: 5, action: "login", user: "john.doe", time: "2023-06-15 08:45:00" }
];

let currentUser = null;

// DOM Elements
const authScreen = document.getElementById('authScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const currentUserSpan = document.getElementById('currentUser');
const adminDashboard = document.getElementById('adminDashboard');
const userDashboard = document.getElementById('userDashboard');
const adminKeyGrid = document.getElementById('adminKeyGrid');
const userKeyGrid = document.getElementById('userKeyGrid');
const usersTableBody = document.getElementById('usersTableBody');
const vehiclesTableBody = document.getElementById('vehiclesTableBody');
const activityLogElement = document.getElementById('activityLog');
const userProfile = document.getElementById('userProfile');
const currentKeyInfo = document.getElementById('currentKeyInfo');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showDashboard();
    }
});

// Login Form Submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard();
    } else {
        alert('Invalid username or password');
    }
});

// Show Dashboard based on user role
function showDashboard() {
    authScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    
    currentUserSpan.textContent = currentUser.name;
    
    if (currentUser.role === 'admin') {
        adminDashboard.classList.remove('hidden');
        userDashboard.classList.add('hidden');
        renderAdminDashboard();
    } else {
        adminDashboard.classList.add('hidden');
        userDashboard.classList.remove('hidden');
        renderUserDashboard();
    }
}

// Render Admin Dashboard
function renderAdminDashboard() {
    renderAdminKeyGrid();
    renderUsersTable();
    renderVehiclesTable();
    renderActivityLog();
    updateStats();
}

// Render User Dashboard
function renderUserDashboard() {
    renderUserKeyGrid();
    renderUserProfile();
    renderCurrentKey();
}

// Render Admin Key Grid
function renderAdminKeyGrid() {
    adminKeyGrid.innerHTML = '';
    
    vehicles.forEach(vehicle => {
        const keyCard = document.createElement('div');
        keyCard.className = `key-card ${vehicle.status === 'available' ? 'available' : 'in-use'}`;
        
        const icon = document.createElement('i');
        icon.className = 'key-icon fas fa-key';
        
        const name = document.createElement('div');
        name.className = 'vehicle-name';
        name.textContent = vehicle.name;
        
        const plate = document.createElement('div');
        plate.className = 'vehicle-plate';
        plate.textContent = vehicle.plate;
        
        const status = document.createElement('div');
        status.className = `key-status status-${vehicle.status === 'available' ? 'available' : 'in-use'}`;
        status.textContent = vehicle.status === 'available' ? 'Available' : 'In Use';
        
        const button = document.createElement('button');
        button.className = `btn btn-${vehicle.status === 'available' ? 'primary' : 'danger'}`;
        button.innerHTML = `<i class="fas fa-${vehicle.status === 'available' ? 'key' : 'key'}"></i> ${vehicle.status === 'available' ? 'Check Out' : 'Check In'}`;
        
        button.addEventListener('click', () => {
            if (vehicle.status === 'available') {
                vehicle.status = 'in-use';
                vehicle.holder = currentUser.name;
                activityLog.unshift({
                    id: activityLog.length + 1,
                    action: 'check-out',
                    user: currentUser.name,
                    vehicle: vehicle.name,
                    time: new Date().toLocaleString()
                });
            } else {
                vehicle.status = 'available';
                delete vehicle.holder;
                activityLog.unshift({
                    id: activityLog.length + 1,
                    action: 'check-in',
                    user: currentUser.name,
                    vehicle: vehicle.name,
                    time: new Date().toLocaleString()
                });
            }
            renderAdminDashboard();
        });
        
        keyCard.appendChild(icon);
        keyCard.appendChild(name);
        keyCard.appendChild(plate);
        keyCard.appendChild(status);
        keyCard.appendChild(button);
        
        adminKeyGrid.appendChild(keyCard);
    });
}

// Render User Key Grid
function renderUserKeyGrid() {
    userKeyGrid.innerHTML = '';
    
    vehicles.forEach(vehicle => {
        const keyCard = document.createElement('div');
        keyCard.className = `key-card ${vehicle.status === 'available' ? 'available' : vehicle.holder === currentUser.name ? 'in-use' : 'unauthorized'}`;
        
        const icon = document.createElement('i');
        icon.className = 'key-icon fas fa-key';
        
        const name = document.createElement('div');
        name.className = 'vehicle-name';
        name.textContent = vehicle.name;
        
        const plate = document.createElement('div');
        plate.className = 'vehicle-plate';
        plate.textContent = vehicle.plate;
        
        const status = document.createElement('div');
        status.className = `key-status status-${vehicle.status === 'available' ? 'available' : vehicle.holder === currentUser.name ? 'in-use' : 'unauthorized'}`;
        status.textContent = vehicle.status === 'available' ? 'Available' : vehicle.holder === currentUser.name ? 'In Use (You)' : 'Unavailable';
        
        const button = document.createElement('button');
        if (vehicle.status === 'available') {
            button.className = 'btn btn-primary';
            button.innerHTML = '<i class="fas fa-key"></i> Check Out';
            button.addEventListener('click', () => {
                vehicle.status = 'in-use';
                vehicle.holder = currentUser.name;
                activityLog.unshift({
                    id: activityLog.length + 1,
                    action: 'check-out',
                    user: currentUser.name,
                    vehicle: vehicle.name,
                    time: new Date().toLocaleString()
                });
                renderUserDashboard();
            });
        } else if (vehicle.holder === currentUser.name) {
            button.className = 'btn btn-danger';
            button.innerHTML = '<i class="fas fa-key"></i> Check In';
            button.addEventListener('click', () => {
                vehicle.status = 'available';
                delete vehicle.holder;
                activityLog.unshift({
                    id: activityLog.length + 1,
                    action: 'check-in',
                    user: currentUser.name,
                    vehicle: vehicle.name,
                    time: new Date().toLocaleString()
                });
                renderUserDashboard();
            });
        } else {
            button.className = 'btn btn-secondary';
            button.innerHTML = '<i class="fas fa-ban"></i> Unavailable';
            button.disabled = true;
        }
        
        keyCard.appendChild(icon);
        keyCard.appendChild(name);
        keyCard.appendChild(plate);
        keyCard.appendChild(status);
        keyCard.appendChild(button);
        
        userKeyGrid.appendChild(keyCard);
    });
}

// Render Users Table
function renderUsersTable() {
    usersTableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = user.name;
        
        const usernameCell = document.createElement('td');
        usernameCell.textContent = user.username;
        
        const roleCell = document.createElement('td');
        roleCell.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        
        const vehiclesCell = document.createElement('td');
        const userVehicles = vehicles.filter(v => v.holder === user.name);
        vehiclesCell.textContent = userVehicles.length > 0 ? 
            userVehicles.map(v => v.name).join(', ') : 'None';
        
        const actionsCell = document.createElement('td');
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'action-buttons';
        
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-secondary';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.addEventListener('click', () => showEditUserModal(user));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', () => deleteUser(user.id));
        
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        actionsCell.appendChild(actionsDiv);
        
        row.appendChild(nameCell);
        row.appendChild(usernameCell);
        row.appendChild(roleCell);
        row.appendChild(vehiclesCell);
        row.appendChild(actionsCell);
        
        usersTableBody.appendChild(row);
    });
}

// Render Vehicles Table
function renderVehiclesTable() {
    vehiclesTableBody.innerHTML = '';
    
    vehicles.forEach(vehicle => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = vehicle.name;
        
        const plateCell = document.createElement('td');
        plateCell.textContent = vehicle.plate;
        
        const typeCell = document.createElement('td');
        typeCell.textContent = vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1);
        
        const statusCell = document.createElement('td');
        const statusSpan = document.createElement('span');
        statusSpan.className = `status-${vehicle.status === 'available' ? 'available' : 'in-use'}`;
        statusSpan.textContent = vehicle.status === 'available' ? 'Available' : 'In Use';
        statusCell.appendChild(statusSpan);
        
        const holderCell = document.createElement('td');
        holderCell.textContent = vehicle.holder || '-';
        
        const actionsCell = document.createElement('td');
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'action-buttons';
        
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-secondary';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.addEventListener('click', () => showEditVehicleModal(vehicle));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', () => deleteVehicle(vehicle.id));
        
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        actionsCell.appendChild(actionsDiv);
        
        row.appendChild(nameCell);
        row.appendChild(plateCell);
        row.appendChild(typeCell);
        row.appendChild(statusCell);
        row.appendChild(holderCell);
        row.appendChild(actionsCell);
        
        vehiclesTableBody.appendChild(row);
    });
}

// Render Activity Log
function renderActivityLog() {
    activityLogElement.innerHTML = '';
    
    activityLog.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        const action = document.createElement('div');
        let actionText = '';
        
        switch(activity.action) {
            case 'login':
                actionText = `${activity.user} logged in`;
                break;
            case 'check-out':
                actionText = `${activity.user} checked out ${activity.vehicle}`;
                break;
            case 'check-in':
                actionText = `${activity.user} checked in ${activity.vehicle}`;
                break;
            default:
                actionText = activity.action;
        }
        
        action.textContent = actionText;
        
        const time = document.createElement('div');
        time.className = 'activity-time';
        time.textContent = activity.time;
        
        item.appendChild(action);
        item.appendChild(time);
        
        activityLogElement.appendChild(item);
    });
}

// Render User Profile
function renderUserProfile() {
    userProfile.innerHTML = `
        <div class="profile-info">
            <p><strong>Name:</strong> ${currentUser.name}</p>
            <p><strong>Username:</strong> ${currentUser.username}</p>
            <p><strong>Role:</strong> ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</p>
        </div>
    `;
}

// Render Current Key
function renderCurrentKey() {
    const userVehicle = vehicles.find(v => v.holder === currentUser.name);
    
    if (userVehicle) {
        currentKeyInfo.innerHTML = `
            <div class="current-key">
                <div class="vehicle-name">${userVehicle.name}</div>
                <div class="vehicle-plate">${userVehicle.plate}</div>
                <div class="vehicle-type">${userVehicle.type.charAt(0).toUpperCase() + userVehicle.type.slice(1)}</div>
                <button class="btn btn-danger" onclick="checkInVehicle(${userVehicle.id})">
                    <i class="fas fa-key"></i> Check In
                </button>
            </div>
        `;
    } else {
        currentKeyInfo.innerHTML = '<p class="no-key-message">No key currently held</p>';
    }
}

// Check In Vehicle
function checkInVehicle(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
        vehicle.status = 'available';
        delete vehicle.holder;
        activityLog.unshift({
            id: activityLog.length + 1,
            action: 'check-in',
            user: currentUser.name,
            vehicle: vehicle.name,
            time: new Date().toLocaleString()
        });
        renderUserDashboard();
    }
}

// Update Stats
function updateStats() {
    document.getElementById('totalKeys').textContent = vehicles.length;
    document.getElementById('availableKeys').textContent = vehicles.filter(v => v.status === 'available').length;
    document.getElementById('keysInUse').textContent = vehicles.filter(v => v.status === 'in-use').length;
    document.getElementById('totalUsers').textContent = users.length;
}

// Switch Tabs
function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('#adminDashboard > div').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    document.querySelector(`.nav-tab:nth-child(${
        ['overview', 'users', 'vehicles', 'activity'].indexOf(tabName) + 1
    })`).classList.add('active');
    
    document.getElementById(`${tabName}Tab`).classList.remove('hidden');
}

// Show Add User Modal
function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

// Show Add Vehicle Modal
function showAddVehicleModal() {
    document.getElementById('addVehicleModal').style.display = 'block';
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Add User Form Submission
document.getElementById('addUserForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newUser = {
        id: users.length + 1,
        name: document.getElementById('newUserName').value,
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newUserPassword').value,
        role: document.getElementById('newUserRole').value
    };
    
    users.push(newUser);
    closeModal('addUserModal');
    renderUsersTable();
    updateStats();
    document.getElementById('addUserForm').reset();
});

// Add Vehicle Form Submission
document.getElementById('addVehicleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newVehicle = {
        id: vehicles.length + 1,
        name: document.getElementById('newVehicleName').value,
        plate: document.getElementById('newVehiclePlate').value,
        type: document.getElementById('newVehicleType').value,
        status: 'available'
    };
    
    vehicles.push(newVehicle);
    closeModal('addVehicleModal');
    renderAdminDashboard();
    document.getElementById('addVehicleForm').reset();
});

// Delete User
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users.splice(index, 1);
            renderUsersTable();
            updateStats();
        }
    }
}

// Delete Vehicle
function deleteVehicle(vehicleId) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        const index = vehicles.findIndex(v => v.id === vehicleId);
        if (index !== -1) {
            vehicles.splice(index, 1);
            renderAdminDashboard();
        }
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    dashboard.classList.add('hidden');
    authScreen.classList.remove('hidden');
    document.getElementById('loginForm').reset();
}

// Show Edit User Modal (placeholder)
function showEditUserModal(user) {
    alert(`Edit user ${user.name} functionality would go here`);
}

// Show Edit Vehicle Modal (placeholder)
function showEditVehicleModal(vehicle) {
    alert(`Edit vehicle ${vehicle.name} functionality would go here`);
}