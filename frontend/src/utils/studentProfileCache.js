const PROFILE_CACHE_KEY = "lexiland-student-profile";
const LEGACY_WM_CACHE_KEY = "wm-profile-cache";

export const getCachedProfile = () => {
  try {
    const raw =
      sessionStorage.getItem(PROFILE_CACHE_KEY) ||
      sessionStorage.getItem(LEGACY_WM_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCachedProfile = (profile) => {
  if (!profile) return;
  try {
    const serialized = JSON.stringify(profile);
    sessionStorage.setItem(PROFILE_CACHE_KEY, serialized);
    sessionStorage.setItem(LEGACY_WM_CACHE_KEY, serialized);
  } catch (err) {
    console.warn("Could not cache student profile:", err);
  }
};

export const clearCachedProfile = () => {
  sessionStorage.removeItem(PROFILE_CACHE_KEY);
  sessionStorage.removeItem(LEGACY_WM_CACHE_KEY);
};

export const toProfileFormState = (data) => ({
  fullName: data?.fullName || "",
  email: data?.email || "",
  grade: data?.grade || "",
  gender: data?.gender || "",
  school: data?.school || "",
  profilePhoto: data?.profilePhoto || "",
  totalStars: Math.max(0, Number(data?.totalStars ?? data?.totalCarrots) || 0),
});
