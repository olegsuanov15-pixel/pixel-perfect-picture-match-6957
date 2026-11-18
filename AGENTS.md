<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->
<!-- AGENT-MEMORY:BEGIN -->
- Submit guest and authenticated map_points through validated server functions with pending status, explicit consents, a honeypot and an atomic database frequency gate; derive signed-in identity from the verified bearer.
- Only admin roles in user_roles may moderate; validate has_role server-side before privileged reads or writes, never trust client role values.
- Keep profiles and avatar storage owner-private; signed-in pages live under the client-only authenticated layout because browser sessions are unavailable during SSR.
- Share the header, mountain artwork and footer in the root shell; use separate content routes with individual metadata for discoverable navigation.
- Render maps from simplified Natural Earth geometry and coordinate-positioned approved markers, so no map credentials or tile requests are needed.
- Public readers use the narrow public_map_points function, which exposes only approved city-level marks with consent and excludes hidden profiles; profile details and guest deletion capabilities remain private.
- Geocode structured city/country components only through an authenticated admin action and cache centers; never accept participant coordinates or precise addresses.
- Resolve moderation coordinates from city cache/geocoding, then bundled country centers, with validated admin-only manual city/country centers as a last resort; never cache a country fallback under a city key.
- Keep profile drafts in the edit form and await participant-query refresh before switching to the read-only view, so saved details and avatar stay current; mount toast notifications once in the root shell.
- Complete managed OAuth only after session hydration, carrying a sanitized same-origin return path in sessionStorage; route empty profiles to editing with a Google-name draft rather than persisting unconfirmed profile details.
- Grant automatic roles through verified-email auth lifecycle triggers and check admin via server-side has_role RPC, so client metadata cannot grant privileges.
- Keep messaging writes in authenticated database RPCs with locked conversation transitions and private RLS; this prevents bypassing pending, blocks, bans and decline cooldowns through client calls.
- Share one signed-in Realtime subscription in the account menu and invalidate messaging queries; this keeps unread badges and active chats synchronized without duplicate channels.
- Expose participant contact fields only through authenticated narrow RPCs and sign peer avatars after inbox authorization; email and private profiles must never reach public pages.
- Enforce rolling messaging frequency limits in write triggers using one per-account transaction lock and private event rows; requests, retries and first messages must share atomic rollback-safe enforcement across all dialogs.
- Share the surname view between the canonical Cyrillic surname URL and legacy family URLs; public cards use published-only RLS, editorial writes require server-verified admin, and guest stories use validated server writes with a private atomic frequency gate.
<!-- AGENT-MEMORY:END -->
