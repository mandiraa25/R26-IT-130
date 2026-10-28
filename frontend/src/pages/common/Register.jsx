// VIVA: Local form state and validators run before the registration service sends account data.
import { useState } from "react";
import { registerStudent } from "../../services/auth/api";
import { useNavigate, Link } from "react-router-dom";
const bgImage = "/images/auth/register-bg.webp";
import { MAX_AGE, MIN_AGE, validateRegistrationForm } from "../../utils/authValidation";

const inputClass = (error) => `w-full rounded-xl border bg-white px-4 py-2.5 text-slate-800 shadow-sm outline-none transition focus:ring-4 ${error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-[#ddd6ca] focus:border-[#65a832] focus:ring-green-100"}`;

// VIVA: Reused beneath inputs; the id connects each message to aria-describedby.
function FieldError({ id, message }) {
  return message ? <p id={id} className="mt-1 text-xs font-semibold text-red-600">{message}</p> : null;
}

// VIVA: FILE CONTENTS - registration scene, student details/password form, field errors and sign-in link.
function Register() {
  const navigate = useNavigate();

  // VIVA: Controlled inputs read these values; errors and loading determine feedback and button state.
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    // Re-check a field the child is correcting, so its message clears as soon as it is fixed.
    if (errors[e.target.name] || (e.target.name === "password" && errors.confirmPassword)) {
      const fresh = validateRegistrationForm(next);
      setErrors(current => Object.fromEntries(Object.keys(current).filter(key => fresh[key]).map(key => [key, fresh[key]])));
    }
  };

  // VIVA: Validate every field before creating the account; the server repeats the validation.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateRegistrationForm(form);
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) return;
    setLoading(true);
    try {
      // VIVA: Confirmation is a browser-only check; normalize the actual registration payload.
      const { confirmPassword: _confirm, ...details } = form;
      await registerStudent({ ...details, fullName: details.fullName.trim(), email: details.email.trim().toLowerCase(), age: Number(details.age) });
      // VIVA: Registration returns a token, but this screen requires a separate sign-in afterward.
      alert("Registered successfully");
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      setServerError(data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // VIVA: Only reference an error element when that message is actually rendered.
  const describedBy = name => (errors[name] ? `${name}-error` : undefined);

  // VIVA: Static artwork supplies the scene; the responsive panel contains the editable form.
  return (
    <div
      className="relative h-dvh overflow-hidden bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover" }}
    >
      {/* VIVA: EXISTING-ACCOUNT LINK - returns to Sign In. */}
      <Link to="/" className="absolute right-4 top-4 z-20 rounded-2xl border border-emerald-100 bg-[#fffdf7] px-5 py-3 text-sm font-semibold text-slate-700 shadow-lg transition-transform hover:-translate-y-0.5 sm:right-7 sm:top-6">
        Already have an account? <span className="ml-1 font-black text-emerald-700">Sign In →</span>
      </Link>

      {/* VIVA: REGISTRATION PANEL - the student fields and submit button are rendered inside this panel. */}
      <main className="relative z-10 flex h-full items-center justify-center overflow-y-auto px-4 py-14 sm:px-8 sm:py-10">
        <section className="w-full max-w-xl rounded-[1.75rem] border border-[#eee5d7] bg-[#fffdf8]/95 p-5 shadow-[0_22px_60px_rgba(46,82,30,0.2)] sm:translate-x-[2.5cm] sm:p-7">
          <header className="mb-4 text-center">
            <h1 className="text-3xl font-black tracking-tight text-[#145d2a] sm:text-4xl">LexiLand</h1>
            <p className="mt-1 text-sm font-medium italic text-slate-600 sm:text-base">Start your educational adventure</p>
            <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-[#5b9f2d]" />
            <h2 className="mt-2 text-xl font-bold text-gray-800 sm:text-2xl">Create Account</h2>
          </header>

          {/* VIVA: STUDENT DETAILS - name/age, grade, email and password fields update form state. */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="mb-1 block text-sm font-bold text-slate-800">Full Name</label>
                <input id="fullName" name="fullName" autoComplete="name" maxLength={60} placeholder="Nimal Perera" aria-invalid={Boolean(errors.fullName)} aria-describedby={describedBy("fullName")} className={inputClass(errors.fullName)} value={form.fullName} onChange={handleChange} />
                <FieldError id="fullName-error" message={errors.fullName} />
              </div>
              <div>
                <label htmlFor="age" className="mb-1 block text-sm font-bold text-slate-800">Age</label>
                <input id="age" name="age" type="number" inputMode="numeric" min={MIN_AGE} max={MAX_AGE} step={1} placeholder={`${MIN_AGE}–${MAX_AGE}`} aria-invalid={Boolean(errors.age)} aria-describedby={describedBy("age")} className={inputClass(errors.age)} value={form.age} onChange={handleChange} />
                <FieldError id="age-error" message={errors.age} />
              </div>
            </div>

            <div>
              <label htmlFor="grade" className="mb-1 block text-sm font-bold text-slate-800">Grade</label>
              <select id="grade" name="grade" aria-invalid={Boolean(errors.grade)} aria-describedby={describedBy("grade")} className={inputClass(errors.grade)} value={form.grade} onChange={handleChange}>
                <option value="" disabled>Select Grade</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
              </select>
              <FieldError id="grade-error" message={errors.grade} />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-bold text-slate-800">Email Address</label>
              <input id="email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="name@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={describedBy("email")} className={inputClass(errors.email)} value={form.email} onChange={handleChange} />
              <FieldError id="email-error" message={errors.email} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                {/* VIVA: PASSWORD AND CONFIRMATION - browser validation checks strength and equality. */}
                <label htmlFor="password" className="mb-1 block text-sm font-bold text-slate-800">Password</label>
                <input id="password" name="password" type="password" autoComplete="new-password" maxLength={64} placeholder="8+ letters & numbers" aria-invalid={Boolean(errors.password)} aria-describedby={describedBy("password")} className={inputClass(errors.password)} value={form.password} onChange={handleChange} />
                <FieldError id="password-error" message={errors.password} />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-bold text-slate-800">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" maxLength={64} placeholder="Type it again" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={describedBy("confirmPassword")} className={inputClass(errors.confirmPassword)} value={form.confirmPassword} onChange={handleChange} />
                <FieldError id="confirmPassword-error" message={errors.confirmPassword} />
              </div>
            </div>

            {/* VIVA: REGISTRATION FEEDBACK - server errors appear above the Create Account button. */}
            {serverError && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{serverError}</p>}

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
