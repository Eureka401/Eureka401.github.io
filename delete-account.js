// Deletes a Kyslap account from the web (M3-02; Play's account-deletion policy; SOCIAL §8).
// Flow: Google's sign-in button gives an ID token, Supabase Auth turns it into a session
// (POST /auth/v1/token?grant_type=id_token), and the same delete_my_account() the app calls removes the account
// (POST /rest/v1/rpc/delete_my_account). The session lives in memory only: no cookies, no storage.
// The request logic is in `core` so it can be tested without a browser (delete-account.test.ts).
(function () {
  "use strict";

  function isConfigured(config) {
    return Boolean(
      config &&
        /^https:\/\/[^\s/]+$/.test(String(config.supabaseUrl || "").replace(/\/+$/, "")) &&
        config.anonKey &&
        config.googleClientId,
    );
  }

  function baseUrl(config) {
    return String(config.supabaseUrl).replace(/\/+$/, "");
  }

  // Signing in with Google creates a Kyslap account when the Google account has none (Supabase's id_token sign-in has no
  // "existing users only" switch). Such a user was stamped created and signed in in the same request, so the two times
  // are within moments of each other; an existing account's creation is long before this sign-in.
  // 5 s: engineering tolerance for the two timestamps of one request; not a user-facing value.
  const JUST_CREATED_MS = 5000;

  function isJustCreated(user) {
    if (!user || !user.created_at || !user.last_sign_in_at) return false;
    const gap = Math.abs(Date.parse(user.last_sign_in_at) - Date.parse(user.created_at));
    return gap <= JUST_CREATED_MS;
  }

  // Resolves to { accessToken, email, justCreated }, or rejects with an Error whose message is safe to show.
  function signIn(config, idToken, fetchImpl) {
    return fetchImpl(baseUrl(config) + "/auth/v1/token?grant_type=id_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: config.anonKey },
      body: JSON.stringify({ provider: "google", id_token: idToken }),
    }).then(
      function (response) {
        if (!response.ok) throw new Error("Google sign-in was not accepted. Try again, or email us.");
        return response.json().then(function (body) {
          if (!body || !body.access_token) throw new Error("Google sign-in was not accepted. Try again, or email us.");
          const user = body.user || {};
          return { accessToken: body.access_token, email: typeof user.email === "string" ? user.email : "", justCreated: isJustCreated(user) };
        });
      },
      function () {
        throw new Error("Could not reach the server. Check your connection and try again.");
      },
    );
  }

  function deleteAccount(config, accessToken, fetchImpl) {
    return fetchImpl(baseUrl(config) + "/rest/v1/rpc/delete_my_account", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: config.anonKey, Authorization: "Bearer " + accessToken },
      body: "{}",
    }).then(
      function (response) {
        if (!response.ok) throw new Error("The account could not be deleted. Try again, or email us.");
      },
      function () {
        throw new Error("Could not reach the server. Check your connection and try again.");
      },
    );
  }

  const core = { isConfigured: isConfigured, isJustCreated: isJustCreated, signIn: signIn, deleteAccount: deleteAccount };
  if (typeof module !== "undefined" && module.exports) module.exports = core;
  if (typeof document === "undefined") return;

  let config = window.KYSLAP_DELETE_CONFIG;
  let app = document.getElementById("app");
  let status = document.getElementById("status");
  let stepSignIn = document.getElementById("step-signin");
  let stepConfirm = document.getElementById("step-confirm");
  let understand = document.getElementById("understand");
  let deleteButton = document.getElementById("delete");
  const who = document.getElementById("who");
  let accessToken = null;

  function say(text) {
    status.textContent = text;
  }

  // Not configured: leave the page as it is, with the email fallback below it.
  if (!isConfigured(config)) return;
  app.hidden = false;
  stepSignIn.hidden = false;

  function onCredential(response) {
    say("Signing in…");
    signIn(config, response.credential, window.fetch.bind(window)).then(
      function (session) {
        stepSignIn.hidden = true;
        if (session.justCreated) {
          // This Google account had no Kyslap account: the sign-in just made an empty one. Remove it at once, so a visit
          // to check leaves nothing behind.
          say("Checking…");
          deleteAccount(config, session.accessToken, window.fetch.bind(window)).then(
            function () {
              say("There was no Kyslap account for this Google account, so nothing is stored about you.");
            },
            function (error) {
              say(error.message + " The sign-in created an empty account; email us and we will remove it.");
            },
          );
          return;
        }
        accessToken = session.accessToken;
        who.textContent = session.email ? "Signed in as " + session.email + "." : "You are signed in.";
        stepConfirm.hidden = false;
        say("");
        understand.focus();
      },
      function (error) {
        say(error.message);
      },
    );
  }

  function startGoogle() {
    window.google.accounts.id.initialize({ client_id: config.googleClientId, callback: onCredential, auto_select: false });
    window.google.accounts.id.renderButton(document.getElementById("google-button"), { theme: "outline", size: "large", text: "signin_with" });
  }

  // Google's script is requested only when the page is configured.
  let script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.onload = startGoogle;
  script.onerror = function () {
    say("Google's sign-in could not load. Check your connection, or email us.");
  };
  document.head.appendChild(script);

  understand.addEventListener("change", function () {
    deleteButton.disabled = !understand.checked;
  });
  deleteButton.addEventListener("click", function () {
    if (!accessToken || !understand.checked) return;
    deleteButton.disabled = true;
    say("Deleting…");
    deleteAccount(config, accessToken, window.fetch.bind(window)).then(
      function () {
        accessToken = null;
        stepConfirm.hidden = true;
        say("Your account was deleted. Copies in our backups are removed within 28 days.");
      },
      function (error) {
        deleteButton.disabled = false;
        say(error.message);
      },
    );
  });
})();
