"use client";

import { useScreenR } from "@/lib/screenr/store";

export default function ExportClient() {
  const { state } = useScreenR();

  // TODO: replace with real UI
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Export</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Exports in store: {state.exports?.length ?? 0}
      </p>
    </div>
  );
}

