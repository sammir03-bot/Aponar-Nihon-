import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const msg = document.getElementById("msg");
const passwordInput = document.getElementById("password");
const rememberMe = document.getElementById("rememberMe");

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

async function applyPersistence() {
  const persistence = rememberMe?.checked
    ? browserLocalPersistence
    : browserSessionPersistence;

  await setPersistence(auth, persistence);
}

async function ensureUserProfile(user, fallbackName = "") {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newUser = {
      name: fallbackName || user.displayName || "",
      email: user.email || "",
      role: "student",
      provider: user.providerData?.[0]?.providerId || "password",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, newUser);
    return newUser;
  }

  const existingData = userSnap.data();

  await updateDoc(userRef, {
    updatedAt: serverTimestamp()
  });

  return existingData;
}

function redirectByRole(userData) {
  if (userData?.role === "admin") {
    window.location.href = "./dashboard.html";
  } else {
    window.location.href = "./student-dashboard.html";
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();

    const email = document.getElementById("email")?.value.trim();
    const password = passwordInput?.value || "";

    if (!email || !password) {
      showMessage("অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দিন।", "error");
      return;
    }

    const originalHtml = loginBtn.innerHTML;

    try {
      setButtonLoading(loginBtn, true, originalHtml);
      await applyPersistence();

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await ensureUserProfile(userCredential.user);

      showMessage("সফলভাবে লগইন হয়েছে।", "success");

      setTimeout(() => {
        redirectByRole(userData);
      }, 700);
    } catch (error) {
      let text = "লগইন করা যায়নি। আবার চেষ্টা করুন।";

      switch (error.code) {
        case "auth/invalid-email":
          text = "ইমেইল ফরম্যাট সঠিক নয়।";
          break;
        case "auth/user-not-found":
        case "auth/invalid-credential":
          text = "ইমেইল বা পাসওয়ার্ড ভুল।";
          break;
        case "auth/wrong-password":
          text = "পাসওয়ার্ড ভুল হয়েছে।";
          break;
        case "auth/too-many-requests":
          text = "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";
          break;
        case "auth/network-request-failed":
          text = "ইন্টারনেট সংযোগে সমস্যা হয়েছে।";
          break;
      }

      showMessage(text, "error");
    } finally {
      setButtonLoading(loginBtn, false);
    }
  });
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    clearMessage();

    const originalHtml = googleLoginBtn.innerHTML;

    try {
      setButtonLoading(googleLoginBtn, true, originalHtml);
      await applyPersistence();

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account"
      });

      const result = await signInWithPopup(auth, provider);
      const userData = await ensureUserProfile(result.user, result.user.displayName || "");

      showMessage("Google দিয়ে সফলভাবে লগইন হয়েছে।", "success");

      setTimeout(() => {
        redirectByRole(userData);
      }, 700);
    } catch (error) {
      let text = "Google লগইন করা যায়নি।";

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
      setButtonLoading(googleLoginBtn, false);
    }
  });
                 }
