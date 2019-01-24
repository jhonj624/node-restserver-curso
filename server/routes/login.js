const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

// Configuraciones de google
// función async -> retorna promesa, necesaria para ejecutar await
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    //console.log(payload.name);
    //console.log(payload.picture);
    //console.log(payload.email);

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,

    }

};


app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        // Si existe un usuario puede pasar  
        if (usuarioDB) {
            // no fue creado por google, pero existe
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticación normal'
                    }
                });
            } else { // Ya esta creado por google, pero se necesita renovar el token
                let seed = process.env.SEED;
                let caducidad = process.env.CADUCIDAD_TOKEN;
                let token = jwt.sign({
                    usuario: usuarioDB
                }, seed, { expiresIn: caducidad });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                })
            }
        } else { // No existe el usuario y se debe crear
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.picture;
            usuario.google = true;
            usuario.password = ':)'; // solo para cumplir la condición del modelo

            // Guardamos nuestro usuario en la BD
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }
                // Si todo sale bien, enviamos el token y el usuario
                let seed = process.env.SEED;
                let caducidad = process.env.CADUCIDAD_TOKEN;
                let token = jwt.sign({
                    usuario: usuarioDB
                }, seed, { expiresIn: caducidad });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });


            });
        }

    });
});

module.exports = app;