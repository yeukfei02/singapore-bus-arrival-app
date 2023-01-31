<p align="center">
  <img width="200px" src="https://github.com/yeukfei02/singapore-bus-arrival-app/blob/main/readme-icon.png?raw=true"><br/>
  <h2 align="center">singapore-bus-arrival-app</h2>
</p>

<p align="center">
  <a href="https://apps.apple.com/us/app/singapore-bus-arrival/id1539326353"><img src="https://github.com/yeukfei02/singapore-bus-arrival-app/blob/main/app-store-badge.png?raw=true" width="30%" height="30%" alt=""></a>
  <a href="https://play.google.com/store/apps/details?id=com.donaldwu.singaporebusarrivalapp"><img src="https://github.com/yeukfei02/singapore-bus-arrival-app/blob/main/google-play-badge.png?raw=true" width="30%" height="30%" alt=""></a>
</p>

## Requirement

- install expo-cli
- install eas-cli
- install yarn
- install node (v16+)

## Testing and run

```zsh
$ yarn

// expo start
$ yarn run start

// expo start android
$ yarn run android

// expo start ios
$ yarn run ios

// run test case
$ yarn run test

// lint code
$ yarn run lint

// format code
$ yarn run format
```

```zsh
// publish project to expo
$ expo publish

// make ios ipa
$ expo build:ios

// make android apk / app bundle
$ expo build:android

// get ios certificate
$ expo fetch:ios:certs

// get android keystore
$ expo fetch:android:keystore

// get current build status
$ expo build:status

// generate android + ios folder
$ expo eject

// eas build ios/android
$ eas build
```
