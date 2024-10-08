module.exports = {
  apps: [
    {
      name: "app",
      script: "./src/server.js",
      env_production: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
