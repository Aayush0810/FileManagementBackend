const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).send({ error: 'No authentication token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded.id }; // Assuming the token was encoded with an object containing the id
        next();
    } catch (error) {
        res.status(401).send({ error: 'Invalid token.' });
    }
};

module.exports = {
    authMiddleware
}