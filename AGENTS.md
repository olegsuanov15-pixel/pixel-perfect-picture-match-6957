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
- Read public catalog through Query-backed loaders; submit participant marks as authenticated owner-scoped pending rows so no submission publishes directly.
- Keep moderator roles in user_roles and validate them server-side and through RLS; record each pending-to-approved/rejected decision so public data cannot be changed by participants.
- Keep profiles and avatar storage owner-private; signed-in pages live under the client-only authenticated layout because browser sessions are unavailable during SSR.
- Share the header, mountain artwork and footer in the root shell; use separate content routes with individual metadata for discoverable navigation.
- Render maps from simplified Natural Earth geometry and coordinate-positioned approved markers, so no map credentials or tile requests are needed.
- Public readers use a publishable server client with RLS and explicit safe columns; require approved status and consent for marks and published source citations for history.
<!-- AGENT-MEMORY:END -->
