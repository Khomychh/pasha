(() => {
  // Keep the chat screen's height synced to the real visible viewport, so
  // the header and composer both stay on screen when the mobile keyboard
  // opens (100svh doesn't shrink for the keyboard on its own).
  const messagesEl = document.getElementById("messages");

  const vv = window.visualViewport;
  if (vv) {
    const syncViewportHeight = () => {
      document.documentElement.style.setProperty("--vv-height", `${vv.height}px`);
      // Keyboard open/close resizes the flex layout; keep the view pinned
      // to the latest message instead of drifting away from it.
      scrollToBottom();
    };
    vv.addEventListener("resize", syncViewportHeight);
    syncViewportHeight();
  }

  // If the page is restored from bfcache (e.g. mobile back-navigation),
  // browsers don't reliably restore the .messages scroll position, which
  // otherwise leaves the view stuck at the oldest message.
  window.addEventListener("pageshow", () => scrollToBottom());

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

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  composer.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addBubble("user", message);
    input.value = "";
    input.style.height = "auto";
    sendBtn.disabled = true;

    // A short human-like beat before Pasha "notices" the message, so the
    // typing indicator doesn't pop up the instant you hit send.
    await sleep(randomBetween(400, 900));
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let doneReading = false;
      let replyBubble = null;

      async function readStream() {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
        }
        doneReading = true;
      }

      // Reveal the streamed text at a typing-like pace instead of dumping
      // whole chunks the instant they arrive, so replies feel less instant.
      async function revealStream() {
        let shown = "";
        while (!doneReading || shown.length < buffer.length) {
          if (shown.length < buffer.length) {
            if (!replyBubble) {
              typingEl.remove();
              replyBubble = addBubble("model", "");
            }
            const behind = buffer.length - shown.length;
            const step = behind > 200 ? Math.ceil(behind / 20) : behind > 40 ? 3 : 1;
            shown = buffer.slice(0, shown.length + step);
            replyBubble.textContent = shown;
            scrollToBottom();
          }
          await sleep(randomBetween(18, 40));
        }
      }

      await Promise.all([readStream(), revealStream()]);

      if (!replyBubble) {
        typingEl.remove();
      }

      history.push({ role: "user", text: message });
      history.push({ role: "model", text: buffer });
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
