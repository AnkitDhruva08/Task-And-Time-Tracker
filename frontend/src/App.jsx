import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Login from './pages/Login';
// import CompanyDashboard from './pages/CompanyDashboard';
// import Role from './pages/Role'
// import AddEmployee from './pages/AddEmployee';
// import Login from './pages/Login';
// import AdminDahsboard from './pages/AdminDashboard';
// import HrDashboard from './pages/HrDashboard';
// import EmployeeDashboard from './pages/EmployeeDashboard';
// import BankDetails from './pages/BankDetails';
// import NomineeDetails from './pages/Nominee';
// import EmployeeDocuments from './pages/EmployeeDocuments';
// import EmergencyContact from './pages/EmergencyContact';
// import OfficeDetails from './pages/OfficeDetails';
// import Leave from './pages/Leave';
// import EmployeeTable from './pages/EmployeeTable';
// import LeaveTable from './pages/LeaveTable';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/login" element={<Login />} />

        {/* 
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDahsboard />} />
        <Route path="/hr-dashboard" element={<HrDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/employees/:id" element={<EmployeeDashboard />} />
        <Route path="/role" element={<Role />} />
        <Route path="/add-employees" element={<AddEmployee />} />
        <Route path="/add-employees/:id" element={<AddEmployee />} />
        <Route path="/bank-details" element={<BankDetails />} />
        <Route path="/bank-details/:id" element={<BankDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/nominees-details" element={<NomineeDetails />} />
        <Route path="/employee-documents" element={<EmployeeDocuments />} />
        <Route path="/employee-emeregency-contact" element={<EmergencyContact />} />
        <Route path="/employee-office-details" element={<OfficeDetails />} />
        <Route path="/leave-details" element={<Leave />} />
        <Route path="/employee-details" element={<EmployeeTable />} />
        <Route path="/leave-table" element={<LeaveTable />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
