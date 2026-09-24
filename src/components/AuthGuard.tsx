
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session", {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          router.replace("/login");
          return;
        }

        setChecking(false);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070a] text-white/50">
        Checking authorization...
      </div>
    );
  }

  return <>{children}</>;
}
