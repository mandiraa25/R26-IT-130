import { Outlet } from "react-router-dom";
import HomeButton from "./HomeButton";

// VIVA: FILE CONTENTS - reusable layout with the Home button and the child route rendered by Outlet.
function MainLayout() {
  return (
    <>
      {/* VIVA: SHARED NAVIGATION - show Home above whichever child page Outlet renders. */}
      <HomeButton />
      <Outlet />
    </>
  );
}

export default MainLayout;
