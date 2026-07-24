/**
 * Auth client (ACCOUNTS.md §4.5). Imported ONLY by the /signin and /account
 * page components (their own code-split chunks) — never by the shared
 * layout, nav or any calculator. The nav shows account state via the tiny
 * hand-written session probe in `session-probe.ts`, not this client, so the
 * shared bundle stays inside the SPEC §13 budget.
 */

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    magicLinkClient(),
    // Mirrors server.ts's user.additionalFields (the age band — ACCOUNTS
    // §7.7). Declared as a plain schema so no server module is imported.
    inferAdditionalFields({
      user: { ageBand: { type: "string", required: false, input: true } },
    }),
  ],
});

export const { useSession, signOut } = authClient;
