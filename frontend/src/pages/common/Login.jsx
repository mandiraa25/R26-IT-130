import { useState } from "react";
import { login } from "../../services/auth/api";
import { getStudentProfile } from "../../services/student/api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("studentId", res.data.userId);

      void getStudentProfile({ refresh: true }).catch(() => {});

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex h-dvh items-start justify-center overflow-hidden bg-center bg-no-repeat px-4 pt-[min(26vh,210px)]"
      style={{
        backgroundImage: "url('/images/auth/signin-bg.png')",
        backgroundSize: "100% 100%",
      }}
    >
      <div className="relative aspect-[3/2] w-[min(59vw,720px)] max-w-full scale-75">
        <img
          src="/images/auth/signin-vine-board.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
        />

        <div className="absolute inset-[23%_13%_10%] z-10 flex flex-col justify-center">
          <header className="mb-3 text-center">
            <h2 className="text-xl font-extrabold text-[#25364a] sm:text-2xl">Welcome Back</h2>
          </header>

          <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-3">
              <div>
                <label className="mb-1 block text-sm font-bold text-[#49351f]">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full rounded-xl border-2 border-[#dfc79e] bg-white/85 px-4 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-[#65a832] focus:ring-4 focus:ring-green-100/70 placeholder:text-gray-400"
                  onChange={handleChange}
                />
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  <label className="text-sm font-bold text-[#49351f]">
                    Password
                  </label>
                  <a href="#" className="text-xs font-bold text-[#287b25] transition-colors hover:text-[#145d2a]">
                    Forgot password?
                  </a>
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border-2 border-[#dfc79e] bg-white/85 px-4 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-[#65a832] focus:ring-4 focus:ring-green-100/70 placeholder:text-gray-400"
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-full border-b-4 py-2.5 font-black text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-1 ${
                  loading 
                    ? "cursor-not-allowed border-green-700 bg-green-400" 
                    : "border-[#347912] bg-gradient-to-b from-[#72bd32] to-[#46950f] hover:brightness-105"
                }`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
          </form>

          <div className="mt-3 text-center">
              <p className="text-sm font-medium text-[#59452f]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-black text-[#287b25] transition-colors hover:text-[#145d2a]"
                >
                  Create an account
                </Link>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
