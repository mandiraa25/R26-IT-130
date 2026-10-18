import { useEffect, useState } from "react";
import { getStudentProfile } from "../../../../services/student/api";
import { getCachedProfile } from "../../../../utils/studentProfileCache";

// Show the cached student immediately, retaining it if the refresh fails.
export default function useReportProfile() {
  const [profile, setProfile] = useState(() => getCachedProfile());
  useEffect(() => {
    let cancelled = false;
    getStudentProfile({ refresh: true }).then(response => {
      if (!cancelled && response?.data) setProfile(response.data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return profile;
}
