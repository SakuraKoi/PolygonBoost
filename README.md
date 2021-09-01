# PolygonBoost
Boost your DeFi experience by replacing Matic RPC for faster data loading

## Whats this
PolygonBoost is a Chrome extension that replaces the Matic-MainNet RPC used by DeFi websites with faster servers

## Install
1. Clone this repo to your disk
2. Google "how to install chrome plugin from src"
3. Then load unpacked extension from ./src
4. Done

## Use
1. Click extension logo appeared near address bar
2. Click 'Speed Test' and wait
3. Use the RPC you prefer or just click 'Use Fastest'
4. Ohhhhhhh!

## FAQ
> The DeFi website you are visiting stopped working after used the extension?

Try to use another RPC server, That's not my fault but the RPC you're using not compatible with the website you're visiting
> It not works and the website is still using old node?

This may be because you are visiting a site that uses an RPC server that we do not yet support, You can manully add it to RPC list.\
How To:
1. Press F12 to open Developer Tools, switch to Network
2. Find the Matic RPC server used by the site, which is usually spamming in the request list
3. Open our extension, paste the URL of the node into the edit box at the top, and click Add
4. Done

## Special thanks
- Icons made by Darius Dan from www.flaticon.com
- Modified from [chrome-extension-redirector](https://github.com/bendavis78/chrome-extension-redirector)
