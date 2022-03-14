import SteamService from "../services/steamService.js";
import {config} from "../../config.js";


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

export const getOwnedGames = async (request, h) => {
    const profileid = request.query.profileid;
    return await steamService.getOwnedGames(profileid);
}


