import {getAllGamesCache} from "../controllers/steamCacheController.js";
import {searchGlobalGames} from "../controllers/steamController.js";

const routes = [
    {
        method: 'GET',
        path: '/api/games',
        handler: getAllGamesCache,
    },
    {
        method: 'GET',
        path: '/api/g/games',
        handler: searchGlobalGames,
    }

];

export default routes;