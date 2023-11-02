// Cors definition : Cross Origin Resource Sharing
// change domain from 'https://www.yoursitename.com' to 'https://www.google.com' 
// to run it in console on google using 'fetch('http://localhost:3500');' in console
const allowedOrigins = [
    'https://www.yoursitename.com',
    'http://127.0.0.1:5500',
    'http://localhost:3500'
];

module.exports = allowedOrigins;