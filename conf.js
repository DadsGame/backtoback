import {createClient} from "redis";
import {config} from "dotenv";

const REDIS_HOST = process.env.REDIS_HOST ?? '0.0.0.0';
const REDIS_PORT = process.env.REDIS_PORT ?? 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? '';

const REDIS_URL = process.env.REDIS_URL ?? `redis://${REDIS_HOST}:${REDIS_PORT}`;

config();

export const conf = {
    redisClient : () => {
        const client = createClient({
            url: REDIS_URL,
        });
        return client;
    },
    IGDB_AUTHORIZATION: {authorization: process.env.TWITCH_TOKEN, client_id: process.env.TWITCH_CLIENT_ID},
}