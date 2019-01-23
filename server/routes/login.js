const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();


app.post('/login', function(req, res) {
    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        // Si los usuarios no son iguales
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(usario) o contraseña incorrecta'
                }
            })

        }
        // Si las contraseña no son iguales
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'usario o (contraseña) incorrecta'
                }
            })
        }
        let seed = process.env.SEED;
        let caducidad = process.env.CADUCIDAD_TOKEN;
        let token = jwt.sign({
            usuario: usuarioDB
        }, seed, { expiresIn: caducidad });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token,
        });
    });



});



module.exports = app;