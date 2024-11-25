// next.config.js
const withPWA = require('next-pwa')({
     dest: 'public',
     register: true,
     skipWaiting: true,
     disable: process.env.NODE_ENV === 'development',
});

module.exports = {
     images: {
          domains: ['lh3.googleusercontent.com', 'dar-pharmacy.s3.eu-central-1.amazonaws.com', 'utfs.io'],
     },
     ...withPWA,
};
