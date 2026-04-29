import { useEffect } from "react";
import { useRouter } from "next/navigation";

const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

export function useAutoLogout() {
  const router = useRouter();

  useEffect(() => {
    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    const checkInactivity = () => {
      const last = localStorage.getItem("lastActivity");
      if (!last) return;

      const diff = Date.now() - parseInt(last);

      if (diff > INACTIVITY_LIMIT) {
        handleLogout();
      }
    };

    const handleLogout = () => {
      localStorage.clear();
      router.push("/login");
    };

    // Track activity
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);

    // Sync across tabs
    window.addEventListener("storage", checkInactivity);

    // Check every 1 minute
    const interval = setInterval(checkInactivity, 60000);

    // Initialize
    updateActivity();

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("storage", checkInactivity);
      clearInterval(interval);
    };
  }, [router]);
}