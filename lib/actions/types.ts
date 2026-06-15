/**
 * Result of a Server Action. `ok` maps 1:1 to the old `res.ok` from the
 * fetch-based mutations, so client optimistic/rollback logic stays
 * unchanged. Domain errors are RETURNED (never thrown — Next masks
 * thrown errors in production); error strings reuse the old route
 * messages verbatim.
 */
export type ActionResult<T = void> =
	| { ok: true; data: T }
	| { ok: false; error: string };
