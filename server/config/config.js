// =======================
// Puerto
// =======================
process.env.PORT = process.env.PORT || 8081;


// =======================
// Entorno
// =======================
//process.env.NODE_ENV = process.env.NODE_ENV || 'env'; // que torta
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; // bien

// =======================
// Vencimiento del Token
// =======================
// 60 segundos
// 60 minutos
// 24 horas
// 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// =======================
// SEED de autencicación
// =======================
let seed;

if (process.env.NODE_ENV === 'dev') {
    seed = 'este-es-el-seed-de-desarrollo';

} else {
    seed = process.env.SEED_PRO;
}
process.env.SEED = seed;
console.log('seed:');
console.log(seed);
// =======================
// Base de datos
// =======================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;
console.log('urlDB:');
console.log(urlDB);

// =======================
// Base de datos
// =======================

process.env.CLIENT_ID = process.env.CLIENT_ID || "203741764132-ab3jrnu0gkt7gn70bithfggei3avta14.apps.googleusercontent.com"