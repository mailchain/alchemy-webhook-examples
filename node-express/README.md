# Example Alchemy Notify Webhooks Server in Node + Mailchain SDK

A example of webhook server for using Alchemy Notify that uses node express and Mailchain SDK to send mail for Address Activity events.

For the full example and tutorial how to setup this webhook and Mailchain SDK, head over to [Mailchain Developer Docs](https://docs.mailchain.com/developer/tutorials/send-mail-on-address-activity).

## Installation

#### Simple setup

First, install Yarn if you don't have it:

```
npm install -g yarn
```

Then, install the dependencies of all packages:

```
yarn
```

## Run

To run on localhost:8080:

```
PORT=8080 HOST=localhost SIGNING_KEY=whsec_your_key_here yarn start
```

Please change SIGNING_KEY to the signing key corresponding to your webhook, which you can find [here](https://docs.alchemy.com/alchemy/enhanced-apis/notify-api/using-notify#1.-find-your-signing-key)

And just like that, you're done!

NOTE: Your webhook path is currently set to "/webhook-path" in `src/index.ts`, but feel free to change it to whatever path you'd like.

## Debugging

If you aren't receiving any webhooks, be sure you followed the steps [here first](https://github.com/alchemyplatform/#readme).
