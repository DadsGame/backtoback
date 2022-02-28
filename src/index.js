import Hapi from '@hapi/hapi';
import req from 'superagent';
import * as dotenv from "dotenv";
import CatboxRedis from "@hapi/catbox-redis";
import steamRoutes from "./routes/steamRoutes.js";


dotenv.config();

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'localhost';
const REDIS_HOST = process.env.REDIS_HOST || '0.0.0.0';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const server = Hapi.server({
    port: PORT,
    host: HOST,
    cache: [
        {
            name: 'backtoback-cache',
            provider: {
                constructor: CatboxRedis,
                options: {
                    partition: 'cached_data',
                    host: REDIS_HOST,
                    port: REDIS_PORT,
                    database: 0,
                }
            }
        }
    ]
});



server.route({
    method: 'GET',
    path: '/test/{steamid}',
    handler: async function (request, h) {
        console.log('steam key', process.env.STEAM_API_KEY, 'param', request.params.steamid)
        const steamInfo = await req
            .get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002')
            .query({key: process.env.STEAM_API_KEY, steamids: request.params.steamid, format: 'json'});
        console.log(steamInfo);
        return JSON.parse(steamInfo.res.text);
    }
});
// server.cache(getAllGamesCache);
steamRoutes.forEach((route) => {
    const handler = server.cache(route.handler);
    return server.route(({...route, handler: async () => {
            return await handler.get('games');
        }}));
    // return server.route(route);
});

const startServer= async () =>  {
    await server.start();
    console.log(`Back to back running on ${server.info.uri}`);
};

startServer();


