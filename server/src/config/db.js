require("dotenv").config({
    path: require("path").resolve(__dirname, "../../.env")
});

const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ats_db",
    port: Number(process.env.DB_PORT) || 3306,

    ssl: process.env.DB_SSL === "true"
        ? {
            ca: require("fs").readFileSync(
                require("path").resolve(__dirname, "../../ca.pem"),
                "utf8"
            ),
            rejectUnauthorized: true
        }
        : undefined,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("MySQL database connected successfully!");
    connection.release();
});

module.exports = db;