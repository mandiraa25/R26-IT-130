import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import { getStudentProfile } from "../../services/student/api";

function Sample() {
  const navigate = useNavigate();
  const { t } = useTranslation('pa');
  const clickSound = useRef(new Audio("/click.mp3"));
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getStudentProfile();
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleClick = (path) => {
    clickSound.current.currentTime = 0;
    clickSound.current.play();

    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  return (
    <div className="w-full overflow-x-hidden">

      {/* ================= HERO ================= */}
      <div className="relative min-h-screen flex items-center justify-center">

        {/* Background */}
        <img
          src="/images/phonologicalAwareness/8.png"
          alt="background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Overlay (better readability) */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Language Switcher */}
        <div className="absolute top-8 right-8 z-20">
          <LanguageSwitcher />
        </div>

        {/* Cards Grid */}
        <div className="relative z-10 w-full max-w-6xl px-6 flex justify-center">

          {profile && (
            <div
              onClick={() => handleClick(`/identificationActivities-pa/${profile.grade}`)}
              className="relative w-[280px] md:w-[360px] cursor-pointer transform transition-all duration-300 hover:scale-110 active:scale-95"
            >
              {/* Card Image */}
              <img
                src="/images/phonologicalAwareness/7.png"
                alt={t("identification")}
                className="w-full h-auto object-contain drop-shadow-2xl"
              />

              {/* Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <p className="text-white font-black text-center text-xl md:text-2xl drop-shadow-lg">
                  {t("common:grade")} {profile.grade}<br/>
                  {t("common:identification")}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= WAVE ================= */}
      <div className="relative -mt-16">
        <svg
          viewBox="0 0 1440 150"
          className="w-full h-[120px] scale-y-[-1]"
          preserveAspectRatio="none"
        >
          <path
            fill="#67b962"
            d="M0,64L60,74.7C120,85,240,107,360,106.7C480,107,600,85,720,80C840,75,960,85,1080,101.3C1200,117,1320,139,1380,149.3L1440,160V0H0Z"
          />
        </svg>
      </div>

      {/* ================= EBOOK ================= */}
      <div className="bg-[#67b962] text-white py-20 px-6 md:px-20">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          {t("improve_spelling_ebook")}
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">

          <div className="flex-1 flex justify-center">
            <img
              src="/images/phonologicalAwareness/ebook.png"
              className="w-[260px] sm:w-[320px] md:w-[400px] rounded-xl shadow-2xl border-4 border-white"
            />
          </div>

          <div className="flex-1 text-center md:text-left text-lg leading-relaxed">
            <p className="mb-6">
              {t("ebook_desc")}
            </p>

            <p className="font-bold text-xl">
              {t("master_speller")}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Sample;