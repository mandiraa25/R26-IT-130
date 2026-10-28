// VIVA: Services persist the profile; cache helpers give an immediate display while fresh data loads.
import { useState, useEffect } from "react";
import { getStudentProfile, updateStudentProfile } from "../../services/student/api";
import { getCachedProfile, clearCachedProfile, toProfileFormState } from "../../utils/studentProfileCache";
import { validateFullName, validateSchool } from "../../utils/authValidation";
import StudentAvatar from "../../components/common/StudentAvatar";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Toast from "../../components/ui/Toast";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

const PROFILE_BG = "/images/profile/profile-bg.jpeg";
const PROFILE_SIDEBAR_BOARD = "/images/profile/profile-sidebar-board.png";

// VIVA: A presentational wrapper: children supply the actual input or select element.
function ProfileField({ icon, iconBg, label, children }) {
  return (
    <div className="profile-field flex items-start gap-3">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-base shadow-sm sm:h-11 sm:w-11 sm:text-lg ${iconBg}`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <label className="mb-1 block text-sm font-bold text-[#49351f]">{label}</label>
        {children}
      </div>
    </div>
  );
}

const fieldInputClass =
  "w-full rounded-xl border-2 border-[#dfc79e] bg-white/95 px-4 py-2.5 text-slate-800 outline-none transition focus:border-[#65a832] focus:ring-4 focus:ring-green-100/70";

// VIVA: FILE CONTENTS - profile background, photo/sidebar, per-module stars, editable form, save and logout.
function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  // VIVA: profile is the editable draft; initialProfile is the last loaded/saved comparison snapshot.
  const cachedProfile = getCachedProfile();
  const [loading, setLoading] = useState(!cachedProfile);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(() =>
    cachedProfile
      ? toProfileFormState(cachedProfile)
      : {
          fullName: "",
          email: "",
          grade: "",
          gender: "",
          school: "",
          profilePhoto: "",
          totalStars: 0,
          moduleStars: { workingMemory: 0, phonologicalAwareness: 0, speech: 0 },
        }
  );
  const [initialProfile, setInitialProfile] = useState(() =>
    cachedProfile ? toProfileFormState(cachedProfile) : null
  );
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // VIVA: Logout removes local credentials and cached profile data, then opens sign-in.
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("studentId");
    clearCachedProfile();
    navigate("/");
  };

  // VIVA: Only editable fields participate; unchanged forms cannot submit through the Save button.
  const hasChanges =
    initialProfile &&
    (profile.fullName !== initialProfile.fullName ||
      profile.grade !== initialProfile.grade ||
      profile.gender !== initialProfile.gender ||
      profile.school !== initialProfile.school ||
      profile.profilePhoto !== initialProfile.profilePhoto);

  // VIVA: Fetch once on mount even if cached data already made the page visible.
  useEffect(() => {
    fetchProfile();
  }, []);

  // VIVA: Refresh both draft and snapshot; keep an existing cached display if the request fails.
  const fetchProfile = async () => {
    const hasCachedProfile = Boolean(getCachedProfile());
    if (!hasCachedProfile) {
      setLoading(true);
    }

    try {
      const res = await getStudentProfile({ refresh: true });
      const data = toProfileFormState(res.data);
      setProfile(data);
      setInitialProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (!hasCachedProfile) {
        setToast({ show: true, message: t("failed_load_profile"), type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  // VIVA: All named text/select controls share this controlled-input handler.
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // VIVA: Preview/store the selected photo as a data URL; this handler rejects files larger than 5 MB.
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ show: true, message: t("file_too_large"), type: "error" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // VIVA: Validate name/school, PUT editable fields, then mark the current draft as saved.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validateFullName(profile.fullName) || validateSchool(profile.school);
    if (problem) {
      setToast({ show: true, message: problem, type: "error" });
      return;
    }
    setSaving(true);
    try {
      await updateStudentProfile({
        fullName: profile.fullName.trim(),
        grade: profile.grade,
        gender: profile.gender,
        school: profile.school.trim(),
        profilePhoto: profile.profilePhoto,
      });
      setInitialProfile({ ...profile });
      setToast({ show: true, message: t("profile_updated_success"), type: "success" });
    } catch (err) {
      console.error("Error updating profile:", err);
      setToast({
        show: true,
        message: err.response?.data?.message || "Failed to update profile.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${PROFILE_BG}')` }}
      >
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-700" />
      </div>
    );
  }

  // VIVA: Sidebar shows identity/rewards; the form edits profile data and Toast displays request feedback.
  return (
    <div className="profile-page relative min-h-dvh overflow-x-hidden">
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${PROFILE_BG}')` }}
        aria-hidden="true"
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/4 via-transparent to-black/8" aria-hidden="true" />

      {/* Language — top right (logo stays visible from background, top left) */}
      <div className="fixed right-4 top-4 z-30 rounded-full border-2 border-white/90 bg-[#fffdf2]/95 px-2 py-1 shadow-md sm:right-6 sm:top-5 sm:px-3">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="profile-layout flex w-full max-w-[1120px] flex-col items-center justify-center gap-5 lg:flex-row lg:items-center lg:gap-6">
          {/* VIVA: PROFILE SIDEBAR - back button, photo picker, identity, stars and logout are here. */}
          <div className="profile-layout__sidebar-col flex w-full max-w-[310px] flex-col lg:max-w-[330px]">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="profile-back-btn mb-2 inline-flex w-fit items-center rounded-full border-2 border-white/90 bg-[#fffdf2]/95 px-4 py-2 text-sm font-bold text-[#2f7a28] shadow-md transition-transform hover:-translate-y-0.5 sm:px-5"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t("back_to_dashboard")}
            </button>

            <aside className="profile-sidebar relative w-full">
              <img
                src={PROFILE_SIDEBAR_BOARD}
                alt=""
                aria-hidden="true"
                className="profile-sidebar__board block h-auto w-full"
              />

              <div className="profile-sidebar__content absolute inset-[13%_11%_12%_11%] flex flex-col items-center text-center">
                <div className="relative">
                  <div className="h-[84px] w-[84px] overflow-hidden rounded-full border-[3px] border-[#d4a017] bg-emerald-100 shadow-md sm:h-[92px] sm:w-[92px]">
                    <StudentAvatar photo={profile.profilePhoto} alt={t("profile")} className="block h-full w-full" />
                  </div>
                  <label className="absolute -bottom-0.5 -right-0.5 grid h-8 w-8 cursor-pointer place-items-center rounded-full border-2 border-white bg-[#3d9b2f] text-white shadow-md transition-transform hover:scale-105">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {/* VIVA: PHOTO PICKER - the camera label opens this hidden input and handleFileChange previews it. */}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>

                <h2 className="mt-3 text-lg font-black text-[#2f7a28] sm:text-xl">{profile.fullName}</h2>
                <p className="mt-0.5 max-w-full truncate px-1 text-[11px] font-semibold text-[#5b493a] sm:text-xs">
                  {profile.email}
                </p>

                <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[#7b4fd1] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm sm:text-[11px]">
                  <span aria-hidden="true">⭐</span>
                  {profile.grade ? `${t("grade")} ${profile.grade}` : t("not_set")}
                </div>

                <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-yellow-100 px-4 py-2 shadow-inner">
                  <span className="text-2xl" aria-hidden="true">⭐</span>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-800/80">
                      {t("total_stars")}
                    </p>
                    <p className="text-xl font-black leading-none text-amber-950 tabular-nums">
                      {Number(profile.totalStars) || 0}
                    </p>
                  </div>
                </div>

                {/* VIVA: MODULE REWARDS - render each module's badge and saved star count. */}
                <ul className="mt-2 mb-2 grid w-full max-w-[212px] grid-cols-4 gap-1.5">
                  {[
                    { id: "wm", key: "working_memory", color: "text-[#ea580c]", stars: profile.moduleStars?.workingMemory },
                    { id: "rp", key: "reading_processing", color: "text-[#0284c7]", stars: null },
                    { id: "pa", key: "phonological_awareness", color: "text-[#16a34a]", stars: profile.moduleStars?.phonologicalAwareness },
                    { id: "sp", key: "speech_processing", color: "text-[#9333ea]", stars: profile.moduleStars?.speech },
                  ].map((module) => {
                    const soon = module.stars === null;
                    const label = `${t(module.key)}: ${soon ? t("coming_soon") : `${Number(module.stars) || 0} ${t("stars")}`}`;
                    return (
                      <li
                        key={module.id} title={label} aria-label={label}
                        className="flex flex-col items-center gap-0.5 rounded-xl border border-amber-200/80 bg-[#fffaf0] px-0.5 pt-1 pb-0.5 shadow-inner"
                      >
                        <img
                          src={`/images/dashboard/reference-style/badge-${module.id}.png`} alt="" draggable="false"
                          className={`h-7 w-7 object-contain ${soon ? "opacity-50 grayscale" : ""}`}
                        />
                        {soon ? (
                          <span className="text-[10px] leading-4" aria-hidden="true">🔒</span>
                        ) : (
                          <span className={`text-[11px] font-black leading-4 tabular-nums ${module.color}`} aria-hidden="true">
                            {Number(module.stars) || 0}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-auto flex w-full max-w-[200px] items-center justify-center gap-2 rounded-xl border-b-4 border-[#2a6018] bg-gradient-to-b from-[#4caf35] to-[#3d8f2a] px-4 py-2.5 text-sm font-black text-white shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  {t("logout_account")}
                </button>
              </div>
            </aside>
          </div>

          {/* VIVA: PROFILE FORM - editable student fields and the save button are in this right panel. */}
          <section className="profile-form-panel w-full max-w-[640px] flex-1 rounded-[1.75rem] border-2 border-[#e8dcc4] bg-[#fff9ee]/96 p-5 shadow-[0_14px_32px_rgba(36,72,52,0.16)] sm:p-7 lg:p-8">
            <header className="mb-5 sm:mb-6">
              <h3 className="flex items-center gap-2 text-lg font-black text-[#2f5f28] sm:text-xl">
                <span aria-hidden="true">🌱</span>
                {t("hello_this_is_profile")}
              </h3>
              <p className="mt-1 text-xs font-semibold text-[#6b5a45] sm:text-sm">{t("profile_manage_subtitle")}</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <ProfileField icon="👤" iconBg="bg-[#e8f5e3] text-[#3d9b2f]" label={t("full_name")}>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  className={fieldInputClass}
                  placeholder="Enter your full name"
                  required
                />
              </ProfileField>

              {/* VIVA: EMAIL DISPLAY - this field is read-only and is excluded from the update payload. */}
              <ProfileField icon="✉️" iconBg="bg-[#e8f5e3] text-[#3d9b2f]" label={t("email_address")}>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border-2 border-[#eadfce] bg-[#f3efe6] px-4 py-2.5 text-gray-500 outline-none"
                />
              </ProfileField>

              <ProfileField icon="🎓" iconBg="bg-[#fff0d6] text-[#e8740c]" label={t("grade")}>
                <select
                  name="grade"
                  value={profile.grade}
                  onChange={handleChange}
                  className={`${fieldInputClass} appearance-none`}
                  required
                >
                  <option value="" disabled>
                    {t("select_grade")}
                  </option>
                  <option value="2">{t("grade")} 2</option>
                  <option value="3">{t("grade")} 3</option>
                  <option value="4">{t("grade")} 4</option>
                </select>
              </ProfileField>

              <ProfileField icon="👤" iconBg="bg-[#fce8f3] text-[#d64f9f]" label={t("gender")}>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className={`${fieldInputClass} appearance-none`}
                >
                  <option value="">{t("not_set")}</option>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                  <option value="other">{t("other")}</option>
                </select>
              </ProfileField>

              <ProfileField icon="🏫" iconBg="bg-[#e3eef9] text-[#2f7fd6]" label={t("school")}>
                <input
                  type="text"
                  name="school"
                  value={profile.school}
                  onChange={handleChange}
                  className={fieldInputClass}
                  placeholder="Enter your school name"
                />
              </ProfileField>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || !hasChanges}
                  className={`w-full rounded-full border-b-4 py-3 text-base font-black text-white shadow-lg transition-all active:translate-y-0.5 ${
                    saving || !hasChanges
                      ? "cursor-not-allowed border-gray-500 bg-gray-400 opacity-70"
                      : "border-[#347912] bg-gradient-to-b from-[#72bd32] to-[#46950f] hover:-translate-y-0.5"
                  }`}
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <svg className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {t("saving_changes")}
                    </span>
                  ) : (
                    t("save_profile_changes")
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <style>{`
        .profile-sidebar {
          transform: translateX(-1.5cm);
        }

        .profile-sidebar__board {
          display: block;
          width: 100%;
          height: auto;
        }
        .profile-form-panel {
          min-height: clamp(400px, 52vh, 500px);
          transform: translateX(-1cm);
        }
        @media (min-width: 1024px) {
          .profile-layout__sidebar-col {
            margin-top: 0;
          }
          .profile-form-panel {
            align-self: center;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;
