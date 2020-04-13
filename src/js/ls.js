// var ls = chrome.storage.local;

// ls.fetch = a => a ? ls.get(a, s => console.log(s[a])) : ls.get(s => console.log(s));

// State, tasks and user variables are stored in local -- used only in front end
var ls = (function () {
    
    const storage = chrome.storage.local;

    /**
     * Wrapper function to read chrome.storage as a promise
     * @param {Object.<string, *>} getObject 
     * @return {Promise<Object.<string, *>>}
     */
    async function storageGet(getObject) {
        return new Promise(resolve => {
            storage.get(getObject, resolve);
        });
    }

    /**
     * Wrapper function to read chrome.storage as a promise
     * @param {Object.<string, *>} setObject 
     * @return {Promise<Object.<string, *>>}
     */
    async function storageSet(setObject) {
        return new Promise(resolve => {
            storage.set(setObject, resolve);
        });
    }


    /**
     * Wrapper function to read chrome.storage as a promise
     * @param {String | [String]} keys 
     * @return {Promise<Object.<string, *>>}
     */
    async function remove(keys) {
        return new Promise(resolve => {
            storage.remove(keys, resolve);
        });
    }


    async function storageFetch(item) {
        const st = await storageGet(item);
        console.debug(item && st[item] ? st[item] : st);
    }

    return {
        "get": storageGet,
        "set": storageSet,
        "remove": remove,
        "fetch": storageFetch
    }
})();
