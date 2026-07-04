import Configuration, { type AppConfigurationOptions } from "./Configuration";
import { DevConfig, ProdConfig } from "./Configurations";
/**
 * General setup class. Should be used within most pages
 */
export class Setup{
    public readonly config: Configuration;

    constructor(){
        const ActiveConfig = import.meta.env.PROD ? ProdConfig : DevConfig;
        this.config = new Configuration(
            ActiveConfig
        );
    }

    run(){
        console.log("Run client side setup")
    }
}

export default Setup;