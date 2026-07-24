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

  function wirePhotoUpload() {
    const input = document.getElementById("photo-input");
    const preview = document.getElementById("photo-preview");
    const status = document.getElementById("photo-status");

    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;

      status.textContent = "Завантажую...";
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/admin/api/photo", {
          method: "POST",
          body: formData,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          status.textContent = data.error || "Не вдалося завантажити.";
        } else {
          preview.src = `/static/img/pasha.jpg?v=${data.photo_version}`;
          status.textContent = "Завантажено ✓";
          setTimeout(() => {
            status.textContent = "";
          }, 2500);
        }
      } catch (err) {
        status.textContent = "Не вдалося завантажити. Перевір з'єднання.";
      } finally {
        input.value = "";
      }
    });
  }

  wireSave({
    textareaId: "name-input",
    buttonId: "save-name-btn",
    statusId: "name-status",
    endpoint: "/admin/api/name",
  });

  wirePhotoUpload();

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
