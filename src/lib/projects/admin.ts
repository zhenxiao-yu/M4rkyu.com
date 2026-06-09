// Barrel for the project admin server actions. Implementations live in
// sibling modules under ./admin/ (each carries its own "use server"
// directive); shared NON-action helpers — Zod schemas, FormData parsing,
// row mapping, revalidation — live in ./admin/_shared.ts without the
// directive. The public import path `@/lib/projects/admin` and every
// exported name are preserved exactly.

export {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  duplicateProjectAction,
} from "./admin/crud";

export {
  setProjectStatusAction,
  reorderProjectAction,
  bulkSetProjectStatusAction,
  bulkDeleteProjectsAction,
} from "./admin/list-actions";

export {
  addProjectScreenshotAction,
  updateProjectScreenshotAction,
  deleteProjectScreenshotAction,
  reorderProjectScreenshotAction,
} from "./admin/screenshots";
