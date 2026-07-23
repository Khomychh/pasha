(() => {
  const textarea = document.getElementById("persona-text");
  const saveBtn = document.getElementById("save-btn");
  const status = document.getElementById("status");
  const logoutLink = document.getElementById("admin-logout-link");
  const logoutForm = document.getElementById("admin-logout-form");

  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    status.textContent = "Зберігаю...";

    try {
      const response = await fetch("/admin/api/persona", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textarea.value }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        status.textContent = data.error || "Не вдалося зберегти.";
      } else {
        status.textContent = "Збережено ✓";
        setTimeout(() => {
          status.textContent = "";
        }, 2500);
      }
    } catch (err) {
      status.textContent = "Не вдалося зберегти. Перевір з'єднання.";
    } finally {
      saveBtn.disabled = false;
    }
  });

  logoutLink.addEventListener("click", () => logoutForm.requestSubmit());
})();
