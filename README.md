# Паша

Приватний чат, де гості спілкуються з AI, що грає роль конкретної людини. Характер і факти про персону задаються окремо, через адмінку — код нічого особистого не містить.

## Локальний запуск

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# заповнити .env: GEMINI_API_KEY, GUEST_PASSWORD, ADMIN_PASSWORD, SECRET_KEY
uvicorn main:app --reload
```

Відкрити http://127.0.0.1:8000 — гостьовий вхід, http://127.0.0.1:8000/admin/login — адмінка для редагування персони.

`SECRET_KEY` згенерувати одноразово і зберігати незмінним (зміна виловить усі активні сесії):

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## Деплой на Hetzner (`pasha.ivankhomych.com`)

1. **DNS**: в панелі керування `ivankhomych.com` додати A-запис `pasha` → IP Hetzner-сервера (і AAAA, якщо є IPv6).
2. Переконатись, що на сервері відкриті порти 80 і 443 (Caddy сам отримає TLS-сертифікат через Let's Encrypt, як тільки DNS почне резолвитись).
3. Скопіювати репозиторій на сервер (`git clone` або `scp`).
4. Створити `.env` на сервері (`cp .env.example .env` і заповнити) — **цей файл не в git**.
5. Запустити:
   ```bash
   docker compose up -d --build
   ```
6. Перевірити `docker compose logs -f caddy`, поки не з'явиться підтвердження видачі сертифіката, потім відкрити https://pasha.ivankhomych.com.

### Оновлення після змін коду

```bash
git pull
docker compose up -d --build
```

Персона (текст, який редагується в `/admin`) зберігається в Docker volume `pasha_data` і **не втрачається** при оновленні/рестарті контейнера.

### Оновлення персони

Просто зайти на https://pasha.ivankhomych.com/admin/login з адмін-паролем і переписати текст — застосовується миттєво, без деплою.
