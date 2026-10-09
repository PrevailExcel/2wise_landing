# 2wise.com.ng landing page

Upload everything in this folder to the site root: `index.html`, `img/`, `icon-192.png`, `icon-512.png`, `og.png`, `robots.txt` and `sitemap.xml`.

## Direct downloads

The download button picks the visitor's device:

| Device | What the button does |
|---|---|
| Android | Downloads `/download/2Wise-android.apk` |
| Windows | Downloads `/download/2Wise-windows.exe` |
| Mac | Downloads `/download/2Wise-mac.dmg` |
| Linux | Downloads `/download/2Wise-linux.AppImage` |
| iPhone | Opens `app.2wise.com.ng`, with the tip to tap Share, then Add to Home Screen |

Pushing a tag such as `v1.0.0` makes the CI workflow build all four installers and attach them to a GitHub release under those exact names. Point `/download/` at the latest release.

```nginx
location /download/ {
  rewrite ^/download/(.*)$ https://github.com/OWNER/REPO/releases/latest/download/$1 redirect;
}
location /join/ { try_files /index.html =404; }   # invite links
```

The Android APK needs a release keystore. Generate it once and keep it safe forever: Android refuses updates signed with a different key.

```bash
keytool -genkey -v -keystore 2wise.keystore -alias 2wise -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 2wise.keystore   # → GitHub secret ANDROID_KEYSTORE_BASE64
```

## Other wiring

- **Signed-in visitors** see "Open app" instead of the download button. This reads the `2wise_authed` cookie, which the API sets when `LANDING_COOKIE_DOMAIN=.2wise.com.ng`.
- **Invite links** (`/join/CODE`) carry the code into the app.

## SEO

- **On the page:** the title, description, headings, FAQ and structured data all target "JAMB 2027".
- **Ranking is won by content and links**, not by this page alone. Publish real articles behind the footer links (`/how-to-score-300`, `/jamb-subjects`, `/blog`), each aimed at one search ("JAMB 2027 subject combination for medicine", "JAMB 2027 registration date"), and add them to `sitemap.xml`.
- **Google Search Console:** submit the sitemap there once the site is live.
