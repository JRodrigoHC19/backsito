const express = require('express');
const querys = require('./database/querys');
const jwt = require('jsonwebtoken');
const fs = require('node:fs');
const router = express.Router();

const privateKey = fs.readFileSync('./jwt/private.key', 'utf8');
const publicKey = fs.readFileSync('./jwt/public.key', 'utf8');


// Middleware para verificar token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    
    if (!token) {
        return res.status(403).json({ msg: 'Token no proporcionado' });
    }

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
            return res.status(403).json({ msg: 'Token inválido' });
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


// Ruta de registro de usuario (POST /register)
router.post('/register', async (req, res) => {
    const emailExists = await querys.isEmailRegisted(req.body.email);
    if (emailExists) { return res.status(400).json({ msg: 'Email ya registrado' }) }
    
    const newUser = await querys.createUser(req.body);
    if (newUser.code === -1) { return res.status(500).json({ msg: newUser.msg });}

    try {
        const json_user = { id: newUser.id, email: req.body.email, role: req.body.role };
        const token = jwt.sign(json_user, privateKey, { expiresIn: '1h', algorithm: 'RS256' });

        res.status(200).json({ message: 'OK!', user: json_user, id_token: token });
        console.log("HTTP POST /register - OK 200");
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});




// Ruta de inicio de sesión (POST /login) - usando las credenciales
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Email y contraseña son obligatorios' });
    }

    try {
        const result = await querys.getUserByEmailAndPassword(email, password);
        if (result.code === 0 || result.code === 1) {
            return res.status(401).json({ msg: result.msg });
        }

        const json_user = { id: result.user.id, role: result.user.role, email: result.user.email };
        const token = jwt.sign(json_user, privateKey, { algorithm: 'RS256', expiresIn: '1h' });

        res.status(200).json({ message: 'OK!', user: json_user, id_token: token });
        console.log("HTTP POST /api/users/login - OK 200");
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});


// Ruta de inicio de sesión (GET /login) - usando el token
router.get('/login', verifyToken, async function (req, res) {
    res.status(200).json({ message: 'OK!', user: req.jwt })
    console.log("HTTP GET /api/users/login - OK 200");
});


module.exports = router;


// -----------------------------------------------------------------------------
// Middleware para verificar roles
// const checkRole = (role) => (req, res, next) => {
//     if (req.userRole !== role) {
//         return res.status(403).json({ msg: 'No tienes permiso para acceder a esta ruta' });
//     }
//     next();
// };
// Ejemplo de una ruta protegida (solo para usuarios con rol 'empresa')
// router.get('/admin', verifyToken, checkRole('empresa'), async (req, res) => {
//     try {
//         const user = await User.findByPk(req.userId);
//         res.json({ user });
//     } catch (error) {
//         res.status(500).json({ msg: 'Error obteniendo datos del usuario' });
//     }
// });