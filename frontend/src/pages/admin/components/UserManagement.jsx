// VIVA: OVERVIEW - Super-admin account directory with registration, editing, password reset and status actions.
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const QuickStat = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <h4 className="text-2xl font-black text-slate-900 leading-none">{value}</h4>
    </div>
  </div>
);

export default function UserManagement() {
  // VIVA: Separate directories and modal state support the student/admin tabs on one page.
  const [activeTab, setActiveTab] = useState("students"); // "students" or "admins"
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(null); // stores user object
  const [showEditModal, setShowEditModal] = useState(null); // stores user object

  const token = localStorage.getItem("adminToken");
  const loggedInUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const [resetPasswordValue, setResetPasswordValue] = useState("");

  const [addFormData, setAddFormData] = useState({
    userType: "student", // "student", "school admin", "super admin"
    fullName: "",
    email: "",
    password: "",
    grade: "2",
    gender: "male",
    school: ""
  });

  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    role: "school admin",
    school: "",
    grade: "2",
    gender: "male"
  });

  const fetchData = async () => {
    // VIVA: Independent reads load accounts and school choices together after each saved change.
    try {
      setLoading(true);
      const [studentsRes, adminsRes, schoolsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/students", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/admin/admins", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/admin/schools", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (studentsRes.data.success) setStudents(studentsRes.data.data);
      if (adminsRes.data.success) setAdmins(adminsRes.data.data);
      if (schoolsRes.data.success) setSchools(schoolsRes.data.data);
    } catch (err) {
      toast.error("Failed to load user directories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedInUser.role === "super admin") {
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  if (loggedInUser.role !== "super admin") {
    // VIVA: This browser check controls rendering; each management API also requires the role.
    return (
      <div className="p-8 bg-rose-50 border-4 border-rose-200 text-rose-700 font-black rounded-3xl text-center max-w-xl mx-auto mt-10 shadow-lg">
        🔒 ACCESS DENIED. Super Admin only.
      </div>
    );
  }

  // Register Handler
  const handleRegisterSubmit = async (e) => {
    // VIVA: Required-field checks give quick feedback before choosing the account-specific API.
    e.preventDefault();
    if (!addFormData.fullName || !addFormData.email || !addFormData.password) {
      toast.warn("Full Name, Email and Password are required");
      return;
    }

    try {
      let res;
      if (addFormData.userType === "student") {
        res = await axios.post("http://localhost:5000/api/admin/register-student", {
          fullName: addFormData.fullName,
          email: addFormData.email,
          password: addFormData.password,
          grade: addFormData.grade,
          gender: addFormData.gender,
          school: addFormData.school
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Admin
        res = await axios.post("http://localhost:5000/api/admin/register-admin", {
          fullName: addFormData.fullName,
          email: addFormData.email,
          password: addFormData.password,
          role: addFormData.userType,
          school: addFormData.school
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data.success) {
        toast.success("User registered successfully!");
        setShowAddModal(false);
        setAddFormData({
          userType: "student",
          fullName: "",
          email: "",
          password: "",
          grade: "2",
          gender: "male",
          school: ""
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  // Password Reset Handler
  const handlePasswordReset = async (e) => {
    // VIVA: This admin action sets a new password directly; it does not send a reset email.
    e.preventDefault();
    if (!resetPasswordValue) {
      toast.warn("Please enter a new password");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/admin/users/reset-password", {
        userId: showResetModal._id,
        newPassword: resetPasswordValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success("Password reset successfully!");
        setShowResetModal(null);
        setResetPasswordValue("");
      }
    } catch (err) {
      toast.error("Password reset failed");
    }
  };

  // Edit Submit Handler
  const handleEditSubmit = async (e) => {
    // VIVA: Student and admin records live in different collections and use different endpoints.
    e.preventDefault();
    const isStudent = showEditModal.role === "student" || showEditModal.grade !== undefined;

    try {
      let res;
      if (isStudent) {
        res = await axios.put("http://localhost:5000/api/admin/students/" + showEditModal._id, {
          fullName: editFormData.fullName,
          email: editFormData.email,
          grade: editFormData.grade,
          gender: editFormData.gender,
          school: editFormData.school
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.put("http://localhost:5000/api/admin/admins/" + showEditModal._id, {
          fullName: editFormData.fullName,
          email: editFormData.email,
          role: editFormData.role,
          school: editFormData.school
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data.success) {
        toast.success("User details updated successfully!");
        setShowEditModal(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // Deactivate / Reactivate Handler
  const handleToggleStatus = async (userId, currentStatus) => {
    // VIVA: Preserve the record while switching whether the account may log in.
    try {
      const res = await axios.post("http://localhost:5000/api/admin/users/toggle-status", {
        userId,
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success(`User status updated to ${!currentStatus ? "Active" : "Deactivated"}`);
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const openEditModal = (user) => {
    const isStudent = user.role === "student" || user.grade !== undefined;
    setEditFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "school admin",
      school: user.school || "",
      grade: user.grade || "2",
      gender: user.gender || "male"
    });
    setShowEditModal(user);
  };

  const totalAdmins = admins.length;
  const totalStudents = students.length;
  const activeAdmins = admins.filter(a => a.isActive !== false).length;
  const activeStudents = students.filter(s => s.isActive !== false).length;

  return (
    <div className="space-y-10">
      {/* VIVA: Summary cards for the current directory or result view. */}
      {/* Quick Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <QuickStat label="Total Registered Students" value={totalStudents} icon="🧑‍🎓" color="bg-emerald-50 text-emerald-600" />
        <QuickStat label="Active System Admins" value={`${activeAdmins} / ${totalAdmins}`} icon="🛡️" color="bg-indigo-50 text-indigo-600" />
        <QuickStat label="Active Students" value={`${activeStudents} / ${totalStudents}`} icon="🟢" color="bg-teal-50 text-teal-600" />
      </div>

      {/* VIVA: Directory table and its available record actions. */}
      {/* Main Panel Box */}
      <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
        {/* Header line */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">System User Directory</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Manage system access, permissions and credentials</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-4 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/10 transition-all uppercase tracking-wider text-xs cursor-pointer"
          >
            + Register User
          </button>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-slate-100 mb-6">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-6 py-3.5 text-sm font-black uppercase tracking-wider border-b-4 -mb-px transition-colors ${
              activeTab === "students" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Students ({totalStudents})
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`px-6 py-3.5 text-sm font-black uppercase tracking-wider border-b-4 -mb-px transition-colors ${
              activeTab === "admins" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            System Admins ({totalAdmins})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 font-black text-slate-400">Loading Directory...</div>
        ) : activeTab === "students" ? (
          /* Students Table */
          students.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold">No students registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              {/* VIVA: Tabular records with row-level details or actions. */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6 text-center">Grade</th>
                    <th className="py-4 px-6 text-center">Gender</th>
                    <th className="py-4 px-6">School</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold text-sm text-slate-700">
                  {students.map(s => (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-6 font-black text-slate-900">{s.fullName}</td>
                      <td className="py-5 px-6">{s.email}</td>
                      <td className="py-5 px-6 text-center">Grade {s.grade}</td>
                      <td className="py-5 px-6 text-center uppercase text-xs">{s.gender || "-"}</td>
                      <td className="py-5 px-6">{s.school || "Individual"}</td>
                      <td className="py-5 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                          s.isActive !== false ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {s.isActive !== false ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right space-x-2">
                        <button onClick={() => openEditModal(s)} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg">Edit</button>
                        <button onClick={() => setShowResetModal(s)} className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg">Reset Pass</button>
                        <button
                          onClick={() => handleToggleStatus(s._id, s.isActive !== false)}
                          className={`text-xs px-3 py-1.5 rounded-lg text-white ${
                            s.isActive !== false ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"
                          }`}
                        >
                          {s.isActive !== false ? "Deactivate" : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Admins Table */
          admins.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold">No admins registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              {/* VIVA: Tabular records with row-level details or actions. */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6 text-center">System Role</th>
                    <th className="py-4 px-6">Assigned School</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold text-sm text-slate-700">
                  {admins.map(a => (
                    <tr key={a._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-6 font-black text-slate-900">{a.fullName}</td>
                      <td className="py-5 px-6">{a.email}</td>
                      <td className="py-5 px-6 text-center text-xs">
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded font-black uppercase tracking-wider">
                          {a.role}
                        </span>
                      </td>
                      <td className="py-5 px-6">{a.school || "-"}</td>
                      <td className="py-5 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                          a.isActive !== false ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {a.isActive !== false ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right space-x-2">
                        <button onClick={() => openEditModal(a)} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg">Edit</button>
                        <button onClick={() => setShowResetModal(a)} className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg">Reset Pass</button>
                        <button
                          onClick={() => handleToggleStatus(a._id, a.isActive !== false)}
                          className={`text-xs px-3 py-1.5 rounded-lg text-white ${
                            a.isActive !== false ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"
                          }`}
                        >
                          {a.isActive !== false ? "Deactivate" : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* VIVA: Account creation dialog and account-specific fields. */}
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-zoomIn">
            <div className="flex justify-between items-center p-10 bg-slate-900 text-white relative">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Register New User Account</h3>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Super Admin Panel</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-2xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* VIVA: Form fields submit through the existing page handler. */}
            <form onSubmit={handleRegisterSubmit} className="p-10 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Category</label>
                <select
                  value={addFormData.userType}
                  onChange={(e) => setAddFormData({ ...addFormData, userType: e.target.value, school: "" })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                >
                  <option value="student">Student (Licensed Individual)</option>
                  <option value="school admin">School Administrator</option>
                  <option value="super admin">Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input type="text" value={addFormData.fullName} onChange={(e) => setAddFormData({ ...addFormData, fullName: e.target.value })} required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. John Doe" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input type="email" value={addFormData.email} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })} required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none" placeholder="name@lexiworld.com" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
                <input type="password" value={addFormData.password} onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })} required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none" placeholder="••••••••" />
              </div>

              {/* Student specific fields */}
              {addFormData.userType === "student" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Grade</label>
                    <select
                      value={addFormData.grade}
                      onChange={(e) => setAddFormData({ ...addFormData, grade: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="2">Grade 2</option>
                      <option value="3">Grade 3</option>
                      <option value="4">Grade 4</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Gender</label>
                    <select
                      value={addFormData.gender}
                      onChange={(e) => setAddFormData({ ...addFormData, gender: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* School Admin specific field (School Select dropdown) */}
              {addFormData.userType === "school admin" && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select School</label>
                  <select
                    value={addFormData.school}
                    onChange={(e) => setAddFormData({ ...addFormData, school: e.target.value })}
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                  >
                    <option value="">-- Select Registered School --</option>
                    {schools.map(sch => (
                      <option key={sch._id} value={sch.name}>{sch.name} ({sch.location})</option>
                    ))}
                  </select>
                  {schools.length === 0 && (
                    <p className="text-rose-500 text-xs font-bold mt-1.5">⚠️ Please register a school first in School Management.</p>
                  )}
                </div>
              )}

              {addFormData.userType === "student" && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">School Affiliation (Optional)</label>
                  <input type="text" value={addFormData.school} onChange={(e) => setAddFormData({ ...addFormData, school: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Royal College" />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-8 py-4 text-xs font-black text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-8 py-4 text-xs font-black text-white bg-indigo-600 rounded-2xl hover:bg-slate-900 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 uppercase tracking-widest"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIVA: Edit the selected account details. */}
      {/* Edit Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-zoomIn">
            <div className="flex justify-between items-center p-10 bg-slate-900 text-white relative">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Update User Account Details</h3>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Super Admin Panel</p>
              </div>
              <button
                onClick={() => setShowEditModal(null)}
                className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-2xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* VIVA: Form fields submit through the existing page handler. */}
            <form onSubmit={handleEditSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input type="text" value={editFormData.fullName} onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })} required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none" />
              </div>

              {/* Student specific fields */}
              {(showEditModal.role === "student" || showEditModal.grade !== undefined) ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Grade</label>
                      <select
                        value={editFormData.grade}
                        onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                      >
                        <option value="2">Grade 2</option>
                        <option value="3">Grade 3</option>
                        <option value="4">Grade 4</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Gender</label>
                      <select
                        value={editFormData.gender}
                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">School Affiliation</label>
                    <input type="text" value={editFormData.school} onChange={(e) => setEditFormData({ ...editFormData, school: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none" />
                  </div>
                </>
              ) : (
                /* Admin specific fields */
                <>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Role Type</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="school admin">school admin</option>
                      <option value="super admin">super admin</option>
                    </select>
                  </div>

                  {editFormData.role === "school admin" && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assigned School</label>
                      <select
                        value={editFormData.school}
                        onChange={(e) => setEditFormData({ ...editFormData, school: e.target.value })}
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                      >
                        <option value="">-- Select Registered School --</option>
                        {schools.map(sch => (
                          <option key={sch._id} value={sch.name}>{sch.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="flex-1 px-8 py-4 text-xs font-black text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-8 py-4 text-xs font-black text-white bg-indigo-600 rounded-2xl hover:bg-slate-900 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 uppercase tracking-widest"
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIVA: Set a replacement password for the selected account. */}
      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-zoomIn">
            <div className="flex justify-between items-center p-8 bg-slate-900 text-white relative">
              <div>
                <h3 className="text-xl font-black tracking-tight">Administrative Password Reset</h3>
                <p className="text-indigo-300 text-[9px] font-black uppercase tracking-[0.2em] mt-1">User: {showResetModal.fullName}</p>
              </div>
              <button
                onClick={() => {
                  setShowResetModal(null);
                  setResetPasswordValue("");
                }}
                className="bg-white/10 hover:bg-white/20 transition-all p-2 rounded-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* VIVA: Form fields submit through the existing page handler. */}
            <form onSubmit={handlePasswordReset} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Secure Password</label>
                <input
                  type="password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(null);
                    setResetPasswordValue("");
                  }}
                  className="flex-1 py-3 text-xs font-black text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 text-xs font-black text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-all active:scale-95 uppercase tracking-widest"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
