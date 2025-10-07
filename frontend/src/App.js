import React, { useState, useEffect, useCallback } from 'react';

// --- Main App Component: Manages Authentication ---
function App() {
  // ... (No changes in this component)
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState('login');
  const API_URL = 'http://localhost:5000/api';

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (!res.ok) throw new Error('Invalid token');
          setCurrentUser(await res.json());
        } catch (error) {
          console.error("Auth Error:", error);
          handleLogout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token, API_URL, handleLogout]);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };
  
  if (loading) return <div className="min-h-screen bg-[#262525] flex justify-center items-center text-white">Loading...</div>;

  if (!currentUser) {
    return authView === 'login' ? 
           <LoginPage onLogin={handleLogin} onShowRegister={() => setAuthView('register')} apiUrl={API_URL} /> : 
           <RegisterPage onShowLogin={() => setAuthView('login')} apiUrl={API_URL} />;
  }
  
  return <MainApp currentUser={currentUser} onLogout={handleLogout} apiUrl={API_URL} />;
}


// --- LoginPage & RegisterPage Components ---
const LoginPage = ({ onLogin, onShowRegister, apiUrl }) => {
    // ... (No changes in this component)
    const [emailAddress, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailAddress, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Login failed');
            onLogin(data.token);
        } catch (err) { setError(err.message); }
    };
    return (
        <div className="min-h-screen bg-[#262525] flex flex-col justify-center items-center text-white p-4">
            <img src="/asserts/autoslot_logo.jpeg" alt="AutoSlot Logo" className="h-20 mb-8" />
            <div className="bg-[#2d2d2d] p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center mb-6">Employee Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" placeholder="Email Address" value={emailAddress} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#40403E] p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-[#40403E] p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-[#C16D00] hover:bg-orange-600 font-bold p-3 rounded">Login</button>
                </form>
                <p className="text-center text-sm text-gray-400 mt-6">Don't have an account? <button type="button" onClick={onShowRegister} className="font-semibold text-orange-500 hover:underline">Register here</button></p>
            </div>
        </div>
    );
};
const RegisterPage = ({ onShowLogin, apiUrl }) => {
    // ... (No changes in this component)
    const [formData, setFormData] = useState({ name: '', emailAddress: '', password: '', role: 'Manager' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            const res = await fetch(`${apiUrl}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Registration failed');
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => onShowLogin(), 2000);
        } catch (err) { setError(err.message); }
    };
    return (
        <div className="min-h-screen bg-[#262525] flex flex-col justify-center items-center text-white p-4">
            <img src="/asserts/autoslot_logo.jpeg" alt="AutoSlot Logo" className="h-20 mb-8" />
            <div className="bg-[#2d2d2d] p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center mb-6">Create System User Account</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="w-full bg-[#40403E] p-3 rounded" />
                    <input type="email" name="emailAddress" placeholder="Email Address" onChange={handleChange} required className="w-full bg-[#40403E] p-3 rounded" />
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full bg-[#40403E] p-3 rounded" />
                    <select name="role" onChange={handleChange} value={formData.role} className="w-full bg-[#40403E] p-3 rounded">
                        <option value="Manager">Manager</option>
                        <option value="Admin">Administrator</option>
                    </select>
                    {error && <p className="text-red-500 text-sm text-center pt-1">{error}</p>}
                    {success && <p className="text-green-500 text-sm text-center pt-1">{success}</p>}
                    <button type="submit" className="w-full bg-[#C16D00] hover:bg-orange-600 font-bold p-3 rounded">Register</button>
                </form>
                <p className="text-center text-sm text-gray-400 mt-6">Already have an account? <button type="button" onClick={onShowLogin} className="font-semibold text-orange-500 hover:underline">Sign In</button></p>
            </div>
        </div>
    );
};


// --- Main Application Component ---
const MainApp = ({ currentUser, onLogout, apiUrl }) => {
    // ... (No changes in this component)
    const [activeView, setActiveView] = useState('Home');
    const [stats, setStats] = useState({ availableSlots: 4, officers: 0, openIncidents: 0 });
    const [recentIncidents, setRecentIncidents] = useState([]);
    const [vehicleDistribution, setVehicleDistribution] = useState({});

    const fetchDashboardData = useCallback(async () => {
        try {
            const [scansRes, employeesRes, incidentsRes] = await Promise.all([
                fetch(`${apiUrl}/camera/scans`),
                fetch(`${apiUrl}/employees`),
                fetch(`${apiUrl}/incidents`)
            ]);
            if (!scansRes.ok || !employeesRes.ok || !incidentsRes.ok) throw new Error('Failed to fetch all required data.');
            const scansData = await scansRes.json();
            const employeesData = await employeesRes.json();
            const incidentsData = await incidentsRes.json();
            const latestScan = scansData.length > 0 ? scansData[0] : null;
            const vehiclesCount = latestScan ? latestScan.detectedVehicles.length : 0;
            const openIncidents = incidentsData.filter(inc => inc.status === 'Open');
            const securityOfficers = employeesData.filter(emp => emp.role === 'Security');
            const distribution = scansData.flatMap(s => s.detectedVehicles).reduce((acc, v) => {
                acc[v.vehicleType] = (acc[v.vehicleType] || 0) + 1;
                return acc;
            }, {});
            setStats({
                availableSlots: 4 - vehiclesCount,
                officers: securityOfficers.length,
                openIncidents: openIncidents.length
            });
            setRecentIncidents(incidentsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5));
            setVehicleDistribution(distribution);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        }
    }, [apiUrl]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const navLinks = ['Home', 'Track Vehicles', 'Employee Management', 'Incidents', 'Reports'];
    
    const renderView = () => {
        switch (activeView) {
            case 'Track Vehicles': return <TrackVehiclesView apiUrl={apiUrl} onScanComplete={fetchDashboardData} />;
            case 'Employee Management': return <EmployeeManagementView apiUrl={apiUrl} onDataChange={fetchDashboardData} />;
            case 'Incidents': return <IncidentManagementView apiUrl={apiUrl} onDataChange={fetchDashboardData} />;
            case 'Reports': return <ReportsView apiUrl={apiUrl} />;
            case 'Profile': return <ProfileView employee={currentUser} />;
            case 'Home': default: return <DashboardView setActiveView={setActiveView} stats={stats} recentIncidents={recentIncidents} vehicleDistribution={vehicleDistribution} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-[#262525] text-white font-sans">
            <header className='sticky top-0 z-10 non-printable-area'>
                <div className="bg-[#2d2d2d] flex justify-between items-center py-2 px-6">
                    <img src="/asserts/autoslot_logo.jpeg" alt="AutoSlot Logo" className="h-12" />
                    <div className="flex items-center gap-4 text-white">
                        <div className="text-right">
                            <p className="font-bold text-md">{currentUser.name}</p>
                            <p className="text-xs text-gray-400">{currentUser.role}</p>
                        </div>
                        <button onClick={() => setActiveView('Profile')} className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </button>
                        <button onClick={onLogout} title="Logout" className="w-12 h-12 bg-gray-700 hover:bg-red-600 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
                <nav className="bg-[#C16D00] flex justify-between items-center px-6">
                    <div>
                        {navLinks.map(view => (
                            <button key={view} onClick={() => setActiveView(view)} className={`py-3 px-5 text-sm font-semibold relative ${activeView === view ? 'text-white' : 'text-gray-200 hover:text-white'}`}>
                                {view.toUpperCase()}
                                {activeView === view && (<span className="absolute bottom-0 left-0 right-0 h-1 bg-white"></span>)}
                            </button>
                        ))}
                    </div>
                </nav>
            </header>
            <main className="p-6">{renderView()}</main>
        </div>
    );
};

// ... Other components like ProfileView, DashboardView, TrackVehiclesView are unchanged ...
// --- Profile View ---
const ProfileView = ({ employee }) => {
    if (!employee) return <div className="text-center">Loading profile...</div>;
    return (
        <div className="bg-[#40403E] p-8 rounded-lg max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-600 pb-4">My Profile</h2>
            <div className="text-left space-y-4 text-lg">
                <p><span className="font-semibold text-gray-400 w-40 inline-block">Employee ID:</span> {employee.employeeID}</p>
                <p><span className="font-semibold text-gray-400 w-40 inline-block">Name:</span> {employee.name}</p>
                <p><span className="font-semibold text-gray-400 w-40 inline-block">Email:</span> {employee.emailAddress}</p>
                <p><span className="font-semibold text-gray-400 w-40 inline-block">Role:</span> {employee.role}</p>
                {employee.shift && <p><span className="font-semibold text-gray-400 w-40 inline-block">Shift:</span> {employee.shift}</p>}
            </div>
        </div>
    );
};

// --- REDESIGNED: Dashboard View ---
const DashboardView = ({ setActiveView, stats, recentIncidents, vehicleDistribution }) => {
    const vehicleTypes = ['Car', 'Motorcycle', 'Van', 'Truck'];
    const totalVehicles = Object.values(vehicleDistribution).reduce((sum, count) => sum + count, 0) || 1;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#40403E] p-5 rounded-lg"> <h3 className="text-gray-400 text-sm">Available Parking Slots</h3> <p className="text-3xl font-bold">{stats.availableSlots}</p> </div>
                <div className="bg-[#40403E] p-5 rounded-lg"> <h3 className="text-gray-400 text-sm">Total Security Officers</h3> <p className="text-3xl font-bold">{stats.officers}</p> </div>
                <div className="bg-[#40403E] p-5 rounded-lg"> <h3 className="text-gray-400 text-sm">Open Incidents</h3> <p className="text-3xl font-bold">{stats.openIncidents}</p> </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#40403E] p-5 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button onClick={() => setActiveView('Track Vehicles')} className="bg-[#2d2d2d] hover:bg-orange-600 p-4 rounded-lg flex flex-col items-center justify-center transition-colors"><span>SCAN AREA</span></button>
                        <button onClick={() => setActiveView('Employee Management')} className="bg-[#2d2d2d] hover:bg-orange-600 p-4 rounded-lg flex flex-col items-center justify-center transition-colors"><span>MANAGE STAFF</span></button>
                        <button onClick={() => setActiveView('Incidents')} className="bg-[#2d2d2d] hover:bg-orange-600 p-4 rounded-lg flex flex-col items-center justify-center transition-colors"><span>VIEW INCIDENTS</span></button>
                        <button onClick={() => setActiveView('Reports')} className="bg-[#2d2d2d] hover:bg-orange-600 p-4 rounded-lg flex flex-col items-center justify-center transition-colors"><span>GET REPORTS</span></button>
                    </div>
                    <h3 className="text-xl font-semibold mb-4 mt-6">Recent Incidents</h3>
                    <div className="space-y-2">
                        {recentIncidents.length > 0 ? recentIncidents.map(inc => (
                            <div key={inc._id} className="bg-[#2d2d2d] p-2 rounded-lg text-sm flex justify-between items-center">
                                <p>{inc.type} <span className="text-gray-400">({inc.severity})</span></p>
                                <span className={`px-2 py-1 text-xs rounded-full ${inc.status === 'Open' ? 'bg-red-500' : 'bg-green-500'}`}>{inc.status}</span>
                            </div>
                        )) : <p className="text-gray-400">No recent incidents.</p>}
                    </div>
                </div>
                <div className="bg-[#40403E] p-5 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Vehicle Distribution</h3>
                    <div className="space-y-4">
                        {vehicleTypes.map(type => (
                            <div key={type}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{type}</span>
                                    <span>{vehicleDistribution[type] || 0}</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2.5">
                                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${((vehicleDistribution[type] || 0) / totalVehicles) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Track Vehicles View (Reverted to Button Scan) ---
const TrackVehiclesView = ({ apiUrl, onScanComplete }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [lastScan, setLastScan] = useState(null);
    const [error, setError] = useState('');
    
    const handleScan = async () => {
        setIsScanning(true); setError('');
        try {
            const res = await fetch(`${apiUrl}/camera/scan`, { method: 'POST' });
            if (!res.ok) throw new Error('Camera scan failed');
            const scanData = await res.json();
            setLastScan(scanData);
            if (onScanComplete) {
                onScanComplete();
            }
        } catch (err) { 
            setError(err.message); 
        } finally { 
            setIsScanning(false); 
        }
    };
    
    const slotsOccupied = lastScan ? lastScan.detectedVehicles.length : 0;
    const slotsAvailable = 4 - slotsOccupied;
    
    return (
        <div className="space-y-6">
            <div className="bg-[#40403E] p-8 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-4">Live Parking Area Security Scan</h2>
                <p className="text-gray-400 mb-6">Click the button to simulate a live scan of the parking area (4 slots total).</p>
                <button onClick={handleScan} disabled={isScanning} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-500">
                    {isScanning ? 'Scanning...' : 'SCAN PARKING AREA'}
                </button>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
            {lastScan && (
                <div className="bg-[#40403E] p-5 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Scan Results (ID: {lastScan.scanID})</h3>
                        <div className={`text-lg font-bold p-2 rounded ${slotsAvailable > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                            {slotsAvailable > 0 ? `${slotsAvailable} Slots Available` : 'PARKING FULL'}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr className="border-b border-gray-600"><th className="p-2">VEHICLE NUMBER</th><th className="p-2">DETECTED TYPE</th><th className="p-2">CONFIDENCE</th></tr></thead>
                            <tbody>
                                {lastScan.detectedVehicles.map((v, index) => (
                                    <tr key={index} className="border-b border-gray-700"><td className="p-2">{v.vehicleNumber}</td><td className="p-2">{v.vehicleType}</td><td className="p-2">{(v.confidenceScore * 100).toFixed(2)}%</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- NEW: Component for Managing Shifts ONLY ---
const ShiftManager = ({ apiUrl, onDataChange }) => {
    const [officers, setOfficers] = useState([]);

    const fetchOfficers = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/employees`);
            const allEmployees = await res.json();
            // Filter for Security Officers only
            setOfficers(allEmployees.filter(emp => emp.role === 'Security'));
        } catch (error) {
            console.error("Failed to fetch officers:", error);
        }
    }, [apiUrl]);

    useEffect(() => {
        fetchOfficers();
    }, [fetchOfficers]);

    const handleShiftChange = async (employeeId, newShift) => {
        try {
            const res = await fetch(`${apiUrl}/employees/${employeeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shift: newShift })
            });
            if (!res.ok) throw new Error("Failed to update shift");

            // Update state locally for immediate UI feedback
            setOfficers(currentOfficers =>
                currentOfficers.map(officer =>
                    officer._id === employeeId ? { ...officer, shift: newShift } : officer
                )
            );
            
            // Notify the main app that data has changed
            if (onDataChange) onDataChange();

        } catch (error) {
            console.error("Shift update error:", error);
            // Optionally, show an error message to the user
        }
    };
    
    return (
        <div className="bg-[#40403E] p-5 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-600 pb-4">Manage Security Staff Shifts</h2>
            <div className="space-y-4">
                {officers.map(officer => (
                    <div key={officer._id} className="bg-[#2d2d2d] p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">{officer.name} <span className="text-sm font-light text-gray-400">({officer.employeeID})</span></p>
                            <p className="text-sm text-gray-300">{officer.contactNumber}</p>
                        </div>
                        <div className="w-48">
                            <select
                                value={officer.shift || 'Day'}
                                onChange={(e) => handleShiftChange(officer._id, e.target.value)}
                                className="w-full bg-[#262525] p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="Day">Day Shift</option>
                                <option value="Night">Night Shift</option>
                                <option value="Half Day">Half Day Shift</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- NEW: Component for the full employee management (Add/Edit/List) ---
const AllEmployeesManager = ({ apiUrl, onDataChange }) => {
    const [employees, setEmployees] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState({ name: '', emailAddress: '', password: '', role: 'Security', age: '', contactNumber: '', NIC: '', shift: 'Day' });
    const [formError, setFormError] = useState('');

    const fetchEmployees = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/employees`);
            setEmployees(await res.json());
        } catch (error) { console.error("Failed to fetch employees:", error); }
    }, [apiUrl]);

    useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

    const handleInputChange = (e) => setCurrentEmployee({ ...currentEmployee, [e.target.name]: e.target.value });
    
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        const url = isEditing ? `${apiUrl}/employees/${currentEmployee._id}` : `${apiUrl}/employees`;
        const method = isEditing ? 'PUT' : 'POST';
        const payload = { ...currentEmployee };
        if (isEditing && !payload.password) delete payload.password;
        
        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.msg || 'Failed to save employee.');
            }
            setIsEditing(false);
            setCurrentEmployee({ name: '', emailAddress: '', password: '', role: 'Security', age: '', contactNumber: '', NIC: '', shift: 'Day' });
            await fetchEmployees();
            if (onDataChange) onDataChange();
        } catch (error) { 
            console.error("Form submit error:", error);
            setFormError(error.message);
        }
    };

    const handleEdit = (employee) => {
        setIsEditing(true);
        setCurrentEmployee({ ...employee, password: '' });
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await fetch(`${apiUrl}/employees/${id}`, { method: 'DELETE' });
                await fetchEmployees();
                if (onDataChange) onDataChange();
            } catch (error) { console.error("Failed to delete employee", error); }
        }
    };
    
    return (
        <div className="bg-[#40403E] p-5 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-600 pb-4">Manage All Employee Accounts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-3">
                        <input name="name" value={currentEmployee.name} onChange={handleInputChange} placeholder="Name" required className="w-full bg-[#262525] p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        <input name="emailAddress" type="email" value={currentEmployee.emailAddress} onChange={handleInputChange} placeholder="Email (for login)" required className="w-full bg-[#262525] p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        <input name="password" type="password" value={currentEmployee.password} onChange={handleInputChange} placeholder={isEditing ? "New Password (optional)" : "Password"} required={!isEditing} className="w-full bg-[#262525] p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        <select name="role" value={currentEmployee.role} onChange={handleInputChange} className="w-full bg-[#262525] p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500">
                            <option value="Security">Security Officer</option>
                            <option value="Admin">Administrator</option>
                            <option value="Manager">Manager</option>
                        </select>
                        {currentEmployee.role === 'Security' && (
                            <>
                                <input name="age" type="number" value={currentEmployee.age} onChange={handleInputChange} placeholder="Age" className="w-full bg-[#262525] p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                <input name="contactNumber" value={currentEmployee.contactNumber} onChange={handleInputChange} placeholder="Contact Number" className="w-full bg-[#262525] p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                <input name="NIC" value={currentEmployee.NIC} onChange={handleInputChange} placeholder="NIC" className="w-full bg-[#262525] p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                <select name="shift" value={currentEmployee.shift} onChange={handleInputChange} className="w-full bg-[#262525] p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500">
                                    <option value="Day">Day Shift</option>
                                    <option value="Night">Night Shift</option>
                                    <option value="Half Day">Half Day Shift</option>
                                </select>
                            </>
                        )}
                        {formError && <p className="text-red-400 text-sm text-center bg-red-900/50 p-2 rounded">{formError}</p>}
                        <button type="submit" className="w-full bg-[#C16D00] hover:bg-orange-600 p-2 rounded font-bold">{isEditing ? 'Update Employee' : 'Add Employee'}</button>
                        {isEditing && <button type="button" onClick={() => { setIsEditing(false); setCurrentEmployee({ name: '', emailAddress: '', password: '', role: 'Security', age: '', contactNumber: '', NIC: '', shift: 'Day' }); }} className="w-full bg-gray-600 hover:bg-gray-700 p-2 rounded mt-2">Cancel Edit</button>}
                    </form>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">All Employees List</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {employees.map(emp => (
                            <div key={emp._id} className="bg-[#262525] p-3 rounded flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{emp.name} <span className="text-sm font-light text-gray-400">({emp.employeeID})</span></p>
                                    <p className="text-xs text-gray-300">{emp.emailAddress} - <span className="font-semibold">{emp.role}</span></p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(emp)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs rounded">Edit</button>
                                    <button onClick={() => handleDelete(emp._id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 text-xs rounded">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- UPDATED: EmployeeManagementView now acts as a container with tabs ---
const EmployeeManagementView = ({ apiUrl, onDataChange }) => {
    const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' or 'shifts'

    const tabButtonStyle = "py-2 px-4 text-sm font-semibold rounded-t-lg focus:outline-none";
    const activeTabStyle = "bg-[#40403E] text-white";
    const inactiveTabStyle = "bg-[#2d2d2d] text-gray-400 hover:bg-[#383838]";

    return (
        <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="border-b border-gray-600">
                <button
                    onClick={() => setActiveTab('accounts')}
                    className={`${tabButtonStyle} ${activeTab === 'accounts' ? activeTabStyle : inactiveTabStyle}`}
                >
                    Security Officer Accounts
                </button>
                <button
                    onClick={() => setActiveTab('shifts')}
                    className={`${tabButtonStyle} ${activeTab === 'shifts' ? activeTabStyle : inactiveTabStyle}`}
                >
                    Shift Management
                </button>
            </div>

            {/* Conditional Content */}
            <div>
                {activeTab === 'accounts' && <AllEmployeesManager apiUrl={apiUrl} onDataChange={onDataChange} />}
                {activeTab === 'shifts' && <ShiftManager apiUrl={apiUrl} onDataChange={onDataChange} />}
            </div>
        </div>
    );
};


// --- Incident Management View with Assignment ---
// ... (No changes in this component or the components below)
const IncidentManagementView = ({ apiUrl, onDataChange }) => {
    const [incidents, setIncidents] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentIncident, setCurrentIncident] = useState({ type: 'Suspicious Activity', severity: 'Medium', description: '', status: 'Open' });
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);

    const fetchIncidents = useCallback(async () => {
        try {
            const res = await fetch(`${apiUrl}/incidents`);
            const data = await res.json();
            setIncidents(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        } catch (error) { console.error("Failed to fetch incidents:", error); }
    }, [apiUrl]);

    useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

    const handleInputChange = (e) => setCurrentIncident({ ...currentIncident, [e.target.name]: e.target.value });
    
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing ? `${apiUrl}/incidents/${currentIncident._id}` : `${apiUrl}/incidents`;
        const method = isEditing ? 'PUT' : 'POST';
        try {
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currentIncident) });
            setIsEditing(false);
            setCurrentIncident({ type: 'Suspicious Activity', severity: 'Medium', description: '', status: 'Open' });
            await fetchIncidents();
            if (onDataChange) onDataChange();
        } catch (error) { console.error("Form submit error:", error); }
    };

    const handleEdit = (incident) => { setIsEditing(true); setCurrentIncident(incident); };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await fetch(`${apiUrl}/incidents/${id}`, { method: 'DELETE' });
                await fetchIncidents();
                if (onDataChange) onDataChange();
            } catch (error) { console.error("Failed to delete incident:", error); }
        }
    };

    const handleAssignClick = (incident) => { setSelectedIncident(incident); setShowAssignModal(true); };
    const closeAssignModal = () => { 
        setSelectedIncident(null); 
        setShowAssignModal(false); 
        fetchIncidents();
        if (onDataChange) onDataChange();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#40403E] p-5 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Incident' : 'Report New Incident'}</h2>
                <form onSubmit={handleFormSubmit} className="space-y-3">
                    <select name="type" value={currentIncident.type} onChange={handleInputChange} className="w-full bg-[#262525] p-2 rounded"><option>Suspicious Activity</option><option>Unauthorized Entry</option><option>Parking Violation</option><option>Accident</option><option>Other</option></select>
                    <select name="severity" value={currentIncident.severity} onChange={handleInputChange} className="w-full bg-[#262525] p-2 rounded"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
                    <textarea name="description" value={currentIncident.description} onChange={handleInputChange} placeholder="Description" rows="4" className="w-full bg-[#262525] p-2 rounded"></textarea>
                    <select name="status" value={currentIncident.status} onChange={handleInputChange} className="w-full bg-[#262525] p-2 rounded"><option>Open</option><option>Under Investigation</option><option>Resolved</option><option>Closed</option></select>
                    <button type="submit" className="w-full bg-[#C16D00] hover:bg-orange-600 p-2 rounded font-bold">{isEditing ? 'Update Incident' : 'Submit Report'}</button>
                    {isEditing && <button type="button" onClick={() => {setIsEditing(false); setCurrentIncident({ type: 'Suspicious Activity', severity: 'Medium', description: '', status: 'Open' });}} className="w-full bg-gray-600 hover:bg-gray-700 p-2 rounded mt-2">Cancel Edit</button>}
                </form>
            </div>
            <div className="bg-[#40403E] p-5 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">All Incidents</h2>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {incidents.map(inc => (
                        <div key={inc._id} className="bg-[#262525] p-3 rounded">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold">{inc.type} <span className="text-xs font-light text-gray-400">(ID: {inc.incidentID})</span></p>
                                    <p className="text-sm text-gray-300 mt-1">{inc.description}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0 ml-4">
                                    <button onClick={() => handleEdit(inc)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs rounded">Edit</button>
                                    <button onClick={() => handleDelete(inc._id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 text-xs rounded">Delete</button>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-2 flex justify-between items-center border-t border-gray-700 pt-2">
                                <span>Severity: <span className="font-semibold text-yellow-400">{inc.severity}</span></span>
                                <span>Status: <span className="font-semibold text-green-400">{inc.status}</span></span>
                                <span>Assigned: <span className="font-semibold text-cyan-400">{inc.assignedOfficer ? inc.assignedOfficer.name : 'Unassigned'}</span></span>
                                <button onClick={() => handleAssignClick(inc)} className="bg-gray-600 hover:bg-gray-700 px-2 py-0.5 text-xs rounded">Assign</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showAssignModal && <AssignOfficerModal incident={selectedIncident} apiUrl={apiUrl} onClose={closeAssignModal} />}
        </div>
    );
};
const AssignOfficerModal = ({ incident, apiUrl, onClose }) => {
    const [onShiftOfficers, setOnShiftOfficers] = useState([]);
    const [selectedOfficer, setSelectedOfficer] = useState('');
    useEffect(() => {
        const fetchAndFilterOfficers = async () => {
            try {
                const res = await fetch(`${apiUrl}/employees`);
                const allEmployees = await res.json();
                const currentHour = new Date().getHours();
                const isDayTime = currentHour >= 7 && currentHour < 19;
                
                setOnShiftOfficers(allEmployees.filter(emp => {
                    if (emp.role === 'Security') {
                        if (isDayTime) {
                            return emp.shift === 'Day' || emp.shift === 'Half Day';
                        } else {
                            return emp.shift === 'Night';
                        }
                    }
                    return false;
                }));
            } catch (error) { console.error("Error fetching officers:", error); }
        };
        fetchAndFilterOfficers();
    }, [apiUrl]);
    const handleAssign = async () => {
        if (!selectedOfficer) return;
        try {
            await fetch(`${apiUrl}/incidents/${incident._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignedOfficer: selectedOfficer, status: 'Under Investigation' })
            });
            onClose();
        } catch(error) { console.error("Failed to assign officer", error); }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-[#2d2d2d] p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Assign Officer to Incident #{incident.incidentID}</h3>
                <p className="text-sm text-gray-400 mb-4">Only officers currently on shift are shown.</p>
                <select value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)} className="w-full bg-[#40403E] p-2 rounded mb-4">
                    <option value="">Select an Officer</option>
                    {onShiftOfficers.map(officer => (
                        <option key={officer._id} value={officer._id}>{officer.name} ({officer.employeeID})</option>
                    ))}
                </select>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Cancel</button>
                    <button onClick={handleAssign} className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded">Assign</button>
                </div>
            </div>
        </div>
    );
};

// --- REDESIGNED: Reports View with Default Data ---
const ReportsView = ({ apiUrl }) => {
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
    });
    const [endDate, setEndDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const handleGenerateReport = useCallback(async (start, end) => {
        setLoading(true);
        setError('');
        setReportData(null);
        try {
            const res = await fetch(`${apiUrl}/reports/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: start, endDate: end })
            });
            if (!res.ok) throw new Error('Failed to generate report');
            setReportData(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        handleGenerateReport(startDate, endDate);
    }, [handleGenerateReport, startDate, endDate]);

    const handleDownloadPdf = () => {
        window.print();
    };

    const formatDateForInput = (date) => {
        const adjustedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return adjustedDate.toISOString().split('T')[0];
    }
    
    if (loading && !reportData) return <div className="text-center p-8">Loading initial report for the last 30 days...</div>;

    return (
        <div className="space-y-6">
             <style>
             {`
                @media print {
                    body { background-color: white !important; }
                    .non-printable-area { display: none !important; }
                    .printable-area { 
                        visibility: visible !important; 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        height: auto; 
                        box-shadow: none; 
                        border-radius: 0;
                        background-color: white !important;
                    }
                    .printable-area, .printable-area * { 
                        color: black !important; 
                    }
                    .page-break { page-break-after: always; }
                }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(0.8);
                    cursor: pointer;
                }
             `}
             </style>
            <div className="bg-[#40403E] p-5 rounded-lg non-printable-area">
                <h2 className="text-xl font-semibold mb-4">Generate System Report</h2>
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Start Date</label>
                        <input 
                            type="date"
                            value={formatDateForInput(startDate)}
                            onChange={(e) => setStartDate(new Date(e.target.value))}
                            className="w-full bg-[#262525] p-2 rounded mt-1 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">End Date</label>
                        <input 
                            type="date"
                            value={formatDateForInput(endDate)}
                            onChange={(e) => setEndDate(new Date(e.target.value))}
                            className="w-full bg-[#262525] p-2 rounded mt-1 text-white"
                        />
                    </div>
                    <button onClick={() => handleGenerateReport(startDate, endDate)} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                    {reportData && ( <button onClick={handleDownloadPdf} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Download as PDF</button> )}
                </div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>

            {loading && <p>Generating new report...</p>}
            
            {reportData && (
                <div id="report-content" className="bg-[#40403E] p-5 rounded-lg printable-area">
                    <div className="text-center mb-8 hidden print:block">
                        <img src="/asserts/autoslot_logo.jpeg" alt="AutoSlot Logo" className="h-16 mx-auto mb-4"/>
                        <h2 className="text-3xl font-bold text-black">AutoSlot System Report</h2>
                        <p className="text-gray-600">
                            Report for period: {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
                        </p>
                    </div>
                    <div className="mb-8 page-break">
                        <h3 className="text-2xl font-semibold mb-4 border-b-2 border-gray-600 pb-2">Vehicle Type Analysis</h3>
                        <ul className="list-disc list-inside">
                            {Object.entries(reportData.scans.flatMap(s => s.detectedVehicles).reduce((acc, v) => { acc[v.vehicleType] = (acc[v.vehicleType] || 0) + 1; return acc; }, {})).map(([type, count]) => (
                                <li key={type} className="text-lg">{type}: <span className="font-bold">{count}</span> detections</li>
                            ))}
                        </ul>
                         <p className="text-lg font-bold mt-4">Total Vehicles Detected: {reportData.scans.reduce((acc, s) => acc + s.detectedVehicles.length, 0)}</p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold mb-4 border-b-2 border-gray-600 pb-2">Incident Report</h3>
                        {reportData.incidents.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead><tr className="border-b-2 border-gray-600"><th className="p-2 font-bold">ID</th><th className="p-2 font-bold">TYPE</th><th className="p-2 font-bold">SEVERITY</th><th className="p-2 font-bold">ASSIGNED</th><th className="p-2 font-bold">TIMESTAMP</th></tr></thead>
                                <tbody>
                                    {reportData.incidents.map(inc => (
                                        <tr key={inc._id} className="border-b border-gray-700">
                                            <td className="p-2">{inc.incidentID}</td><td className="p-2">{inc.type}</td>
                                            <td className="p-2">{inc.severity}</td><td className="p-2">{inc.assignedOfficer ? inc.assignedOfficer.name : 'N/A'}</td>
                                            <td className="p-2">{new Date(inc.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p className="text-gray-400">No incidents were reported in this period.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;