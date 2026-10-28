// VIVA: OVERVIEW - Super-admin school directory and registration form with a per-student cost preview.
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

export default function SchoolManagement() {
  // VIVA: Persisted schools populate the directory; formData is the unsaved modal draft.
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    studentCount: 0,
    grades: ["2", "3", "4"],
    plan: "monthly"
  });

  const token = localStorage.getItem("adminToken");
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const fetchSchools = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/schools", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setSchools(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch schools list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === "super admin") {
      fetchSchools();
    } else {
      setLoading(false);
    }
  }, []);

  if (user.role !== "super admin") {
    return (
      <div className="p-8 bg-rose-50 border-4 border-rose-200 text-rose-700 font-black rounded-3xl text-center max-w-xl mx-auto mt-10 shadow-lg">
        🔒 ACCESS DENIED. Super Admin only.
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "studentCount" ? Number(value) : value
    });
  };

  const handleGradesChange = (grade) => {
    const newGrades = formData.grades.includes(grade)
      ? formData.grades.filter(g => g !== grade)
      : [...formData.grades, grade];
    setFormData({ ...formData, grades: newGrades });
  };

  const handlePlanToggle = () => {
    setFormData({
      ...formData,
      plan: formData.plan === "monthly" ? "annual" : "monthly"
    });
  };

  const calculateCost = (count, planType) => {
    // VIVA: Preview the same per-student pricing that the server recalculates when saving.
    const costPerStudent = planType === "monthly" ? 500 : 4800;
    return count * costPerStudent;
  };

  const currentCost = calculateCost(formData.studentCount, formData.plan);

  const handleSubmit = async (e) => {
    // VIVA: Validate the draft before posting; successful creation refreshes the directory.
    e.preventDefault();
    if (!formData.name || !formData.location || formData.studentCount <= 0 || formData.grades.length === 0) {
      toast.warn("Please fill all fields and select at least one grade / student count");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/admin/schools", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("School registered successfully!");
        setShowAddModal(false);
        setFormData({
          name: "",
          location: "",
          studentCount: 0,
          grades: ["2", "3", "4"],
          plan: "monthly"
        });
        fetchSchools();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register school");
    }
  };

  // Calculations for quick stats
  const totalSchools = schools.length;
  const totalStudents = schools.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);
  const totalAnnualCost = schools.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  return (
    <div className="space-y-10">
      {/* VIVA: Summary cards for the current directory or result view. */}
      {/* Quick Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <QuickStat label="Registered Schools" value={totalSchools} icon="🏫" color="bg-indigo-50 text-indigo-600" />
        <QuickStat label="Total Licensed Students" value={totalStudents} icon="🧑‍🎓" color="bg-emerald-50 text-emerald-600" />
        <QuickStat label="Total Accumulated cost" value={`LKR ${totalAnnualCost.toLocaleString()}`} icon="💰" color="bg-amber-50 text-amber-600" />
      </div>

      {/* VIVA: Directory table and its available record actions. */}
      {/* Main List Section */}
      <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Schools Directory</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">Manage institutional subscriptions and rates</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-4 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/10 transition-all uppercase tracking-wider text-xs cursor-pointer"
          >
            + Register School
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 font-black text-slate-400">Loading Schools directory...</div>
        ) : schools.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-bold">No schools registered yet. Click button to register first.</div>
        ) : (
          <div className="overflow-x-auto">
            {/* VIVA: Tabular records with row-level details or actions. */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest pb-4">
                  <th className="py-4 px-6">School Name</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6 text-center">Grades</th>
                  <th className="py-4 px-6 text-center">Student Capacity</th>
                  <th className="py-4 px-6 text-center">Active Plan</th>
                  <th className="py-4 px-6 text-right">Subscription Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold text-sm text-slate-700">
                {schools.map((school) => (
                  <tr key={school._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-6 font-black text-slate-900">{school.name}</td>
                    <td className="py-5 px-6">{school.location}</td>
                    <td className="py-5 px-6 text-center">
                      <div className="flex gap-1 justify-center">
                        {school.grades.map(g => (
                          <span key={g} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">G{g}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">{school.studentCount}</td>
                    <td className="py-5 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        school.plan === "annual" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {school.plan}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right font-black text-indigo-600">LKR {school.cost?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIVA: School details, grade choices and billing-plan form. */}
      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-zoomIn">
            <div className="flex justify-between items-center p-10 bg-slate-900 text-white relative">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Register Institutional School</h3>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Super Admin Dashboard</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-white/10 hover:bg-white/20 transition-all p-3 rounded-2xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* VIVA: Form fields submit through the existing page handler. */}
            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">School Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Colombo Royal College" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Colombo 07" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Student Capacity</label>
                  <input type="number" name="studentCount" value={formData.studentCount} onChange={handleInputChange} required min="1"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Plan Period</label>
                  <div className="flex items-center gap-3 py-4">
                    <span className={`text-xs font-black uppercase ${formData.plan === "monthly" ? "text-indigo-600" : "text-slate-400"}`}>Monthly</span>
                    <button
                      type="button"
                      onClick={handlePlanToggle}
                      className="w-12 h-6 bg-slate-200 rounded-full p-1 relative flex items-center transition-colors focus:outline-none"
                    >
                      <div className={`w-4 h-4 bg-indigo-600 rounded-full transition-transform transform ${formData.plan === "annual" ? "translate-x-6" : ""}`} />
                    </button>
                    <span className={`text-xs font-black uppercase ${formData.plan === "annual" ? "text-indigo-600" : "text-slate-400"}`}>Annual</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Applicable Grades</label>
                <div className="flex gap-4">
                  {["2", "3", "4"].map(grade => {
                    const isChecked = formData.grades.includes(grade);
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => handleGradesChange(grade)}
                        className={`px-5 py-3 rounded-xl border-2 text-sm font-black transition-all ${
                          isChecked ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "bg-white border-slate-100 text-slate-400"
                        }`}
                      >
                        Grade {grade}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Calculated Cost</h5>
                  <p className="text-xs text-slate-400 font-medium">
                    {formData.plan === "monthly" ? "500 LKR" : "4800 LKR"} per student / {formData.studentCount} Students
                  </p>
                </div>
                <div className="text-2xl font-black text-indigo-600">LKR {currentCost.toLocaleString()}</div>
              </div>

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
                  Register School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
