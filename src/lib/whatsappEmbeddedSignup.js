const SDK_ID = "facebook-jssdk";
const SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";

export function loadFacebookSdk({ appId, graphVersion }) {
  if (!appId) return Promise.reject(new Error("WhatsApp signup is not configured yet."));
  if (window.FB?.__teviqAppId === appId) return Promise.resolve(window.FB);

  return new Promise((resolve, reject) => {
    let script = document.getElementById(SDK_ID);
    if (!script) {
      script = document.createElement("script");
      script.id = SDK_ID;
      script.src = SDK_SRC;
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    const timeout = window.setTimeout(() => reject(new Error("Meta signup could not load. Check your connection and retry.")), 15000);
    const initialize = () => {
      if (!window.FB) return;
      window.clearTimeout(timeout);
      window.FB.init({ appId, cookie: true, xfbml: false, version: graphVersion || "v21.0" });
      window.FB.__teviqAppId = appId;
      resolve(window.FB);
    };

    if (window.FB) initialize();
    else {
      script.addEventListener("load", initialize, { once: true });
      script.addEventListener("error", () => {
        window.clearTimeout(timeout);
        reject(new Error("Meta signup could not load. Check your connection and retry."));
      }, { once: true });
    }
  });
}

function isFacebookOrigin(origin) {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === "facebook.com" || hostname.endsWith(".facebook.com");
  } catch {
    return false;
  }
}

export function startWhatsAppEmbeddedSignup({ configId }) {
  const fb = window.FB;
  if (!fb || !configId) return Promise.reject(new Error("WhatsApp signup is not ready. Refresh and try again."));

  return new Promise((resolve, reject) => {
    let code = "";
    let assets = null;
    let settled = false;
    const timeout = window.setTimeout(() => finish(new Error("WhatsApp signup timed out. Please start again.")), 5 * 60 * 1000);

    function finish(error, value) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      if (error) reject(error);
      else resolve(value);
    }

    function maybeFinish() {
      if (code && assets?.wabaId && assets?.phoneNumberId) {
        finish(null, { code, ...assets });
      }
    }

    function onMessage(event) {
      if (!isFacebookOrigin(event.origin)) return;
      let message = event.data;
      if (typeof message === "string") {
        try { message = JSON.parse(message); } catch { return; }
      }
      if (message?.type !== "WA_EMBEDDED_SIGNUP") return;
      if (message.event === "CANCEL") {
        finish(new Error("WhatsApp signup was cancelled."));
      } else if (message.event === "ERROR") {
        finish(new Error("Meta could not finish WhatsApp signup. Please try again."));
      } else if (message.event === "FINISH" || message.event === "FINISH_ONLY_WABA") {
        assets = {
          wabaId: String(message.data?.waba_id || ""),
          phoneNumberId: String(message.data?.phone_number_id || "")
        };
        maybeFinish();
      }
    }

    window.addEventListener("message", onMessage);
    fb.login(response => {
      const authResponse = response?.authResponse || {};
      if (response?.status === "unknown" && !authResponse.code) {
        finish(new Error("Meta sign-in was cancelled or denied."));
        return;
      }
      code = String(authResponse.code || response?.code || "");
      if (!code) {
        finish(new Error("Meta did not return an authorization code. Please restart signup."));
        return;
      }
      maybeFinish();
    }, {
      config_id: configId,
      response_type: "code",
      override_default_response_type: true,
      extras: { setup: {}, featureType: "whatsapp_embedded_signup", sessionInfoVersion: "3" }
    });
  });
}
