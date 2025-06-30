// ✅ Tells TypeScript/VSCode: I am adding csrfToken to window
window.csrfToken = window.csrfToken || '';

async function ensureCSRFToken() {
  if (!window.csrfToken) {
    const res = await fetch('/get-csrf-token', { credentials: 'include' });
    const data = await res.json();
    window.csrfToken = data.csrf_token;
  }
}

async function verify() {
  await ensureCSRFToken();
  register_number();
  otp();
  otp_verify();
  password_verfy();
}

verify()
  // 🔁 Helper to manage step visibility
  function showStep(stepIdToShow) {
    const steps = ["step1", "step2", "step3", "step4"];
    steps.forEach((stepId) => {
      const el = document.getElementById(stepId); 
      if (el) el.style.display = stepId === stepIdToShow ? "block" : "none";//1* this Explain the user only what the pertical step to be block rest of them will be none
    });
  }

  // Step 1: Verify Registration Number
  function register_number() {
    document.getElementById("check-reg-btn").addEventListener("click", async () => {
      const reg = document.getElementById("reg-number").value;

      const res = await fetch("/verify-register", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'X-CSRFToken': csrfToken},
        credentials: "include",
        body: JSON.stringify({ register_number: reg }),
      });

      const data = await res.json();
      if (data.status === "success") {
        alert("✅ Registration number verified");
        showStep("step2");
        document.getElementById("reg-number").disabled = true;
        document.getElementById("check-reg-btn").disabled = true;
      } else {
        alert("❌ " + data.message);
      }
    });
  }

  // Step 2: Send OTP
  function otp() {
    document.getElementById("send-otp-btn").addEventListener("click", async () => {
      const email = document.getElementById("email").value;

      const res = await fetch("/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'X-CSRFToken': csrfToken  },
        credentials: "include",
        body: JSON.stringify({ email: email }),
      });

      const data = await res.json();
      if (data.status === "success") {
        alert("OTP Sent Successfully");
        showStep("step3");
      }
    });
  }

  // Step 3: Verify OTP
  function otp_verify() {
    document.getElementById("verify-otp-btn").addEventListener("click", async () => {
      const email = document.getElementById("email").value;
      const otp = document.getElementById("otp").value;

      const res = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", 'X-CSRFToken': csrfToken },
        credentials: "include",
        body: JSON.stringify({ email: email, otp: otp }),
      });

      const data = await res.json();
      alert(data.message);

      if (data.status === "success") {
        showStep("step4");

        document.getElementById("new-password").addEventListener("click", async () => {
          const password = document.getElementById("user-password").value;

          const res = await fetch("/update/password", {
            method: "POST",
            headers: { "Content-Type": "application/json", 'X-CSRFToken': csrfToken },
            credentials: "include",
            body: JSON.stringify({ password: password }),
          });

          const data = await res.json();
          if (data.status === "success") {
            window.location.href = data.redirect; // e.g., '/bricks'
          } else {
            alert("❌ " + data.message);
          }
        });
      }
    });
  }

  // Step 4: Password Form UI
  function password_verfy() {
    const inputWrapper = document.createElement("div");
    inputWrapper.style.position = "relative";

    inputWrapper.innerHTML = `
      <input id="user-password" type="password" placeholder="Enter your password" style="padding-right: 30px;">
      <span class="toggle-password" style="
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;">👁️</span>
    `;

    const step4 = document.createElement("div");
    step4.id = "step4";
    step4.style.display = "none";

    const button = document.createElement("button");
    button.id = "new-password";
    button.textContent = "Update Password";

    step4.appendChild(inputWrapper);
    step4.appendChild(button);

    const container = document.getElementById("container");
    container.appendChild(step4);

    document.addEventListener("click", function (e) {
      if (e.target.classList.contains("toggle-password")) {
        const input = document.getElementById("user-password");
        input.type = input.type === "password" ? "text" : "password";
        e.target.textContent = input.type === "password" ? "👁️" : "🙈";
      }
    });
  }
