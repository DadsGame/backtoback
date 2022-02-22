import Hapi from '@hapi/hapi';
import req from 'superagent';
import * as dotenv from "dotenv";

const startServer = async () => {

    dotenv.config();
    const PORT = process.env.PORT || 8000;
    const HOST = process.env.HOST || 'localhost';

    const server = Hapi.server({
        port: PORT,
        host: HOST,
    })

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

    await server.start();
    console.log(`Back to back running on ${server.info.uri}`);
};

startServer();