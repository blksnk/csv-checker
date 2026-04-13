import { createBrowserRouter, RouterProvider } from "react-router";
import { PAGE_ROUTES } from "./pages";

const router = createBrowserRouter(PAGE_ROUTES);

/**
 * Renders the browser router for {@link PAGE_ROUTES}.
 *
 * @return {JSX.Element} `RouterProvider` instance
 */
export const Router = () => {
  return <RouterProvider router={router} />;
};
