import Hapi from '@hapi/hapi';
import req from 'superagent';
import * as dotenv from "dotenv";
import steamRoutes from "./routes/steamRoutes.js";
import igdbRoutes from "./routes/igdbRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'localhost';

const server = Hapi.server({
    port: PORT,
    host: HOST,
    routes: {
        cors: {
            origin: ['*'], // an array of origins or 'ignore'
            headers: ['Authorization'], // an array of strings - 'Access-Control-Allow-Headers'
            exposedHeaders: ['Accept'], // an array of exposed headers - 'Access-Control-Expose-Headers',
            additionalExposedHeaders: ['Accept'], // an array of additional exposed headers
            maxAge: 60,
        }
    },
    debug: { request: ['error'] }
});



server.route({
    method: 'GET',
    path: '/test/{steamid}',
    handler: async function (request, h) {
        const steamInfo = await req
            .get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002')
            .query({key: process.env.STEAM_API_KEY, steamids: request.params.steamid, format: 'json'});
        return JSON.parse(steamInfo.res.text);
    }
});


// TODO: put routes in one array and loop instead of routing twice
steamRoutes.forEach((route) => {
    server.route(route);
    /*if(typeof route.handler === 'object') {
        const handler = server.cache(route.handler);
        return server.route(({
            ...route, handler: async (request, h) => {
                return await handler.get({id: 'cache', request, h});
            }
        }));
    }
    return server.route(({
        ...route, handler: async (request, h) => {
            return await route.handler(request, h);
        }
    }));*/
});

igdbRoutes.forEach((route) => {
    server.route(route);
});

const startServer= async () =>  {
    await server.start();
    console.log(`Back to back running on ${server.info.uri}`);
};

startServer();


