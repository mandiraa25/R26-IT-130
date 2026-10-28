// VIVA: React holds form feedback; services call the backend; the router opens the next page.
import { useState } from "react";
import { login } from "../../services/auth/api";
import { getStudentProfile } from "../../services/student/api";
import { useNavigate, Link } from "react-router-dom";
import { validateLoginForm } from "../../utils/authValidation";

// VIVA: FILE CONTENTS - sign-in background/board, email/password form, validation messages and account links.
function Login() {
  const navigate = useNavigate();

  // VIVA: Inputs update form; field errors, server errors and the pending request have separate state.
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // VIVA: Input names select the property to update, so both inputs share one handler.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors(current => ({ ...current, [e.target.name]: "" }));
  };

  // VIVA: Stop browser submission, validate locally, then ask the server to verify credentials.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateLoginForm(form);
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) return;
    setLoading(true);

    try {
      const res = await login({ email: form.email.trim().toLowerCase(), password: form.password });

      // VIVA: The shared API client reads this JWT for later authenticated requests.
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("studentId", res.data.userId);

      // VIVA: Warm the profile cache without making dashboard navigation wait for another request.
      void getStudentProfile({ refresh: true }).catch(() => {});

      navigate("/dashboard");
    } catch (err) {
      setServerError(err.response?.data?.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // VIVA: The background and vine board are static public assets; the HTML form sits over them.
  return (
    <div
      className="relative flex h-dvh items-start justify-center overflow-hidden bg-center bg-no-repeat px-4 pt-[min(26vh,210px)]"
      style={{
        backgroundImage: "url('/images/auth/signin-bg.webp')",
        backgroundSize: "100% 100%",
      }}
    >
      <div className="relative aspect-[3/2] w-[min(59vw,720px)] max-w-full scale-75">
        {/* VIVA: SIGN-IN BOARD - decorative artwork behind the live form. */}
        <img
          src="/images/auth/signin-vine-board.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
        />

        <div className="absolute inset-[23%_13%_10%] z-10 flex flex-col justify-center">
          <header className="mb-3 text-center">
            <h2 className="text-xl font-extrabold text-[#25364a] sm:text-2xl">Welcome Back</h2>
          </header>

          {/* VIVA: SIGN-IN FORM - submitting calls handleSubmit to validate and request login. */}
          <form onSubmit={handleSubmit} noValidate className="mx-auto w-full max-w-md space-y-3">
              {/* VIVA: EMAIL FIELD - onChange records the email; field errors appear underneath. */}
              <div>
                <label className="mb-1 block text-sm font-bold text-[#49351f]">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border-2 border-[#dfc79e] bg-white/85 px-4 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-[#65a832] focus:ring-4 focus:ring-green-100/70 placeholder:text-gray-400"
                  onChange={handleChange}
                />
                {errors.email && <p className="mt-1 text-xs font-semibold text-red-600">{errors.email}</p>}
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  {/* VIVA: PASSWORD FIELD AND RECOVERY LINK - password input is directly below this row. */}
                  <label className="text-sm font-bold text-[#49351f]">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-bold text-[#287b25] transition-colors hover:text-[#145d2a]">
                    Forgot password?
                  </Link>
                </div>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border-2 border-[#dfc79e] bg-white/85 px-4 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-[#65a832] focus:ring-4 focus:ring-green-100/70 placeholder:text-gray-400"
                  onChange={handleChange}
                />
                {errors.password && <p className="mt-1 text-xs font-semibold text-red-600">{errors.password}</p>}
              </div>

              {/* VIVA: SERVER FEEDBACK - display login errors returned by the request. */}
              {serverError && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-700">{serverError}</p>}

              {/* VIVA: SIGN-IN BUTTON - submits the form and is disabled while the request is pending. */}
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

          {/* VIVA: SIGN-UP LINK - opens the separate registration screen. */}
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
