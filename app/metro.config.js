const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Metro tratta come "asset" solo le estensioni elencate qui — .riv (i rig Rive, es.
// assets/lallo.riv) non c'è di default, quindi require() lo cercherebbe come modulo
// sorgente e fallirebbe.
config.resolver.assetExts.push("riv");

module.exports = config;
