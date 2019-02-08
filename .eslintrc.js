module.export = {
    "env": {
        "browser": true,
        "webextensions": true,
        "jquery": true,
        "es6": true
    },
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": false,
            "arrowFunctions": true,
            "defaultParams": true,
            "templateStrings": true,
        },
        "sourceType": "module"
    },
    "extends": "eslint:recommended"
};
