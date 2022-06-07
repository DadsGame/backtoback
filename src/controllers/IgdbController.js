import {conf} from "../../conf.js";
import IgdbService from "../services/igdbService.js";

const igdbService = new IgdbService();
const ONE_HOUR = 60 * 60;
const ONE_DAY = ONE_HOUR * 24;

const redisClient = await conf.redisClient();

export const searchGames = async (request, h) => {
    const gameName = request.query?.name?.toLowerCase();
    if (gameName == null) {
       const msg = {error: 'search query param not present or not content has been provided'};
       return h.response(msg).code(400);
    }
    const cache = await redisClient.get(`igdb/search:${gameName}`);
    if(cache) {
        return JSON.parse(cache);
    }
    const games = await igdbService.searchGames(gameName);
    await redisClient.set(`igdb/search:${gameName}`, JSON.stringify(games));
    await redisClient.expire(`igdb/search:${gameName}`, ONE_HOUR);
    return games;
};

export const topTenGames = async (request, h) => {
    const cache = await redisClient.get(`igdb/top_ten`);
    if(cache) {
        return JSON.parse(cache);
    }
    const topTen = await igdbService.topTenGames();
    await redisClient.set('igdb/top_ten', JSON.stringify(topTen));
    await redisClient.expire('igdb/top_ten', 10);
    return topTen;
}

export const comingSoonGames = async (request, h) => {
    const cache = await redisClient.get(`igdb/coming_soon`);
    if(cache) {
        return JSON.parse(cache);
    }
    const comingSoonGames = await igdbService.comingSoonGames();
    await redisClient.set('igdb/coming_soon', JSON.stringify(comingSoonGames));
    await redisClient.expire('igdb/coming_soon', ONE_HOUR);
    return comingSoonGames;
}

export const getGameById = async (request, h) => {
    const gameId = request.query?.id?.toLowerCase();
    if (gameId == null) {
        const msg = {error: 'search query param not present or no content has been provided'};
        return h.response(msg).code(400);
    }
    const cache = await redisClient.get(`igdb/gamebyid:${gameId}`);
    if(cache) {
        return JSON.parse(cache);
    }
    const game = await igdbService.getGameById(gameId);
    await redisClient.set(`igdb/gamebyid:${gameId}`, JSON.stringify(game));
    await redisClient.expire(`igdb/gamebyid:${gameId}`, ONE_HOUR);
    return game;
}

export const gameMatch = async (request, h) => {
    const gameId = request.query?.id?.toLowerCase();
    const gameName = request.query?.name;
    if (gameId == null || gameName == null || gameId === '' || gameName === '') {
        const msg = {error: 'search query param not present or no content has been provided'};
        return h.response(msg).code(400);
    }
    const cache = await redisClient.get(`igdb/match:${gameId}-${gameName}`);
    if(cache) {
        return JSON.parse(cache);
    }
    const game = await igdbService.gameMatch(gameName, gameId);
    await redisClient.set(`igdb/match:${gameId}-${gameName}`, JSON.stringify(game));
    await redisClient.expire(`igdb/match:${gameId}-${gameName}`, ONE_HOUR);
    return game;
}

export const platforms = async (request, h) => {
    return await igdbService.topTenGames();
}

