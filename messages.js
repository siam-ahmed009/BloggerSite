document.addEventListener("DOMContentLoaded", () => {
  const messageList = document.getElementById("message-list");

  async function loadMessages() {
    if (!messageList) return;

    try {
      const res = await fetch("http://localhost:5000/api/contact");
      const messages = await res.json();

      if (!Array.isArray(messages) || messages.length === 0) {
        messageList.innerHTML = "<p>No messages found.</p>";
        return;
      }

      messageList.innerHTML = messages.map(msg => `
        <div style="border:1px solid #ccc;padding:10px;margin:10px 0;border-radius:6px">
          <strong>${msg.name}</strong> &lt;${msg.email}&gt;<br/>
          <strong>Subject:</strong> ${msg.subject}<br/>
          <p>${msg.message}</p>
        </div>
      `).join('');
    } catch (err) {
      messageList.innerHTML = `<p style="color:red">Failed to load messages.</p>`;
      console.error("Message load error:", err);
    }
  }

  document.querySelectorAll("aside a").forEach(link => {
    link.addEventListener("click", () => {
      if (link.textContent.includes("Messages")) {
        loadMessages();
      }
    });
  });

  if (!document.getElementById("messages-section").classList.contains("hidden")) {
    loadMessages();
  }
});
