const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Access denied. No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        //temporary
        console.log("AUTH HEADER:", authHeader);
        console.log("TOKEN:", token);

        if (!token) {
            return res.status(401).json({
                message: "Access denied. Inavlid token format"
            });
        }

        const decoded = jwt.verify(
            token,
            "ATS_SECRET_KEY"
        );

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authenticateToken;