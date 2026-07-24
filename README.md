# Pasha

A private chat where guests talk to an AI playing a specific person. The persona's character and facts are set separately, through the admin page — the code itself contains nothing personal.

## Local development

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# fill in .env: GEMINI_API_KEY, GUEST_PASSWORD, ADMIN_PASSWORD, SECRET_KEY
uvicorn main:app --reload
```

Open http://127.0.0.1:8000 for guest login, and http://127.0.0.1:8000/admin/login for the admin page to edit the persona.

Generate `SECRET_KEY` once and keep it unchanged (changing it invalidates all active sessions):

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Deploying to Hetzner

1. **DNS**: in your domain's DNS panel, add an A record pointing your chosen subdomain/domain → the Hetzner server IP (and AAAA if you have IPv6).
2. Make sure ports 80 and 443 are open on the server (Caddy will obtain a TLS certificate via Let's Encrypt automatically once DNS resolves).
3. Copy the repository to the server (`git clone` or `scp`).
4. Create `.env` on the server (`cp .env.example .env` and fill it in, including `DOMAIN`) — **this file is not in git**.
5. Start it:
   ```bash
   docker compose up -d --build
   ```
6. Check `docker compose logs -f caddy` until the certificate issuance confirmation appears, then open `https://$DOMAIN`.

### Updating after code changes

```bash
git pull
docker compose up -d --build
```

The persona (text edited in `/admin`) is stored in the `pasha_data` Docker volume and **is not lost** on container update/restart.

### Updating the persona

Just go to `https://$DOMAIN/admin/login` with the admin password and rewrite the text — it applies instantly, no deploy needed.
