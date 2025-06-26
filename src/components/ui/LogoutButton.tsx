// components/LogoutButton.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "./button";

export const LogoutButton = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="danger" size="md" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};
