import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  browserLocalPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");
const googleRegisterBtn = document.getElementById("googleRegisterBtn");
const msg = document.getElementById("msg");
const passwordInput = document.getElementById("password");

function showMessage(text, type = "error") {
  if (!msg) return;
  msg.innerHTML = `<i class="fas fa-${type === "error" ? "circle-exclamation" : "check-circle"}"></i><span>${text}</span>`;
  msg.className = `msg ${type} show`;
}

function clearMessage() {
  if (!msg) return;
  msg.className = "msg";
  msg.innerHTML = "";
}

function setButtonLoading(button, isLoading, originalHtml) {
  if (!button) return;

  if (isLoading) {
    button.dataset.originalHtml = originalHtml || button.innerHTML;
    button.classList.add("loading");
    button.disabled = true;
  } else {
    button.classList.remove("loading");
    button.disabled = false;
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
    }
  }
}

async function ensureStudentProfile(user, name = "") {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: name || user.displayName || "",
      email: user.email || "",
      role: "student",
      provider: user.providerData?.[0]?.providerId || "password",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = passwordInput?.value || "";

    if (!name || !email || !password) {
      showMessage("অনুগ্রহ করে সব ফিল্ড পূরণ করুন।", "error");
      return;
    }

    if (password.length < 6) {
      showMessage("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।", "error");
      return;
    }

    const originalHtml = registerBtn.innerHTML;

    try {
      setButtonLoading(registerBtn, true, originalHtml);
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      await ensureStudentProfile(userCredential.user, name);

      showMessage("সফলভাবে রেজিস্ট্রেশন হয়েছে।", "success");

      setTimeout(() => {
        window.location.href = "./student-dashboard.html";
      }, 900);
    } catch (error) {
      let text = "রেজিস্ট্রেশন করা যায়নি। আবার চেষ্টা করুন।";

      switch (error.code) {
        case "auth/email-already-in-use":
          text = "এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে।";
          break;
        case "auth/invalid-email":
          text = "ইমেইল ফরম্যাট সঠিক নয়।";
          break;
        case "auth/weak-password":
          text = "আরও শক্তিশালী পাসওয়ার্ড দিন।";
          break;
        case "auth/network-request-failed":
          text = "ইন্টারনেট সংযোগে সমস্যা হয়েছে।";
          break;
      }

      showMessage(text, "error");
    } finally {
      setButtonLoading(registerBtn, false);
    }
  });
}

if (googleRegisterBtn) {
  googleRegisterBtn.addEventListener("click", async () => {
    clearMessage();

    const originalHtml = googleRegisterBtn.innerHTML;

    try {
      setButtonLoading(googleRegisterBtn, true, originalHtml);
      await setPersistence(auth, browserLocalPersistence);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account"
      });

      const result = await signInWithPopup(auth, provider);
      await ensureStudentProfile(result.user, result.user.displayName || "");

      showMessage("Google দিয়ে সফলভাবে রেজিস্ট্রেশন হয়েছে।", "success");

      setTimeout(() => {
        window.location.href = "./student-dashboard.html";
      }, 900);
    } catch (error) {
      let text = "Google রেজিস্ট্রেশন করা যায়নি।";

      switch (error.code) {
        case "auth/popup-closed-by-user":
          text = "Google popup বন্ধ করা হয়েছে।";
          break;
        case "auth/popup-blocked":
          text = "Popup block হয়েছে। Browser থেকে popup allow করুন।";
          break;
        case "auth/cancelled-popup-request":
          text = "আগের popup request cancel হয়েছে। আবার চেষ্টা করুন।";
          break;
        case "auth/network-request-failed":
          text = "ইন্টারনেট সংযোগে সমস্যা হয়েছে।";
          break;
      }

      showMessage(text, "error");
    } finally {
      setButtonLoading(googleRegisterBtn, false);
    }
  });
  }
