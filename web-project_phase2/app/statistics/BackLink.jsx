// app/statistics/BackLink.jsx
'use client';

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BackLink() {
  const router = useRouter();

  const handleBack = async () => {
    await signOut({ redirect: false }); // Don't redirect automatically
    router.push('/admin_main.html'); // Manually redirect after sign out
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <button onClick={handleBack} className="back-button">
        ← Back
      </button>
    </div>
  );
}
