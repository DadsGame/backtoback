import {
    getAllGames,
    getGameDetails,
    getOwnedGames,
    getProfileDetails,
    searchGlobalGames
} from "../controllers/steamController.js";

const routes = [
    {
        method: 'GET',
        path: '/api/games',
        handler: getAllGames,
    },
    {
        method: 'GET',
        path: '/api/g/games',
        handler: searchGlobalGames,
    },
    {
        method: 'GET',
        path: '/api/games/details',
        handler: getGameDetails,
    },
    {
        method: 'GET',
        path: '/api/profile',
        handler: getProfileDetails,
    },
    {
        method: 'GET',
        path: '/api/profile/owned-games',
        handler: getOwnedGames,
    },

];

export default routes;