import {searchGames, platforms, topTenGames} from "../controllers/IgdbController.js";

const routes = [
    {
        method: 'GET',
        path: 'games/search',
        handler: searchGames,
    },
    {
        method: 'GET',
        path: 'games/platforms',
        handler: platforms,
    },
    {
        method: 'GET',
        path: 'topten',
        handler: topTenGames,
    },
].map((route) => ({...route, path: `/api/igdb/${route.path}`}));;

export default routes;