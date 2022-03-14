import req from "superagent";
import {config} from "dotenv";

class SteamService {

    constructor(authorization) {
        config();
        this.authorization = process.env.STEAM_API_KEY;
    }

    async getAllGames() {
        const res = await req.get('http://api.steampowered.com/ISteamApps/GetAppList/v0002?format=json');
        return res.body.applist.apps;
    }

    async searchGlobalGames(games, keyword) {
        return games.filter(({name}) => {
            // TODO: maybe use regex instead
            const kw = keyword.toLowerCase().split(' ').join('');
            return name
                .toLowerCase()
                .split(' ')
                .join('')
                .startsWith(kw);
        });
    }

    async getGameDetails(appId) {
        const game = await req.get(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
        return game.body[appId];
    }

    async getProfileDetails(profileId) {
        const profile = await req.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002?key=${this.authorization}&steamids=${profileId}`);
        return profile.body.response.players[0];
    }

    async getOwnedGames(profileId) {
        const playerGames = await req.get(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001?key=${this.authorization}&steamid=${profileId}`);
        return playerGames.body.response;
    }
}

export default SteamService;