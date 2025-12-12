// next.config.js
const withPWA = require('next-pwa')({
     dest: 'public',
     register: true,
     skipWaiting: true,
     disable: process.env.NODE_ENV === 'development',
});

module.exports = {
     images: {
          remotePatterns: [
               {
                    protocol: 'https',
                    hostname: 'lh3.googleusercontent.com',
               },
               {
                    protocol: 'https',
                    hostname: 'dar-pharmacy.s3.eu-central-1.amazonaws.com',
               },
               {
                    protocol: 'https',
                    hostname: 'utfs.io',
               },
          ],
     },
     ...withPWA,
};
