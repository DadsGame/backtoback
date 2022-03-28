import req from "superagent";
import {config} from "dotenv";

function getErrorMessage (error) {
    if (error.code === 'EAI_AGAIN') {
        return 'Cannot reach the Clever Cloud API, please check your internet connection.';
    }
    if (error.code === 'ECONNRESET') {
        return 'The connection to the Clever Cloud API was closed abruptly, please try again.';
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
        config();
        this.credentials = {authorization: process.env.TWITCH_TOKEN, client_id: process.env.TWITCH_CLIENT_ID};
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

}

export default IgdbService;