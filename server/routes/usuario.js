const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');

// leo el middleware para verificar token
// uso lectura con destructuracion
const { verificacionToken, verificacionAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

// verificaToken es un middleware
app.get('/usuario', verificacionToken, (req, res) => {

    /* return res.json({
         usuario: req.usuario,
         nombre: req.usuario.nombre,
         email: req.usuario.email
     }); */
    // agregar opciones para búsqueda
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = Number(req.query.limite || 5);

    // agregando filtros para depurar la respuesta mostrada
    Usuario.find({ estado: true }, 'nombre email estado role img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // Retornar el numero de registros en una colección
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo,
                });
            });

        });

});

// Crea usuario nuevo en la DB
app.post('/usuario', [verificacionToken, verificacionAdmin_Role], (req, res) => {
    // verificación de token
    /* return res.json({
        ok: true,
        usuario: req.usuario,
    }); */

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), // Store hash in your password DB
        role: body.role,
        img: body.img,
    });

    // save es un metodo de mongoose
    // acá se envía los datos y se recibe la respuesta de la DB
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Eliminamos la respuesta de la contraseña, no es necesario mostrar esta info 
        // en la respuesta
        //usuarioDB.password = null; en el model se agregó methodo para quitar el password

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
});

// Para actualización de un registro
app.put('/usuario/:id', [verificacionToken, verificacionAdmin_Role], (req, res) => {
    let id = req.params.id;
    /*  haciendo uso de la librería *underscore _* para hacer un filtrado de las 
        propiedades válidas que serán modificadas en la BD */

    let body = _.pick(req.body, ['nombre', 'email', 'img', ]);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        // si existe algún error en la consulta
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        // respuesta si la consulta es OK. status 200
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

// Borrado de la BD solo cambiando el estado de activación en la BD, 
// esto se usa para seguir guardando la información y hacer estadísitcas posteriores
app.delete('/usuario/:id', [verificacionToken, verificacionAdmin_Role], (req, res) => {

    let id = req.params.id;

    let cambiaEstado = {
        estado: false
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (usuarioBorrado.estado === false) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario ya ha sido dado de baja'
                }
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }


        res.json({
            ok: true,
            message: usuarioBorrado
        });

    });
});
// Borrado de un usuario de forma fisica de la BD 
/* app.delete('/usuario/:id', function(req, res) {
    let id = req.params.id;

    Usuario.findByIdAndRemove (id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        })
    });

}); */

module.exports = app;