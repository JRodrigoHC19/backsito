const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('node:fs');
const querys = require('../database/querys');
const router = express.Router();

const { SignUpCheck, SignInCheck } = require('../validator.js');
const { validationResult } = require('express-validator');

const privateKey = fs.readFileSync('../config/private.key', 'utf8');
const publicKey = fs.readFileSync('../config/public.key', 'utf8');


const authenticateJWT = function (req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.jwt = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        console.log(req.jwt);
        next();
    });
};


router.post('/create', SignUpCheck(), async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        console.log("HTTP POST /api/users/create - ERROR 400");
        return;
    }
    
    const result = await querys.createUser(req.body);

    const token = jwt.sign({
        id: result.id,
        email: result.email,
        role: result.role
    }, privateKey, { expiresIn: '1h', algorithm: 'RS256' });

    res.status(200).json({
        message: 'User API is running!',
        user: {
            id: result.id,
            email: result.email,
            role: result.role
        },
        id_token: token,
        expires_in: 3600
    })
    console.log("HTTP POST /api/users/create - OK 200");
});


router.get('/login', authenticateJWT, async function (req, res) {
    res.status(200).json({ message: 'OK!', user: req.jwt })
    console.log("HTTP GET /api/users/login - OK 200");
});


router.post('/login', SignInCheck(), async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        console.log("HTTP POST /api/users/login - ERROR - Creadenciales Invalidas");
        return;
    }

    const result = await querys.getUserByEmailAndPassword(req.body.email, req.body.password);
    const json_user = { id: result.id, email: result.email, role: result.role };
    const token = jwt.sign(json_user, privateKey, {expiresIn: '1h', algorithm: 'RS256'});


    res.status(201).json({ message: 'OK!', user: json_user, id_token: token })
    console.log("HTTP POST /api/users/login - OK 200");
});


module.exports = router;