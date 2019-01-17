// =======================
// Puerto
// =======================
process.env.PORT = process.env.PORT || 8081


// =======================
// Entorno
// =======================
process.env.NODE_ENV = process.env.NODE_ENV || 'env';

// =======================
// Base de datos
// =======================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://cafe-admin:abc123xyz@ds051645.mlab.com:51645/cafe'
}

process.env.URLDB = urlDB;