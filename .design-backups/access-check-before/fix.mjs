import fs from 'node:fs';
const p='frontend/src/pages/workingMemory/ImprovementActivityWM.jsx';let s=fs.readFileSync(p,'utf8');
const a=s.indexOf('const cachedAccessState =');const b=s.indexOf('const PATTERN_HOW_TO_PLAY_VIDEO',a);s=s.slice(0,a)+s.slice(b);
s=s.replace('useState(() => cachedAccessState(levelNumber, subCategoryKey))','useState("checking")');s=s.replace('  const [accessState, setAccessState] = useState("checking");','  const [accessState, setAccessState] = useState("checking");\n  const [accessRetry, setAccessRetry] = useState(0);');
s=s.replace(/  useEffect\(\(\) => \{\r?\n    fetchProfile\(\);\r?\n  \}, \[\]\);\r?\n/, '');
const start=s.indexOf('  useEffect(() => {\n    const studentId = localStorage.getItem("studentId");');
const startCR=s.indexOf('  useEffect(() => {\r\n    const studentId = localStorage.getItem("studentId");');
const x=start>=0?start:startCR;const y=s.indexOf('  }, [levelNumber, subCategoryKey]);',x)+'  }, [levelNumber, subCategoryKey]);'.length;
if(x<0)throw Error('access effect not found');
s=s.slice(0,x)+`  useEffect(() => {
    let cancelled = false;
    const checkAccess = async () => {
      setAccessState("checking");
      try {
        // Use the authenticated profile ID, just as the level map does. A
        // legacy localStorage ID can be absent or refer to a different session.
        const profileResponse = await getStudentProfile({ refresh: true });
        const student = profileResponse.data;
        if (!student?._id) throw new Error("Student profile unavailable");
        if (cancelled) return;
        setProfile(student);
        sessionStorage.setItem(WM_PROFILE_CACHE, JSON.stringify(student));
        const response = await getStudentProgress(student._id);
        if (cancelled) return;
        const progress = response?.data;
        if (response?.success === false || typeof progress?.isIdentificationCompleted !== "boolean") {
          throw new Error("Improvement progress unavailable");
        }
        sessionStorage.setItem(WM_PROGRESS_CACHE, JSON.stringify(progress));
        setTotalStars(readTotalStars(progress));
        const level = progress.levelsProgress?.find((item) => item.levelNumber === Number(levelNumber));
        const activity = level?.subCategories?.find((item) => item.subCategoryKey === subCategoryKey);
        setAccessState(!progress.isIdentificationCompleted
          ? "denied_identification"
          : activity?.isUnlocked ? "allowed" : "denied_locked");
      } catch {
        // A connection/server error says nothing about screening completion.
        if (!cancelled) setAccessState("error");
      }
    };
    void checkAccess();
    return () => { cancelled = true; };
  }, [levelNumber, subCategoryKey, accessRetry]);`+s.slice(y);
const f=s.indexOf('  const fetchProfile = async () => {');const fend=s.indexOf('  // Match the child-friendly',f);if(f<0||fend<0)throw Error('profile helper not found');s=s.slice(0,f)+s.slice(fend);
fs.writeFileSync(p,s);
