import config from '../assets/config/config.json';

export const environment = {
    production: config.PRODUCTION,
    API_URL: config.API_URL,
    STRATUM_URL: config.STRATUM_URL
};
