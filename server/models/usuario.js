const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es necesario']
    },
    password: {
        type: String,
        required: [true, 'La clave es necesaria']
    },
    img: {
        type: String,
        required: false
    }, // No es obligatoria
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos,
    }, // default: 'USER_ROLE'
    estado: {
        type: Boolean,
        default: true
    }, // Boolean
    google: {
        type: Boolean,
        default: false
    } // Boolean

});

// Método para eliminar el password del json  que no se muestre en la respuesta del DB
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
};

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' })
module.exports = mongoose.model('Usuario', usuarioSchema)