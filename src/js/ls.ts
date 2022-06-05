/** State, tasks and user variables are stored in local -- used only in front
 * end */
const ls = (function() {
    const storage = chrome.storage.local;

    /**
     * Wrapper function to read chrome.storage as a promise
     * @param getObject
     * @return;
     */
    async function storageGet<T>(getObject: StorageGetParam): Promise<Record<string, T>> {
        return new Promise(resolve => {
            storage.get(getObject, resolve);
        });
    }

    /**
     * Wrapper function to read chrome.storage as a promise
     * @param  setObject
     * @return;
     */
    async function storageSet(setObject: Record<string, unknown>): Promise<void> {
        return new Promise(resolve => {
            storage.set(setObject, resolve);
        });
    }


    /**
     * Wrapper function to read chrome.storage as a promise
     * @param {String | [String]} keys
     * @return {Promise<Object.<string, *>>}
     */
    function remove(keys: string | string[]): Promise<void> {
        return new Promise(resolve => {
            storage.remove(keys, resolve);
        });
    }

    /**
     * @param item
     */
    async function storageFetch(item: StorageGetParam) {
        const st = await storageGet(item);
        console.debug(typeof item === "string" && st[item] ? st[item] : st);
    }

    return {
        "get": storageGet,
        "set": storageSet,
        "remove": remove,
        "fetch": storageFetch,
    };
})();
