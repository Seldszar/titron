# Titron

> Each successive kill from this massive electron hammer builds an electron charge that is unleashed on with slam attacks.

This application automatically handle unban requests by viewers wishing being unbanned from a channel.

## Table of Content

- [Setup](#setup)
- [Usage](#usage)
- [Author](#author)

## Setup

You must configure the user to handle whispers (by disabling "Block Whispers from Strangers" settings in the ["Security & Privacy"](https://www.twitch.tv/settings/security)) and perform unban requests (by making the user a moderator of the channel).
The next step is to configure the application by editing the `config.hjson` file, simply follow the instructions inside.

## Usage

Start the application and wait until its ready. When that's the case, viewers will be able to send whispers to the configured user.
When a viewer send a message containing one of the configured keywords, the user will perform an unban request to the configured channel.

Only 100 requests can be performed per 30 seconds period due to [Twitch rate limits](https://dev.twitch.tv/docs/irc#irc-command-and-message-limits).
But for safety, only 95% of the 100 requests will be performed per period, otherwise the user will be suspended for 30 minutes.

## Author

Alexandre Breteau - [@0xSeldszar](https://twitter.com/0xSeldszar)
