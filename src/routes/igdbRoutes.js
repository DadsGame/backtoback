import {searchGames} from "../controllers/IgdbController.js";

const routes = [
    {
        method: 'GET',
        path: 'games/search',
        handler: searchGames,
    },
].map((route) => ({...route, path: `/api/igdb/${route.path}`}));;

export default routes;