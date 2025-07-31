// Sample data
let users = [
    { id: 1, name: "Luyanda Xhakaza", username: "luyanda.xhakaza", password: "user123", role: "user", authorizedVehicles: [1, 2, 3] },
    { id: 2, name: "Keanu Moodley", username: "keanu.moodley", password: "user123", role: "user", authorizedVehicles: [2, 4, 5] },
    { id: 3, name: "Dembe Makhari", username: "dembe.makhari", password: "user123", role: "user", authorizedVehicles: [1, 6] },
    { id: 4, name: "Konanani Maduguma", username: "admin", password: "admin123", role: "admin", authorizedVehicles: [] }
];

let vehicles = [
    { id: 1, name: "Toyota Etios", plate: "HF 26 XZ GP", type: "sedan", status: "available", currentHolder: null },
    { id: 2, name: "Honda CR-V", plate: "KH 73 TL GP", type: "suv", status: "in-use", currentHolder: 1 },
    { id: 3, name: "Ford Ranger Raptor", plate: "BSP 636 L", type: "truck", status: "available", currentHolder: null },
    { id: 4, name: "Nissan Almera", plate: "MD 47 WS GP", type: "sedan", status: "in-use", currentHolder: 2 },
    { id: 5, name: "Chevy Tahoe", plate: "FY 38 HZ GP", type: "suv", status: "available", currentHolder: null },
    { id: 6, name: "BMW X5", plate: "MD 47 WZ GP", type: "suv", status: "in-use", currentHolder: 3 },
    { id: 7, name: "Mercedes Sprinter", plate: "JZ 26 CR GP", type: "van", status: "available", currentHolder: null },
    { id: 8, name: "Volkswagen Golf", plate: "JZ 27 GH GP", type: "sedan", status: "available", currentHolder: null }
];

let activityLog = [
    { timestamp: new Date(Date.now() - 3600000), user: "John Doe", action: "picked up", vehicle: "Honda CR-V" },
    { timestamp: new Date(Date.now() - 7200000), user: "Jane Smith", action: "returned", vehicle: "Toyota Camry" },
    { timestamp: new Date(Date.now() - 10800000), user: "Mike Johnson", action: "picked up", vehicle: "BMW X5" },
    { timestamp: new Date(Date.now() - 14400000), user: "Jane Smith", action: "picked up", vehicle: "Nissan Altima" }
];

let currentUser = null;
let currentTab = 'overview';

// Authentication
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('currentUser').textContent = user.name;
        
        if (user.role === 'admin') {
            document.getElementById('adminDashboard').classList.remove('hidden');
            loadAdminDashboard();
        } else {
            document.getElementById('userDashboard').classList.remove('hidden');
            loadUserDashboard();
        }
    } else {
        alert('Invalid credentials');
    }
});

function logout() {
    currentUser = null;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('userDashboard').classList.add('hidden');
    document.getElementById('loginForm').reset();
}

// Admin Dashboard Functions
function loadAdminDashboard() {
    updateStats();
    loadAdminKeyGrid();
    loadUsersTable();
    loadVehiclesTable();
    loadActivityLog();
}

function updateStats() {
    document.getElementById('totalKeys').textContent = vehicles.length;
    document.getElementById('availableKeys').textContent = vehicles.filter(v => v.status === 'available').length;
    document.getElementById('keysInUse').textContent = vehicles.filter(v => v.status === 'in-use').length;
    document.getElementById('totalUsers').textContent = users.filter(u => u.role === 'user').length;
}

function loadAdminKeyGrid() {
    const grid = document.getElementById('adminKeyGrid');
    grid.innerHTML = '';
    
    vehicles.forEach(vehicle => {
        const keyCard = createKeyCard(vehicle, true);
        grid.appendChild(keyCard);
    });
}

function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.filter(u => u.role === 'user').forEach(user => {
        const tr = document.createElement('tr');
        const authorizedVehicleNames = user.authorizedVehicles
            .map(id => vehicles.find(v => v.id === id)?.name)
            .filter(name => name)
            .join(', ');
        
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td><span style="background: #bee3f8; color: #2b6cb0; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${user.role}</span></td>
            <td>${authorizedVehicleNames}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="editUserPermissions(${user.id})">Edit Permissions</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadVehiclesTable() {
    const tbody = document.getElementById('vehiclesTableBody');
    tbody.innerHTML = '';
    
    vehicles.forEach(vehicle => {
        const tr = document.createElement('tr');
        const currentHolderName = vehicle.currentHolder 
            ? users.find(u => u.id === vehicle.currentHolder)?.name || 'Unknown'
            : '-';
        
        tr.innerHTML = `
            <td>${vehicle.name}</td>
            <td>${vehicle.plate}</td>
            <td><span style="text-transform: capitalize;">${vehicle.type}</span></td>
            <td><span class="status-${vehicle.status}">${vehicle.status === 'in-use' ? 'In Use' : 'Available'}</span></td>
            <td>${currentHolderName}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="editVehicle(${vehicle.id})">Edit</button>
                ${vehicle.status === 'in-use' ? `<button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px; margin-left: 5px;" onclick="forceReturn(${vehicle.id})">Force Return</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadActivityLog() {
    const log = document.getElementById('activityLog');
    log.innerHTML = '';
    
    activityLog.sort((a, b) => b.timestamp - a.timestamp).forEach(activity => {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.innerHTML = `
            <div>
                <strong>${activity.user}</strong> ${activity.action} <strong>${activity.vehicle}</strong>
            </div>
            <div class="activity-time">${activity.timestamp.toLocaleString()}</div>
        `;
        log.appendChild(div);
    });
}

// User Dashboard Functions
function loadUserDashboard() {
    loadUserProfile();
    loadUserKeyGrid();
    updateCurrentKeyInfo();
}

function loadUserProfile() {
    const profile = document.getElementById('userProfile');
    profile.innerHTML = `
        <p><strong>Name:</strong> ${currentUser.name}</p>
        <p><strong>Username:</strong> ${currentUser.username}</p>
        <p><strong>Authorized Vehicles:</strong> ${currentUser.authorizedVehicles.length}</p>
    `;
}

function loadUserKeyGrid() {
    const grid = document.getElementById('userKeyGrid');
    grid.innerHTML = '';
    
    vehicles.forEach(vehicle => {
        const isAuthorized = currentUser.authorizedVehicles.includes(vehicle.id);
        const isCurrentlyHeld = vehicle.currentHolder === currentUser.id;
        const hasAnyKey = vehicles.some(v => v.currentHolder === currentUser.id);
        
        if (isAuthorized || isCurrentlyHeld) {
            const keyCard = createKeyCard(vehicle, false, hasAnyKey && !isCurrentlyHeld);
            grid.appendChild(keyCard);
        }
    });
}

function updateCurrentKeyInfo() {
    const currentKeyDiv = document.getElementById('currentKeyInfo');
    const heldVehicle = vehicles.find(v => v.currentHolder === currentUser.id);
    
    if (heldVehicle) {
        currentKeyDiv.innerHTML = `
            <div style="background: #fed7d7; padding: 15px; border-radius: 8px; border-left: 4px solid #e53e3e;">
                <p><strong>${heldVehicle.name}</strong></p>
                <p style="font-size: 14px; color: #742a2a;">${heldVehicle.plate}</p>
                <button class="btn btn-danger" style="margin-top: 10px; width: 100%;" onclick="returnKey(${heldVehicle.id})">Return Key</button>
            </div>
        `;
    } else {
        currentKeyDiv.innerHTML = '<p style="color: #718096;">No key currently held</p>';
    }
}

// Key Card Creation
function createKeyCard(vehicle, isAdmin, isDisabled = false) {
    const div = document.createElement('div');
    let statusClass = 'available';
    let statusText = 'Available';
    
    if (vehicle.status === 'in-use') {
        statusClass = 'in-use';
        statusText = 'In Use';
    }
    
    if (!isAdmin && !currentUser.authorizedVehicles.includes(vehicle.id) && vehicle.currentHolder !== currentUser.id) {
        statusClass = 'unauthorized';
        statusText = 'Unauthorized';
    }
    
    if (isDisabled) {
        statusClass = 'unauthorized';
    }
    
    div.className = `key-card ${statusClass}`;
    if (isDisabled) div.style.pointerEvents = 'none';
    
    const vehicleIcon = getVehicleIcon(vehicle.type);
    const currentHolderName = vehicle.currentHolder 
        ? users.find(u => u.id === vehicle.currentHolder)?.name || 'Unknown'
        : null;
    
    div.innerHTML = `
        <div class="key-icon">${vehicleIcon}</div>
        <div class="vehicle-name">${vehicle.name}</div>
        <div class="vehicle-plate">${vehicle.plate}</div>
        <div class="key-status status-${statusClass.replace('-', '')}">${statusText}</div>
        ${currentHolderName ? `<div style="font-size: 12px; color: #718096;">Held by: ${currentHolderName}</div>` : ''}
        ${!isAdmin && statusClass === 'available' && !isDisabled ? `<button class="btn btn-success" onclick="pickupKey(${vehicle.id})" style="margin-top: 10px;">Pick Up</button>` : ''}
        ${!isAdmin && vehicle.currentHolder === currentUser.id ? `<button class="btn btn-danger" onclick="returnKey(${vehicle.id})" style="margin-top: 10px;">Return Key</button>` : ''}
    `;
    
    if (isAdmin) {
        div.onclick = () => showKeyDetails(vehicle.id);
        div.style.cursor = 'pointer';
    }
    
    return div;
}

function getVehicleIcon(type) {
    const icons = {
        sedan: '<i class="fa-solid fa-car-side"></i>',
        suv: '<i class="fa-solid fa-truck-monster"></i>',
        truck: '<i class="fa-solid fa-truck"></i>',
        van: '<i class="fa-solid fa-van-shuttle"></i>',
        motorcycle: '<i class="fa-solid fa-motorcycle"></i>'
    };
    return icons[type] || '<i class="fa-solid fa-car-side"></i>';
}

// Key Actions
function pickupKey(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const hasAnyKey = vehicles.some(v => v.currentHolder === currentUser.id);
    
    if (hasAnyKey) {
        alert('You can only hold one key at a time. Please return your current key first.');
        return;
    }
    
    if (vehicle && vehicle.status === 'available' && currentUser.authorizedVehicles.includes(vehicleId)) {
        vehicle.status = 'in-use';
        vehicle.currentHolder = currentUser.id;
        
        // Add to activity log
        activityLog.push({
            timestamp: new Date(),
            user: currentUser.name,
            action: 'picked up',
            vehicle: vehicle.name
        });
        
        alert(`Successfully picked up key for ${vehicle.name}`);
        
        if (currentUser.role === 'admin') {
            loadAdminDashboard();
        } else {
            loadUserDashboard();
        }
    }
}

function returnKey(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    
    if (vehicle && vehicle.currentHolder === currentUser.id) {
        vehicle.status = 'available';
        vehicle.currentHolder = null;
        
        // Add to activity log
        activityLog.push({
            timestamp: new Date(),
            user: currentUser.name,
            action: 'returned',
            vehicle: vehicle.name
        });
        
        alert(`Successfully returned key for ${vehicle.name}`);
        
        if (currentUser.role === 'admin') {
            loadAdminDashboard();
        } else {
            loadUserDashboard();
        }
    }
}

function forceReturn(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const holder = users.find(u => u.id === vehicle.currentHolder);
    
    if (confirm(`Force return key for ${vehicle.name} from ${holder?.name}?`)) {
        vehicle.status = 'available';
        vehicle.currentHolder = null;
        
        // Add to activity log
        activityLog.push({
            timestamp: new Date(),
            user: 'Admin',
            action: 'force returned',
            vehicle: vehicle.name
        });
        
        loadAdminDashboard();
    }
}

// Modal Functions
function showKeyDetails(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const holder = vehicle.currentHolder ? users.find(u => u.id === vehicle.currentHolder) : null;
    const authorizedUsers = users.filter(u => u.authorizedVehicles.includes(vehicleId));
    
    const content = document.getElementById('keyModalContent');
    content.innerHTML = `
        <h3>${vehicle.name} - Key Details</h3>
        <p><strong>License Plate:</strong> ${vehicle.plate}</p>
        <p><strong>Type:</strong> ${vehicle.type}</p>
        <p><strong>Status:</strong> ${vehicle.status}</p>
        ${holder ? `<p><strong>Current Holder:</strong> ${holder.name}</p>` : ''}
        <h4 style="margin-top: 20px;">Authorized Users:</h4>
        <ul style="margin: 10px 0;">
            ${authorizedUsers.map(user => `<li>${user.name} (${user.username})</li>`).join('')}
        </ul>
        ${vehicle.status === 'in-use' ? `<button class="btn btn-danger" onclick="forceReturn(${vehicleId}); closeModal('keyModal');" style="margin-top: 15px;">Force Return</button>` : ''}
    `;
    
    document.getElementById('keyModal').style.display = 'block';
}

function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

function showAddVehicleModal() {
    document.getElementById('addVehicleModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Tab Management
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('#adminDashboard > div[id$="Tab"]').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.remove('hidden');
    
    // Update active tab styling
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    currentTab = tabName;
}

// Form Handlers
document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        name: document.getElementById('newUserName').value,
        username: document.getElementById('newUsername').value,
        password: document.getElementById('newUserPassword').value,
        role: document.getElementById('newUserRole').value,
        authorizedVehicles: []
    };
    
    // Check if username already exists
    if (users.find(u => u.username === newUser.username)) {
        alert('Username already exists');
        return;
    }
    
    users.push(newUser);
    closeModal('addUserModal');
    this.reset();
    loadUsersTable();
    updateStats();
    alert('User added successfully');
});

document.getElementById('addVehicleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newVehicle = {
        id: Math.max(...vehicles.map(v => v.id)) + 1,
        name: document.getElementById('newVehicleName').value,
        plate: document.getElementById('newVehiclePlate').value.toUpperCase(),
        type: document.getElementById('newVehicleType').value,
        status: 'available',
        currentHolder: null
    };
    
    // Check if plate already exists
    if (vehicles.find(v => v.plate === newVehicle.plate)) {
        alert('License plate already exists');
        return;
    }
    
    vehicles.push(newVehicle);
    closeModal('addVehicleModal');
    this.reset();
    loadVehiclesTable();
    loadAdminKeyGrid();
    updateStats();
    alert('Vehicle added successfully');
});

// Edit Functions
function editUserPermissions(userId) {
    const user = users.find(u => u.id === userId);
    const vehicleCheckboxes = vehicles.map(v => 
        `<label style="display: block; margin: 5px 0;">
            <input type="checkbox" value="${v.id}" ${user.authorizedVehicles.includes(v.id) ? 'checked' : ''}> 
            ${v.name} (${v.plate})
        </label>`
    ).join('');
    
    const content = document.getElementById('keyModalContent');
    content.innerHTML = `
        <h3>Edit Permissions - ${user.name}</h3>
        <p>Select authorized vehicles:</p>
        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 15px 0;">
            ${vehicleCheckboxes}
        </div>
        <button class="btn btn-primary" onclick="saveUserPermissions(${userId})">Save Changes</button>
    `;
    
    document.getElementById('keyModal').style.display = 'block';
}

function saveUserPermissions(userId) {
    const user = users.find(u => u.id === userId);
    const checkboxes = document.querySelectorAll('#keyModalContent input[type="checkbox"]:checked');
    user.authorizedVehicles = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    closeModal('keyModal');
    loadUsersTable();
    alert('Permissions updated successfully');
}

function editVehicle(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const content = document.getElementById('keyModalContent');
    
    content.innerHTML = `
        <h3>Edit Vehicle - ${vehicle.name}</h3>
        <form id="editVehicleForm">
            <div class="form-group">
                <label>Vehicle Name</label>
                <input type="text" id="editVehicleName" value="${vehicle.name}" required>
            </div>
            <div class="form-group">
                <label>License Plate</label>
                <input type="text" id="editVehiclePlate" value="${vehicle.plate}" required>
            </div>
            <div class="form-group">
                <label>Vehicle Type</label>
                <select id="editVehicleType" required>
                    <option value="sedan" ${vehicle.type === 'sedan' ? 'selected' : ''}>Sedan</option>
                    <option value="suv" ${vehicle.type === 'suv' ? 'selected' : ''}>SUV</option>
                    <option value="truck" ${vehicle.type === 'truck' ? 'selected' : ''}>Truck</option>
                    <option value="van" ${vehicle.type === 'van' ? 'selected' : ''}>Van</option>
                    <option value="motorcycle" ${vehicle.type === 'motorcycle' ? 'selected' : ''}>Motorcycle</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
            <button type="button" class="btn btn-danger" onclick="deleteVehicle(${vehicleId})" style="margin-left: 10px;">Delete Vehicle</button>
        </form>
    `;
    
    document.getElementById('editVehicleForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPlate = document.getElementById('editVehiclePlate').value.toUpperCase();
        if (vehicles.find(v => v.plate === newPlate && v.id !== vehicleId)) {
            alert('License plate already exists');
            return;
        }
        
        vehicle.name = document.getElementById('editVehicleName').value;
        vehicle.plate = newPlate;
        vehicle.type = document.getElementById('editVehicleType').value;
        
        closeModal('keyModal');
        loadVehiclesTable();
        loadAdminKeyGrid();
        alert('Vehicle updated successfully');
    });
    
    document.getElementById('keyModal').style.display = 'block';
}

function deleteVehicle(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    
    if (vehicle.status === 'in-use') {
        alert('Cannot delete vehicle that is currently in use');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${vehicle.name}?`)) {
        // Remove vehicle from all user authorizations
        users.forEach(user => {
            user.authorizedVehicles = user.authorizedVehicles.filter(id => id !== vehicleId);
        });
        
        // Remove vehicle from vehicles array
        const index = vehicles.findIndex(v => v.id === vehicleId);
        vehicles.splice(index, 1);
        
        closeModal('keyModal');
        loadVehiclesTable();
        loadAdminKeyGrid();
        loadUsersTable();
        updateStats();
        alert('Vehicle deleted successfully');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Focus username field on load
    document.getElementById('username').focus();
});