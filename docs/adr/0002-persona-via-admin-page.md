# Persona edited via authenticated admin page

The Persona's system prompt contains real personal details about the Admin (the person being impersonated). We considered committing it as a file in the repo (`persona.md`) or mounting it as a server-side file edited over SSH, but both tie an edit to either a git commit of personal content or shell access. Instead, the Admin edits the Persona text through a small admin-only page/API, gated by its own password and separate from the Guest password, with changes applied immediately — no redeploy, no SSH, no personal data in version control.
