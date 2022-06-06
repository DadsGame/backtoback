# backtoback

## Getting Started

First, you need to install Redis, check [https://redis.io/docs/getting-started](https://redis.io/docs/getting-started) to install.

start redis server
```bash
sudo service redis-server start
# don't forget to stop the server when you close the app with
sudo service redis-server stop
```
You will need to fill the .env file like this
* Redis HOST and PORT
* a Twitch CLIENT_ID, available here [https://dev.twitch.tv/docs/api/](https://dev.twitch.tv/docs/api/).  You will need to register your app.
* a Twitch TOKEN, you need to send a post request to [https://dev.twitch.tv/docs/api/](https://dev.twitch.tv/docs/api/) with the client id and client secret in the body (available in your app dashboard).
See more here [https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/)
  
```dotenv
REDIS_HOST={REDIS_HOST} # usually 127.0.0.1
REDIS_PORT={REDIS_PORT} # usually 6379
TWITCH_CLIENT_ID={TWITCH_CLIENT_ID}
TWITCH_TOKEN={TWITCH_TOKEN}
```
Then you can run the app with
```bash
npm install
```
```bash
npm run dev
# or
yarn dev
```

API running on [http://localhost:8000](http://localhost:8000).
