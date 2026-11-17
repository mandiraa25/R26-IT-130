/*
 * FILE PURPOSE
 * Shared language control used by the dashboard and Working Memory navigation.
 *
 * HOW IT CONNECTS
 * MemoryNav and Dashboard render this component. It changes the shared i18next language, which makes
 * WM components and bank lookups render English or Sinhala.
 * Direct source importers: ../../features/workingMemory/shared/GameLayout.jsx,
 * ../../pages/common/Dashboard.jsx, ../../pages/common/Profile.jsx,
 * ../../pages/phonologicalAwareness/ImprovementActivityPA.jsx,
 * ../../pages/phonologicalAwareness/sample.jsx.
 *
 * THINGS TO REMEMBER
 * This switch does not translate the database or rename stable answer IDs. Woodland appearance uses
 * shared wooden controls styles. Screen-specific :lang(si) rules adjust Sinhala text size.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { WoodenLanguageSwitch } from './WoodenNavControls';

// VIVA: REUSE - the woodland variant delegates to the same wooden language control used across screens.
const LanguageSwitcher = ({ variant, className }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language || 'en';

  if (variant === 'woodland') {
    return <WoodenLanguageSwitch className={className} />;
  }

  return (
    <div className="flex items-center bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-1.5 shadow-sm">
      {/* VIVA: LANGUAGE BUTTONS - choose English or Sinhala; the woodland variant is returned above. */}
      <button
        onClick={() => changeLanguage('en')}
        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
          currentLanguage.startsWith('en')
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('si')}
        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
          currentLanguage.startsWith('si')
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        සි
      </button>
    </div>
  );
};

export default LanguageSwitcher;
