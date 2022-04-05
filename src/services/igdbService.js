import req from "superagent";
import {conf} from "../../conf.js";
const ONE_HOUR = 60 * 60;



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
        console.log('hello')
        const res =  await req
            .post('https://api.igdb.com/v4/games/')
            .set('Authorization', `Bearer ${this.credentials.authorization}`)
            .set('Client-ID', this.credentials.client_id)
            .type('text/plain')
            .send(`fields *; search "${gameName}";`)
            .catch((err) => console.error(err));

        return res.body;
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
        await redisClient.expire('igdb/platforms', ONE_HOUR);
        return res.body;
    }

}

export default IgdbService;