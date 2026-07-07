"use client";

import { useEffect, useState } from "react";

export type User = {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: "student" | "admin";
};

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return user;
}