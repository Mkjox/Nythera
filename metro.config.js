// Extend expo's default Metro config to avoid custom config issues
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
