import Configuration, { type AppConfigurationOptions } from "./Configuration";

/**
 * General setup class. Should be used within most pages 
 */
export class Setup{
    public readonly config: Configuration;

    constructor(){
        const conf: AppConfigurationOptions = {
        env: 'dev',
        version: '0.0.1',
        config: {
            logging: { level: 'debug' },
            headers: {},
            backend: {
            host: 'localhost',
            port: 80,
            appHealthPort: 80,
            hostRoute: '',
            ssl: false
            },
            dev: {
            mockData: true
            }
        }
        };
        this.config = new Configuration(
            conf
        );
    }

    run(){
        console.log("Run client side setup")
    }
}

export default Setup;