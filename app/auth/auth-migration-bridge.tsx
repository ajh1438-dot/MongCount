"use client";

import { useEffect } from "react";

import { runPendingAuthMigration } from "@/lib/sync/auth-migration";

export function AuthMigrationBridge() {
  useEffect(() => {
    void runPendingAuthMigration();
  }, []);

  return null;
}
