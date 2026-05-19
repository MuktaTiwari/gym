import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "./router";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/shared/ThemeProvider";
import { useAuthStore } from "./store/authStore";
import { getMeApi } from "./features/auth/authApi";

function App() {
  const { setAuth, logoutAction, setLoading } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getMeApi();
        if (data && data.success && data.data?.user) {
          // If active secure cookie is valid, restore session immediately
          setAuth(data.data.user, data.data.accessToken || "", data.data.refreshToken || "");
        } else {
          logoutAction();
        }
      } catch (err) {
        logoutAction();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setAuth, logoutAction, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
