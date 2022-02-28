import {getAllGames} from "./steamController.js";

export const getAllGamesCache = {
    // TODO : Get this from a global variable and import it to use ti here.
    cache: 'backtoback-cache',
    expiresIn: 3600 * 24 * 1000,
    segment: 'customSegment',
    generateFunc: getAllGames,
    generateTimeout: 2000,
};
