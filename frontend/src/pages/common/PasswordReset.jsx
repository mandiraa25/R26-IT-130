import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../../services/auth/api";
import { validateEmail, validatePassword } from "../../utils/authValidation";

// Forgot / reset password screens, on the same vine board as Sign In.
const inputClass = (error) => `w-full rounded-xl border-2 bg-white/85 px-4 py-2.5 text-slate-800 shadow-sm outline-none transition focus:ring-4 placeholder:text-gray-400 ${error ? "border-red-400 focus:ring-red-100" : "border-[#dfc79e] focus:border-[#65a832] focus:ring-green-100/70"}`;
const buttonClass = (busy) => `w-full rounded-full border-b-4 py-2.5 font-black text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-1 ${busy ? "cursor-not-allowed border-green-700 bg-green-400" : "border-[#347912] bg-gradient-to-b from-[#72bd32] to-[#46950f] hover:brightness-105"}`;

function AuthBoard({ title, children }) {
  return (
    <div className="relative flex h-dvh items-start justify-center overflow-hidden bg-center bg-no-repeat px-4 pt-[min(26vh,210px)]" style={{ backgroundImage: "url('/images/auth/signin-bg.png')", backgroundSize: "100% 100%" }}>
      <div className="relative aspect-[3/2] w-[min(59vw,720px)] max-w-full scale-75">
        <img src="/images/auth/signin-vine-board.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
        <div className="absolute inset-[23%_13%_10%] z-10 flex flex-col justify-center">
          <header className="mb-3 text-center"><h2 className="text-xl font-extrabold text-[#25364a] sm:text-2xl">{title}</h2></header>
          {children}
          <p className="mt-3 text-center text-sm font-medium text-[#59452f]">
            <Link to="/" className="font-black text-[#287b25] transition-colors hover:text-[#145d2a]">← Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const Message = ({ tone, children }) => children ? <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl px-3 py-2 text-center text-sm font-semibold ${tone === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}>{children}</p> : null;

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const problem = validateEmail(email);
    setError(problem);
    setDone("");
    if (problem) return;
    setBusy(true);
    try {
      const res = await requestPasswordReset(email.trim().toLowerCase());
      setDone(res.data?.message || "A password reset link has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "We could not send the email. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthBoard title="Forgot Password">
      <form onSubmit={submit} noValidate className="mx-auto w-full max-w-md space-y-3">
        <p className="text-center text-sm font-medium text-[#59452f]">Enter the email you used to sign up. We will send you a link to choose a new password.</p>
        <div>
          <label htmlFor="reset-email" className="mb-1 block text-sm font-bold text-[#49351f]">Email Address</label>
          <input id="reset-email" type="email" autoComplete="email" placeholder="name@example.com" aria-invalid={Boolean(error)} className={inputClass(error)} value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
        </div>
        <Message tone="error">{error}</Message>
        <Message tone="ok">{done}</Message>
        <button type="submit" disabled={busy} className={buttonClass(busy)}>{busy ? "Sending..." : "Send Reset Link"}</button>
      </form>
    </AuthBoard>
  );
}

export function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ tone: "", text: "" });
  const [busy, setBusy] = useState(false);
  const linkValid = /^[a-f0-9]{64}$/.test(token) && !validateEmail(email);

  const submit = async (event) => {
    event.preventDefault();
    const found = { password: validatePassword(password), confirm: confirm === password ? "" : "Passwords do not match." };
    setErrors(found);
    if (found.password || found.confirm) return;
    setBusy(true);
    try {
      const res = await resetPassword({ email, token, password });
      setMessage({ tone: "ok", text: res.data?.message || "Your password has been changed." });
      window.setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setMessage({ tone: "error", text: err.response?.data?.message || "We could not change the password. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  if (!linkValid) {
    return (
      <AuthBoard title="Reset Password">
        <Message tone="error">This reset link is not valid. Please request a new one.</Message>
        <p className="mt-3 text-center"><Link to="/forgot-password" className="font-black text-[#287b25]">Request a new link</Link></p>
      </AuthBoard>
    );
  }

  return (
    <AuthBoard title="Choose a New Password">
      <form onSubmit={submit} noValidate className="mx-auto w-full max-w-md space-y-3">
        <div>
          <label htmlFor="new-password" className="mb-1 block text-sm font-bold text-[#49351f]">New Password</label>
          <input id="new-password" type="password" autoComplete="new-password" maxLength={64} placeholder="8+ letters & numbers" aria-invalid={Boolean(errors.password)} className={inputClass(errors.password)} value={password} onChange={e => { setPassword(e.target.value); setErrors({}); }} />
          {errors.password && <p className="mt-1 text-xs font-semibold text-red-600">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-1 block text-sm font-bold text-[#49351f]">Confirm Password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" maxLength={64} placeholder="Type it again" aria-invalid={Boolean(errors.confirm)} className={inputClass(errors.confirm)} value={confirm} onChange={e => { setConfirm(e.target.value); setErrors({}); }} />
          {errors.confirm && <p className="mt-1 text-xs font-semibold text-red-600">{errors.confirm}</p>}
        </div>
        <Message tone={message.tone}>{message.text}</Message>
        <button type="submit" disabled={busy || message.tone === "ok"} className={buttonClass(busy)}>{busy ? "Saving..." : "Change Password"}</button>
      </form>
    </AuthBoard>
  );
}
