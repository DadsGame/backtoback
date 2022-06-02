import req from "superagent";
import {conf} from "../../conf.js";
import {gameMatch} from "../controllers/IgdbController.js";
const ONE_HOUR = 60 * 60;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;
const ONE_MONTH = ONE_WEEK * 4;
const ONE_YEAR = ONE_MONTH * 12;




function getErrorMessage (error) {
    if (error.code === 'EAI_AGAIN') {
        return 'Cannot reach the API, please check your internet connection.';
    }
    if (error.code === 'ECONNRESET') {
        return 'The connection to the API was closed abruptly, please try again.';
    }
    if (error.response && error.response.body && error.response.body.message) {
        return error.response.body.message;
    }
    if (error.response && error.response.text) {
        try {
            const parsedText = JSON.parse(error.response.text);
            if (parsedText.message) {
                return parsedText.message;
            }
            // fallback
        }
        catch (e) {
            // fallback
        }
    }
    if (error.response != null && error.response.status != null) {
        return `Error from API: ${error.response.status} ${error.message}`;
    }
    return `Unknown error from API: ${error.message}`;
}

class IgdbService {

    constructor(authorization) {
        this.credentials = conf.IGDB_AUTHORIZATION;
    }


    async searchGames(gameName) {
        // TODO: We might want to filter fields later on (should be a global var)
        // const res = await req.post('https://api.igdb.com/v4/games/').body(`fields *; search ${gameName}`);
        const formattedGames = [];
        const res =  await req
            .post('https://api.igdb.com/v4/games/')
            .set('Authorization', `Bearer ${this.credentials.authorization}`)
            .set('Client-ID', this.credentials.client_id)
            .type('text/plain')
            .send(`fields *; search "${gameName}";`)
            .catch((err) => console.error(err));

        for (const game of res.body) {
            const cover = await this._retrieveAndUpdateCover(game.id);
            formattedGames.push({...game, cover: cover[0]?.url});
        }
        return formattedGames;
    }

    /**
     * @param platforms - platforms you want the top on.
     * @param timeWindow - Time window in months (default to three months).
     */
    async topTenGames(platforms = [], timeWindow = 3) {
        const allPlatforms = await this._retrieveAndUpdatePlatforms();
        const now = Date.now();
        const date = new Date(now);
        const ts = new Date(date.setMonth(date.getMonth() - timeWindow)).getTime();
        const res = await req
            .post('https://api.igdb.com/v4/games/')
            .set('Authorization', `Bearer ${this.credentials.authorization}`)
            .set('Client-ID', this.credentials.client_id)
            .type('text/plain')
            .send(`fields name, first_release_date, aggregated_rating; where first_release_date > ${parseInt(ts/1000)} & first_release_date < ${parseInt(now/1000)} & aggregated_rating != null; limit 10; sort aggregated_rating desc;`)
            .catch((err) => console.error(err));
        const formattedGames = [];
        for (const game of res.body) {
            const cover = await this._retrieveAndUpdateCover(game.id);
            formattedGames.push({...game, cover: cover[0].url});
        }
        // return res.body.map( (game) => ({...game, cover:  this._retriveAndUpdateCover(game.id)}));
        return formattedGames;
    }

    async comingSoonGames(platforms = [], timeWindow = 1, limit = 20) {
        const now = Date.now();
        const date = new Date(now);
        const ts = new Date(date.setMonth(date.getMonth() + timeWindow)).getTime();
        const res = await req
            .post('https://api.igdb.com/v4/games/')
            .set('Authorization', `Bearer ${this.credentials.authorization}`)
            .set('Client-ID', this.credentials.client_id)
            .type('text/plain')
            .send(`fields *; where first_release_date > ${parseInt(now/1000)} & first_release_date < ${parseInt(ts/1000)}; limit ${limit}; sort first_release_date asc;`)
            .catch((err) => console.error(err));
        const formattedGames = [];
        for (const game of res.body) {
            const cover = await this._retrieveAndUpdateCover(game.id);
            formattedGames.push({...game, cover: cover[0].url});
        }
        return formattedGames;
    }

    async _retrieveAndUpdateCover(gameid) {
        // TODO: put this in a lib function I guess (redis cache)
        const redisClient = conf.redisClient();
        await redisClient.connect();
        const cache = await redisClient.get(`igdb/cover:${gameid}`);
        if(cache) {
            return JSON.parse(cache);
        }
        const res = await req
            .post('https://api.igdb.com/v4/covers/')
            .set('Authorization', `Bearer ${this.credentials.authorization}`)
            .set('Client-ID', this.credentials.client_id)
            .type('text/plain')
            .send(`fields game, url; where game = ${gameid};`)
            .catch((err) => console.error(err));
        const formattedCover = res.body.map((cover) => (
            {
                ...cover,
                url: 'https:' + cover.url
                .replace(/t_\w+/, 't_cover_big')
            }
            ));
        await redisClient.set(`igdb/cover:${gameid}`, JSON.stringify(formattedCover));
        await redisClient.expire(`igdb/cover:${gameid}`, ONE_HOUR);
        return formattedCover;

    }

    async _retrieveAndUpdatePlatforms() {
        // TODO: put this in a lib function I guess (redis cache)
        const redisClient = conf.redisClient();
        await redisClient.connect();
        const cache = await redisClient.get('igdb/platforms');
        if(cache) {
            return JSON.parse(cache);
        }
        const res = await req
            .post('https://api.igdb.com/v4/platforms/')
            .set('Authorization', `Bearer ${this.credentials.authorization}`)
            .set('Client-ID', this.credentials.client_id)
            .type('text/plain')
            .send(`fields id, name; limit 500;`)
            .catch((err) => console.error(err));
        await redisClient.set('igdb/platforms', JSON.stringify(res.body));
        await redisClient.expire('igdb/platforms', ONE_YEAR);
        return res.body;
    }

    async _retrieveAndUpdateGenres() {
        const redisClient = conf.redisClient();
        await redisClient.connect();
        const cache = await redisClient.get('igdb/genres');
        if(cache) {
            return JSON.parse(cache);
        }
        const res = await req
            .post('https://api.igdb.com/v4/genres/')
            .set('Authorization', `Bearer ${this.credentials.authorization}`)
            .set('Client-ID', this.credentials.client_id)
            .type('text/plain')
            .send(`fields id, name; limit 500;`)
            .catch((err) => console.error(err));
        await redisClient.set('igdb/genres', JSON.stringify(res.body));
        await redisClient.expire('igdb/genres', ONE_YEAR);
        return res.body;
    }

    async getGameById(gameId) {
        const res =  await req
            .post('https://api.igdb.com/v4/games/')
            .set('Authorization', `Bearer ${this.credentials.authorization}`)
            .set('Client-ID', this.credentials.client_id)
            .type('text/plain')
            .send(`fields *; where id = ${gameId};`)
            .catch((err) => console.error(err));

        const formattedGames = [];
        const [platforms, genres] = await Promise.all([
            await this._retrieveAndUpdatePlatforms(),
            await this._retrieveAndUpdateGenres(),
        ]);
        for (const game of res.body) {
            const cover = await this._retrieveAndUpdateCover(game.id);
            const formattedPlatforms = [];
            const formattedGenres = [];
            game.platforms.forEach((platform) => {
                const foundPlatform = platforms.find((p) => p.id === platform);
                formattedPlatforms.push(foundPlatform);
            });
            game.genres.forEach((genre) => {
                const foundGenre = genres.find((g) => g.id === genre);
                formattedGenres.push(foundGenre);
            });
            formattedGames.push({...game, cover: cover[0].url, platforms: formattedPlatforms, genres: formattedGenres});
        }
        return formattedGames;
    }

    async gameMatch(gameName, gameId) {
        const res =  await req
            .post('https://api.igdb.com/v4/games/')
            .set('Authorization', `Bearer ${this.credentials.authorization}`)
            .set('Client-ID', this.credentials.client_id)
            .type('text/plain')
            .send(`fields name, id; where id = '${gameId}' & name = "${gameName}";`)
            .catch((err) => console.error(err));
        return {shouldBeLocal: res.body.length === 0};
    }
}

export default IgdbService;