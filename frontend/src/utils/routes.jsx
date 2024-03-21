import React from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import RootLayout from "./rootLayout";
import SignInpage from "../pages/SignInPage";
import SignupForm from "../pages/SignUpPage";
import MyStockPortfolio from "../pages/MyStockPortfolio";
import SummaryPortfolio from "./../pages/SummaryPortfolio";

export const routes = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path="/sign-in" element={<SignInpage />} />
      <Route path="/sign-up" element={<SignupForm />} />
      <Route path="/my-stock-summary" element={<MyStockPortfolio />} />
      <Route path="/summary-portfolio" element={<SummaryPortfolio />} />
    </Route>
  )
);

export default routes;
