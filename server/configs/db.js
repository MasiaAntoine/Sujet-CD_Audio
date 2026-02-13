require("dotenv").config();
const { Pool } = require("pg");

let pool
try{
    // Détecter si on est dans Docker ou en local
    // Si DB_HOST n'est pas défini, essayer "postgres" (Docker) puis "localhost" (local)
    const dbHost = process.env.DB_HOST || (process.env.DOCKER_ENV ? "postgres" : "localhost");
    
    pool = new Pool(process.env.URI_DB 
        ? {connectionString:process.env.URI_DB} 
        : {
            user: process.env.DB_USER || "user",
            host: dbHost,
            database: process.env.DB_NAME || "cd_database",
            password: process.env.DB_PASSWORD || "password",
            port: process.env.DB_PORT || 5432,
        }
    );
}
catch(e){
    console.error(e)
    process.exit(1)
}


module.exports = pool;
