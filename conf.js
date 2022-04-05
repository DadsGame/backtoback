import {createClient} from "redis";
import {config} from "dotenv";

const REDIS_HOST = process.env.REDIS_HOST || '0.0.0.0';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
config();

export const conf = {
    redisClient : () => {
        const client = createClient({
            url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
        });
        return client;
    },
    IGDB_AUTHORIZATION: {authorization: process.env.TWITCH_TOKEN, client_id: process.env.TWITCH_CLIENT_ID},
}