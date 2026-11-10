# The Android app

Kids Sound Match installed as an app: a Trusted Web Activity around the live site, made with
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap). Game changes reach it through the website,
so it only needs rebuilding to change its name, icon or Android settings.

The tools are in `C:\Users\Jouza\.ksm-android` (Java, Android SDK, Bubblewrap). The signing key and its
password are in `C:\Users\Jouza\.ksm-android\keys`. **Keep a copy of that folder somewhere safe.** Without
the key, an installed app can't be updated, and it would have to be removed and installed again. Never put
it in this repo.

To rebuild (the local preview server must be running, because the icons are read from it):

1. In `kids-app`, run `npm run build:test`, then `npm run preview`.
2. Raise `appVersionCode` and `appVersionName` in `twa-manifest.json`.
3. In `android/`, with `BUBBLEWRAP_KEYSTORE_PASSWORD` and `BUBBLEWRAP_KEY_PASSWORD` set to the key's password:

```bash
/c/Users/Jouza/.ksm-android/bw/node_modules/.bin/bubblewrap update --skipVersionUpgrade --manifest=./twa-manifest.json
```

```bash
/c/Users/Jouza/.ksm-android/bw/node_modules/.bin/bubblewrap build --skipPwaValidation --manifest=./twa-manifest.json
```

The result is `app-release-signed.apk`. If the signing key ever changes, update the fingerprint in
`public/.well-known/assetlinks.json` too.
