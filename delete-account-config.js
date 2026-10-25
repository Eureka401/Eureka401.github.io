// The three public values the delete-account page needs (M3-02). None is a secret: the same values ship inside the app,
// and the database's row-level security protects the data. The owner fills them in once before publishing this folder
// (docs/OWNER_ACTIONS.md, M3-02). While any is empty the page shows only the email fallback.
//   supabaseUrl:    the project URL, e.g. https://<project>.supabase.co
//   anonKey:        the publishable key (sb_publishable_...), the same GitHub secret SUPABASE_ANON_KEY
//   googleClientId: the Google *Web* OAuth client ID, the same as GOOGLE_WEB_CLIENT_ID
window.KYSLAP_DELETE_CONFIG = {
  supabaseUrl: "https://sofwjqepqydvfbzmvhwc.supabase.co",
  anonKey: "sb_publishable_lf51YEeWgOGKXf97OKYEWA_s_TArMIG",
  googleClientId: "891670014728-3umg94t68re61n9cp08gomrv4rnho8og.apps.googleusercontent.com",
};
