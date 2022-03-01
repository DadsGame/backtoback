import SteamService from "../services/steamService.js";
import {config} from "../../config.js";
import req from "superagent";


const steamService = new SteamService();
const ONE_HOUR = 60 * 60;
const ONE_DAY = ONE_HOUR * 24;

export const getAllGames = async (request, h) => {
    const redisClient = config.redisClient();
    await redisClient.connect();
    const cache = await redisClient.get('allGames');
    if(cache) {
        return JSON.parse(cache);
    }
    const games = await steamService.getAllGames();
    await redisClient.set('allGames', JSON.stringify(games));
    await redisClient.expire('allGames', ONE_HOUR);
    return games;

};

export const searchGlobalGames = async (request, h) => {
    const games = await getAllGames();
    const keyword = request.query.search.toLowerCase();
    return steamService.searchGlobalGames(games, keyword);
}

export const getGameDetails = async (request, h) => {
    const appId = request.query.appid;
    return await steamService.getGameDetails(appId);
}

export const getProfileDetails = async (request, h) => {
    const profileid = request.query.profileid;
    return await steamService.getProfileDetails(profileid);
}

// TODO: add a sort by playtime and game name
export const getOwnedGames = async (request, h) => {
    const profileid = request.query.profileid;
    const playerGames = await steamService.getOwnedGames(profileid);
    const games = await getAllGames();
    const formattedGames = playerGames.games.map((game) => {
        const name = games.find(({appid}) => game.appid === appid)?.name ?? '';
        return {name, ...game, playtime_forever_hour: game.playtime_forever / 60};
    });
    return {
        game_count: playerGames.game_count,
        games: formattedGames,
    }
}

export const getAppNews = async (request, h) => {
    const appId = request.query.appid;
    return await steamService.getAppNews(appId);
}
