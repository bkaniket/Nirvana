"use client";

import { useAutoLogout } from "../app/hooks/useAutoLogout";

export default function AppClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useAutoLogout(); // 👈 runs globally

  return <>{children}</>;
}