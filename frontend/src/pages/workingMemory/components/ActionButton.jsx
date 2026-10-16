import React from "react";
import "../styles/redesign.css";

const ROOT = "/images/workingMemory/improve/buttons/LexiLand_3D_Buttons";

// Keep the original label in the accessibility tree and all native button props.
export default function ActionButton({ action = "play", children, className = "", ...props }) {
  return (
    <button type="button" {...props} className={`wm-action ${className}`} data-action={action}>
      <img src={`${ROOT}/${action}-button.png`} alt="" aria-hidden="true" draggable="false" />
      <span className="wm-action__label">{children}</span>
    </button>
  );
}
