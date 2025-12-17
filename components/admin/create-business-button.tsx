"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CreateBusinessButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const create = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Rafiul Anam LLC",
          legalName: "Rafiul Anam LLC",
          type: "LLC",
          country: "USA",
          state: "FL",
          notes: "Florida LLC for Amazon FBA/FBM.",
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to create business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={create} disabled={loading}>
      {loading ? "Creating…" : "Create default Rafiul Anam LLC"}
    </Button>
  );
}
