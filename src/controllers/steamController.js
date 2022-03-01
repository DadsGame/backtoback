import req from "superagent";
import {getAllGamesCache} from "./steamCacheController.js";

export const getAllGames = async (request, h) => {
    const res =  await req.get('http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json');
    return res.body.applist.apps;
};

// TODO: use cache instead of calling the external API again.
export const searchGlobalGames = async (request, h) => {
    const keywords = request.query.search.toLowerCase().split(' ');
    const res = await getAllGames();
    return  res.filter((game) => {
      const gameName = game.name.toLowerCase().split(' ');
        return keywords.some(keyword => gameName.includes(keyword));
    });
}

