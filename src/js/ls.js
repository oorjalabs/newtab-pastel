/** State, tasks and user variables are stored in local -- used only in front
 * end */
const ls = (function () {
    const storage = chrome.storage.local;
    /**
     * Wrapper function to read chrome.storage as a promise
     * @param getObject
     * @return;
     */
    async function storageGet(getObject) {
        return new Promise(resolve => {
            storage.get(getObject, resolve);
        });
    }
    /**
     * Wrapper function to read chrome.storage as a promise
     * @param  setObject
     * @return;
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
    function remove(keys) {
        return new Promise(resolve => {
            storage.remove(keys, resolve);
        });
    }
    /**
     * @param item
     */
    async function storageFetch(item) {
        const st = await storageGet(item);
        console.debug(typeof item === "string" && st[item] ? st[item] : st);
    }
    return {
        "get": storageGet,
        "set": storageSet,
        "remove": remove,
        "fetch": storageFetch
    };
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtTQUNTO0FBQ1QsTUFBTSxFQUFFLEdBQUcsQ0FBQztJQUVSLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBRXJDOzs7O09BSUc7SUFDSCxLQUFLLFVBQVUsVUFBVSxDQUFJLFNBQTBCO1FBQ25ELE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssVUFBVSxVQUFVLENBQUMsU0FBa0M7UUFDeEQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFHRDs7OztPQUlHO0lBQ0gsU0FBUyxNQUFNLENBQUMsSUFBdUI7UUFDbkMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN6QixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssVUFBVSxZQUFZLENBQUMsSUFBcUI7UUFDN0MsTUFBTSxFQUFFLEdBQUcsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRCxPQUFPO1FBQ0gsS0FBSyxFQUFFLFVBQVU7UUFDakIsS0FBSyxFQUFFLFVBQVU7UUFDakIsUUFBUSxFQUFFLE1BQU07UUFDaEIsT0FBTyxFQUFFLFlBQVk7S0FDeEIsQ0FBQTtBQUNMLENBQUMsQ0FBQyxFQUFFLENBQUMifQ==