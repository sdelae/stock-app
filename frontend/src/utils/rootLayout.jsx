import React from "react";
import { Outlet } from "react-router-dom";
// import "react-toastify/dist/ReactToastify.css";
import SignInpage from "../pages/SignInPage";

export default function RootLayout() {
  // const { user } = useUser();

  return (
    <div className="font-inter ">
      <Outlet />
    </div>
  );
}
