import {createClient} from "redis";

const REDIS_HOST = process.env.REDIS_HOST || '0.0.0.0';
const REDIS_PORT = process.env.REDIS_PORT || 6379;


export const config = {
    redisClient : () => {
        console.log(`redis://${REDIS_HOST}:${REDIS_PORT}`);
        const client = createClient({
            url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
        });
        return client;
    },
}