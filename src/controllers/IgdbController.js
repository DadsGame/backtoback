import {conf} from "../../conf.js";
import IgdbService from "../services/igdbService.js";

const igdbService = new IgdbService();
const ONE_HOUR = 60 * 60;
const ONE_DAY = ONE_HOUR * 24;

export const searchGames = async (request, h) => {
    const redisClient = conf.redisClient();
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

export const topTenGames = async (request, h) => {
    const redisClient = conf.redisClient();
    await redisClient.connect();
    const cache = await redisClient.get(`igdb/top_ten`);
    if(cache) {
        return JSON.parse(cache);
    }
    // console.log('before game');
    const topTen = await igdbService.topTenGames();
    // console.log('top_ten', topTen);
    await redisClient.set('igdb/top_ten', JSON.stringify(topTen));
    await redisClient.expire('igdb/top_ten', 10);
    return topTen;
}

export const platforms = async (request, h) => {
    return await igdbService.topTenGames();
}

