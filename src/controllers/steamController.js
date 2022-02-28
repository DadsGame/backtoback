import req from "superagent";

export const getAllGames = async (request, response) => {
    const res =  await req.get('http://api.steampowered.com/ISteamApps/GetAppList/v0002/?format=json');
    return res.body.applist.apps;
};

