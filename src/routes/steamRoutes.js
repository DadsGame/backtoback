import {
    getAllGames, getAppNews,
    getGameDetails,
    getOwnedGames,
    getProfileDetails,
    searchGlobalGames
} from "../controllers/steamController.js";

const routes = [
    {
        method: 'GET',
        path: 'games',
        handler: getAllGames,
    },
    {
        method: 'GET',
        path: 'g/games',
        handler: searchGlobalGames,
    },
    {
        method: 'GET',
        path: 'games/details',
        handler: getGameDetails,
    },
    {
        method: 'GET',
        path: 'profile',
        handler: getProfileDetails,
    },
    {
        method: 'GET',
        path: 'profile/owned-games',
        handler: getOwnedGames,
    },
    {
        method: 'GET',
        path: 'games/news',
        handler: getAppNews,
    }
].map((route) => ({...route, path: `/api/steam/${route.path}`}));;

export default routes;