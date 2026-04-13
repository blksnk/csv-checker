import { createBrowserRouter, RouterProvider } from "react-router";
import { PAGE_ROUTES } from "./pages";

const router = createBrowserRouter(PAGE_ROUTES);

export const Router = () => {
  return <RouterProvider router={router} />;
};
