/** Standard idle/loading labels for Create, Update, and Delete actions. */
export const ACTION_LABELS = {
  create: { idle: "Create", loading: "Creating..." },
  update: { idle: "Update", loading: "Updating..." },
  save: { idle: "Save", loading: "Updating..." },
  delete: { idle: "Delete", loading: "Deleting..." },
};

/**
 * @param {'create'|'update'|'save'|'delete'} action
 * @param {boolean} isLoading
 * @param {string} [idleLabel] — override idle text (e.g. "Add User", "Delete job")
 */
export function actionButtonText(action, isLoading, idleLabel) {
  const labels = ACTION_LABELS[action];
  if (!labels) return idleLabel || "";
  return isLoading ? labels.loading : idleLabel ?? labels.idle;
}

/** Shared disabled-button opacity (matches user delete modal). */
export const actionButtonLoadingStyle = (isLoading) => ({
  opacity: isLoading ? 0.85 : 1,
});
