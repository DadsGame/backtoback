import {config} from "../../config.js";
import IgdbService from "../services/igdbService.js";

const igdbService = new IgdbService();
const ONE_HOUR = 60 * 60;
const ONE_DAY = ONE_HOUR * 24;

export const searchGames = async (request, h) => {
    const redisClient = config.redisClient();
    await redisClient.connect();
    const gameName = request.query.name.toLowerCase();
    const cache = await redisClient.get(`igdb/search:${gameName}`);
    if(cache) {
        return JSON.parse(cache);
    }
    console.log('before game');
    const games = await igdbService.searchGames(gameName);
    console.log('games', games);
    await redisClient.set('igdb/search:${gameName}', JSON.stringify(games));
    await redisClient.expire('igdb/search:${gameName}', ONE_HOUR);
    return games;
};

