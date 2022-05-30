import {
    searchGames,
    platforms,
    topTenGames,
    comingSoonGames,
    getGameById,
    gameMatch
} from "../controllers/IgdbController.js";

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
    {
        method: 'GET',
        path: 'coming_soon',
        handler: comingSoonGames,
    },
    {
        method: 'GET',
        path: 'games/byId',
        handler: getGameById,
    },
    {
        method: 'GET',
        path: 'games/shouldBeLocal',
        handler: gameMatch,
    }
].map((route) => ({...route, path: `/api/igdb/${route.path}`}));

export default routes;