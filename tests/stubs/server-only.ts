// No-op stub for the `server-only` / `client-only` marker packages in the
// Vitest (node) environment. Those packages exist only to make a build fail if
// a server/client module is imported into the wrong bundle — there is no such
// bundle boundary under unit tests, so they resolve to nothing here. This lets
// the pure functions in modules that *also* (transitively) import server-only
// source readers — e.g. assembleCatalog/buildTopicIndex in src/lib/search —
// stay unit-testable. The DB readers are never invoked by those pure tests.
export {};
