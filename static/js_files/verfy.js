document.addEventListener("DOMContentLoaded", function () {
  register_number()
  otp()
  otp_verify()
  password_verfy();
 

  // Step 1: Verify Registration Number
  function register_number() {
    document
      .getElementById("check-reg-btn")
      .addEventListener("click", async () => {
        const reg = document.getElementById("reg-number").value;

        const res = await fetch("/verify-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ✅ Important: to maintain session!
          body: JSON.stringify({ register_number: reg }),
        });

        const data = await res.json();
        if (data.status === "success") {
          alert("✅ Registration number verified");
          document.getElementById("step2").style.display = "block";
          document.getElementById("reg-number").disabled = true;
          document.getElementById("check-reg-btn").disabled = true;
        } else {
          alert("❌ " + data.message);
        }
      });
  }

  // Step 2: Send OTP to Email

  function otp() {
    document
      .getElementById("send-otp-btn")
      .addEventListener("click", async () => {
        const email = document.getElementById("email").value;

        const res = await fetch("/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ✅ To keep session
          body: JSON.stringify({ email: email }),
        });

        const data = await res.json();
        if (data.status === "success") {
          alert("OTP Sent Successfully");
          document.getElementById("step3").style.display = "block";
        }
      });
  }

  //step 3 Varification otp
  function otp_verify() {
    document
      .getElementById("verify-otp-btn")
      .addEventListener("click", async () => {
        const email = document.getElementById("email").value;
        const otp = document.getElementById("otp").value;

        const res = await fetch("/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: email, otp: otp }),
        });

        const data = await res.json();
        alert(data.message);
        if (data.status === "success") {
             document
    .getElementById("new-password")
    .addEventListener("click", async () => {
      const password = document.getElementById("user-password").value;
      const res =await fetch("http://127.0.0.1:5000/update/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ To keep session
        body: JSON.stringify({ password: password})
      });

       const data = await res.json();
        if (data.status === "success") {
        window.location.href = data.redirect;  // e.g. '/bricks'
        } else {
        alert("❌ " + data.message);
        }
    });
        }
      });
  }

  //Step 4 password Verification
  function password_verfy() {
    const inputWrapper = document.createElement("div");
    inputWrapper.style.position = "relative"; // for positioning the icon

    inputWrapper.innerHTML = `
                        <input id="user-password" type="password" placeholder="Enter your password" style="padding-right: 30px;">
                        <span class="toggle-password" style="
                            position: absolute;
                            right: 10px;
                            top: 50%;
                            transform: translateY(-50%);
                            cursor: pointer;
                        ">👁️</span>
                    `;

    const step4 = document.createElement("div");
    step4.id = "step4";
    step4.style.display = "block";

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
});
