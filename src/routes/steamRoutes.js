import {getAllGames} from "../controllers/steamController.js";
import {getAllGamesCache} from "../controllers/steamCacheController.js";

const routes = [
    {
        method: 'GET',
        path: '/api/games',
        handler: getAllGamesCache,
    }

];

export default routes;