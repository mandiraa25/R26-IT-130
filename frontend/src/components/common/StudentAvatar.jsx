import { useState } from "react";

// The student's uploaded profile photo, or the default LexiLand bunny when no
// photo is uploaded (or it fails to load). Used by the home page, profile and
// achievements so every profile icon shows the same picture.
export const DEFAULT_AVATAR = "/images/dashboard/activity-popup/bunny-separated.png";

// VIVA: FILE CONTENTS - shared avatar image with a bunny fallback when a profile photo is absent or fails.
export default function StudentAvatar({ photo, alt = "", className = "", imageClassName = "" }) {
  const [failedPhoto, setFailedPhoto] = useState(null);
  const hasPhoto = Boolean(photo) && failedPhoto !== photo;
  return (
    <span className={`student-avatar ${hasPhoto ? "student-avatar--photo" : "student-avatar--default"} ${className}`}>
      {/* VIVA: AVATAR IMAGE - photo and fallback share the same wrapper and onError handling. */}
      <img
        src={hasPhoto ? photo : DEFAULT_AVATAR}
        alt={alt}
        draggable="false"
        className={imageClassName}
        style={hasPhoto ? { width: "100%", height: "100%", objectFit: "cover" } : { width: "100%", height: "100%", objectFit: "contain", objectPosition: "center 20%", transform: "scale(1.15)" }}
        onError={() => { if (hasPhoto) setFailedPhoto(photo); }}
      />
    </span>
  );
}
