(() => {
  const logoutLink = document.getElementById("admin-logout-link");
  const logoutForm = document.getElementById("admin-logout-form");

  function wireSave({ textareaId, buttonId, statusId, endpoint }) {
    const textarea = document.getElementById(textareaId);
    const button = document.getElementById(buttonId);
    const status = document.getElementById(statusId);

    button.addEventListener("click", async () => {
      button.disabled = true;
      status.textContent = "Зберігаю...";

      try {
        const response = await fetch(endpoint, {
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
        button.disabled = false;
      }
    });
  }

  wireSave({
    textareaId: "persona-text",
    buttonId: "save-btn",
    statusId: "status",
    endpoint: "/admin/api/persona",
  });

  wireSave({
    textareaId: "phrases-text",
    buttonId: "save-phrases-btn",
    statusId: "phrases-status",
    endpoint: "/admin/api/phrases",
  });

  logoutLink.addEventListener("click", () => logoutForm.requestSubmit());
})();
