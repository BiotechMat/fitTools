/**
 * Account database access (ACCOUNTS.md §5). Neon serverless over HTTP —
 * built for Vercel functions, env-gated like everything else: with no
 * DATABASE_URL every helper reports unavailable and routes degrade to 503.
 * Only the account API routes import this; nothing client-side ever does.
 */

import { neon } from "@neondatabase/serverless";

type Sql = ReturnType<typeof neon>;

let sqlInstance: Sql | null = null;

export function dbEnabled(): boolean {
  return typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0;
}

function sql(): Sql {
  if (!dbEnabled()) throw new Error("DATABASE_URL is not configured");
  if (sqlInstance === null) sqlInstance = neon(process.env.DATABASE_URL as string);
  return sqlInstance;
}

type Row = Record<string, unknown>;

/**
 * Run a tagged query and give the rows one concrete shape. The neon driver's
 * template type is a union over its config generics; with the default config
 * it always yields `Record<string, any>[]`, so this single, commented cast
 * narrows it once for the whole module.
 */
async function query(strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]> {
  const result = await sql()(strings, ...values);
  return result as Row[]; // default neon config: rows as objects (see above)
}

/** Current privacy-policy version stamped onto consent rows (ACCOUNTS §7.1). */
export const CONSENT_POLICY_VERSION = "2026-07-24";

export type { ConsentKind } from "@/lib/auth/shared";
import type { ConsentKind } from "@/lib/auth/shared";

export interface StoredDocumentRow {
  namespace: string;
  doc: string; // serialised JSON (the wire format)
  updatedAt: string; // ISO
}

export async function fetchDocuments(userId: string): Promise<StoredDocumentRow[]> {
  const rows = await query`
    select namespace, doc::text as doc, updated_at
    from store_documents where user_id = ${userId}`;
  return rows.map((r) => ({
    namespace: String(r.namespace),
    doc: String(r.doc),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  }));
}

export async function fetchDocument(
  userId: string,
  namespace: string,
): Promise<StoredDocumentRow | null> {
  const rows = await query`
    select namespace, doc::text as doc, updated_at
    from store_documents where user_id = ${userId} and namespace = ${namespace}`;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    namespace: String(r.namespace),
    doc: String(r.doc),
    updatedAt: new Date(r.updated_at as string).toISOString(),
  };
}

/**
 * Conditional upsert (ACCOUNTS §6.1): `expectedUpdatedAt` is the etag the
 * client last saw — null means "I believe no server document exists".
 * Returns the new updatedAt on success, or null on a conflict (the caller
 * responds 409 with the current row so the client can re-merge).
 */
export async function putDocument(
  userId: string,
  namespace: string,
  version: number,
  doc: string,
  expectedUpdatedAt: string | null,
): Promise<string | null> {
  if (expectedUpdatedAt === null) {
    const rows = await query`
      insert into store_documents (user_id, namespace, version, doc, updated_at)
      values (${userId}, ${namespace}, ${version}, ${doc}::jsonb, now())
      on conflict (user_id, namespace) do nothing
      returning updated_at`;
    if (rows.length === 0) return null; // a document already exists — conflict
    return new Date(rows[0].updated_at as string).toISOString();
  }
  const rows = await query`
    update store_documents
    set doc = ${doc}::jsonb, version = ${version}, updated_at = now()
    where user_id = ${userId} and namespace = ${namespace}
      and updated_at = ${expectedUpdatedAt}::timestamptz
    returning updated_at`;
  if (rows.length === 0) return null; // stale etag or missing row — conflict
  return new Date(rows[0].updated_at as string).toISOString();
}

export interface ConsentRow {
  kind: string;
  grantedAt: string;
  revokedAt: string | null;
  policyVersion: string;
}

export async function fetchConsents(userId: string): Promise<ConsentRow[]> {
  const rows = await query`
    select kind, granted_at, revoked_at, policy_version
    from consents where user_id = ${userId}`;
  return rows.map((r) => ({
    kind: String(r.kind),
    grantedAt: new Date(r.granted_at as string).toISOString(),
    revokedAt: r.revoked_at === null ? null : new Date(r.revoked_at as string).toISOString(),
    policyVersion: String(r.policy_version),
  }));
}

export async function hasActiveConsent(userId: string, kind: ConsentKind): Promise<boolean> {
  const rows = await query`
    select 1 from consents
    where user_id = ${userId} and kind = ${kind} and revoked_at is null`;
  return rows.length > 0;
}

export async function grantConsent(userId: string, kind: ConsentKind): Promise<void> {
  await query`
    insert into consents (user_id, kind, granted_at, revoked_at, policy_version)
    values (${userId}, ${kind}, now(), null, ${CONSENT_POLICY_VERSION})
    on conflict (user_id, kind)
    do update set granted_at = now(), revoked_at = null,
                  policy_version = ${CONSENT_POLICY_VERSION}`;
}

/**
 * Revoke a consent AND delete the server copies it covered (ACCOUNTS §7.2:
 * "revoking deletes the gated server copies and keeps local ones").
 */
export async function revokeConsent(
  userId: string,
  kind: ConsentKind,
  coveredNamespaces: readonly string[],
): Promise<void> {
  await query`
    update consents set revoked_at = now()
    where user_id = ${userId} and kind = ${kind}`;
  if (coveredNamespaces.length > 0) {
    await query`
      delete from store_documents
      where user_id = ${userId} and namespace = any(${[...coveredNamespaces]})`;
  }
}

/**
 * Erasure (ACCOUNTS §7.3): immediate hard delete of everything —
 * documents, consents, sessions, linked accounts, verification rows and
 * the user record itself. Explicit deletes, no reliance on FK cascade.
 */
export async function deleteAccount(userId: string): Promise<void> {
  const s = sql();
  await s`delete from store_documents where user_id = ${userId}`;
  await s`delete from consents where user_id = ${userId}`;
  await s`delete from "session" where "userId" = ${userId}`;
  await s`delete from "account" where "userId" = ${userId}`;
  await s`delete from "user" where id = ${userId}`;
}
