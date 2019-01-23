const jwt = require('jsonwebtoken');
// =======================
// Verificar Token
// =======================

let verificacionToken = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            // err 401: usuario no autorizado
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }
        // decoded: es el payload
        req.usuario = decoded.usuario;
        // después de verificar el token se continua con la 
        // consulta en el servidor
        next();
    });
};

let verificacionAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;
    if (usuario.role !== 'ADMIN_ROLE') {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador, y no puede realizar esta tarea'
            }
        });
    }
    next();
};

module.exports = {
    verificacionToken,
    verificacionAdmin_Role
}