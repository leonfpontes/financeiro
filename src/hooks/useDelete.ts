"use client";

import { useState } from "react";

interface UseDeleteResult {
  deleteId: string | null;
  deleting: boolean;
  promptDelete: (id: string) => void;
  cancelDelete: () => void;
  confirmDelete: () => Promise<void>;
}

/**
 * Manages the delete confirmation lifecycle (prompt → confirm → execute → callback).
 * @param buildUrl - Function that maps an item id to its DELETE endpoint URL
 * @param onSuccess - Callback invoked after a successful deletion (typically reload())
 */
export function useDelete(
  buildUrl: (id: string) => string,
  onSuccess: () => void,
): UseDeleteResult {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const promptDelete = (id: string) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(buildUrl(deleteId), { method: "DELETE" });
    setDeleting(false);
    setDeleteId(null);
    onSuccess();
  };

  return { deleteId, deleting, promptDelete, cancelDelete, confirmDelete };
}
