(() => {
  const messagesEl = document.getElementById("messages");
  const composer = document.getElementById("composer");
  const input = document.getElementById("input");
  const sendBtn = document.getElementById("send-btn");
  const logoutLink = document.getElementById("logout-link");
  const logoutForm = document.getElementById("logout-form");

  /** @type {{role: "user" | "model", text: string}[]} */
  const history = [];

  function scrollToBottom(smooth = false) {
    if (smooth) {
      messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
    } else {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  }

  function addBubble(role, text) {
    const bubble = document.createElement("div");
    bubble.className = "bubble " + (role === "user" ? "guest" : "persona");
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    scrollToBottom(true);
    return bubble;
  }

  function addNotice(text) {
    const notice = document.createElement("div");
    notice.className = "chat-notice";
    notice.textContent = text;
    messagesEl.appendChild(notice);
    scrollToBottom(true);
  }

  function addTypingIndicator() {
    const el = document.createElement("div");
    el.className = "typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(el);
    scrollToBottom(true);
    return el;
  }

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      composer.requestSubmit();
    }
  });

  composer.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addBubble("user", message);
    input.value = "";
    input.style.height = "auto";
    sendBtn.disabled = true;

    const typingEl = addTypingIndicator();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, message }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        typingEl.remove();
        addNotice(errorText || "Щось пішло не так. Спробуй ще раз.");
        sendBtn.disabled = false;
        return;
      }

      typingEl.remove();
      const replyBubble = addBubble("model", "");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        replyBubble.textContent = fullText;
        scrollToBottom();
      }

      history.push({ role: "user", text: message });
      history.push({ role: "model", text: fullText });
    } catch (err) {
      typingEl.remove();
      addNotice("Не вдалося зв'язатись із Пашею. Перевір з'єднання.");
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  });

  logoutLink.addEventListener("click", () => logoutForm.requestSubmit());
})();
