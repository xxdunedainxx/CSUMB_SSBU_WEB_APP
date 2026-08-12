import type { AppConfigurationOptions } from "./Configuration";

export const DevConfig: AppConfigurationOptions = {
    env: "dev",
    version: "0.0.1",
    config: {
        logging: { level: "debug" },
        headers: {},
        backend: {
            host: "localhost",
            port: 80,
            appHealthPort: 80,
            hostRoute: "",
            ssl: false
        },
        dev: {
            mockData: true
        }
    }
};

export const ProdConfig: AppConfigurationOptions = {
    env: "prod",
    version: "0.0.1",
    config: {
        logging: { level: "debug" },
        headers: {},
        backend: {
            host: "localhost",
            port: 80,
            appHealthPort: 80,
            hostRoute: "/backend",
            ssl: false
        },
        dev: {
            mockData: true
        }
    }
};