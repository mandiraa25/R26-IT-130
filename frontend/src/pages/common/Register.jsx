import { useState } from "react";
import { registerStudent } from "../../services/auth/api";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../../assets/register-bg.png";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    age: "",
    email: "",
    password: "",
    grade: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.grade) {
      alert("Please select your grade");
      return;
    }
    setLoading(true);
    try {
      await registerStudent(form);
      alert("Registered successfully");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative h-dvh overflow-hidden bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover" }}
    >
      <Link to="/" className="absolute right-4 top-4 z-20 rounded-2xl border border-emerald-100 bg-[#fffdf7] px-5 py-3 text-sm font-semibold text-slate-700 shadow-lg transition-transform hover:-translate-y-0.5 sm:right-7 sm:top-6">
        Already have an account? <span className="ml-1 font-black text-emerald-700">Sign In →</span>
      </Link>

      <main className="relative z-10 flex h-full items-center justify-center px-4 py-14 sm:px-8 sm:py-10">
        <section className="w-full max-w-xl rounded-[1.75rem] border border-[#eee5d7] bg-[#fffdf8]/95 p-5 shadow-[0_22px_60px_rgba(46,82,30,0.2)] sm:translate-x-[2.5cm] sm:p-7">
          <header className="mb-4 text-center">
            <h1 className="text-3xl font-black tracking-tight text-[#145d2a] sm:text-4xl">LexiLand</h1>
            <p className="mt-1 text-sm font-medium italic text-slate-600 sm:text-base">Start your educational adventure</p>
            <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-[#5b9f2d]" />
            <h2 className="mt-2 text-xl font-bold text-gray-800 sm:text-2xl">Create Account</h2>
          </header>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-800">Full Name</label>
                <input name="fullName" required placeholder="John Doe" className="w-full rounded-xl border border-[#ddd6ca] bg-white px-4 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-[#65a832] focus:ring-4 focus:ring-green-100" value={form.fullName} onChange={handleChange} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-800">Age</label>
                <input name="age" type="number" required placeholder="10" className="w-full rounded-xl border border-[#ddd6ca] bg-white px-4 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-[#65a832] focus:ring-4 focus:ring-green-100" value={form.age} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">Grade</label>
              <select name="grade" required className="w-full rounded-xl border border-[#ddd6ca] bg-white px-4 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-[#65a832] focus:ring-4 focus:ring-green-100" value={form.grade} onChange={handleChange}>
                <option value="" disabled>Select Grade</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">Email Address</label>
              <input name="email" type="email" required placeholder="name@example.com" className="w-full rounded-xl border border-[#ddd6ca] bg-white px-4 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-[#65a832] focus:ring-4 focus:ring-green-100" value={form.email} onChange={handleChange} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">Password</label>
              <input name="password" type="password" required placeholder="••••••••" className="w-full rounded-xl border border-[#ddd6ca] bg-white px-4 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-[#65a832] focus:ring-4 focus:ring-green-100" value={form.password} onChange={handleChange} />
            </div>

            <button type="submit" disabled={loading} className={`mt-1 w-full rounded-full border-b-4 py-3 text-base font-black uppercase tracking-wide text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-1 ${loading ? "cursor-not-allowed border-green-700 bg-green-400" : "border-[#347912] bg-gradient-to-b from-[#72bd32] to-[#46950f] hover:brightness-105"}`}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Register;
