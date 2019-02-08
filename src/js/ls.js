var ls = chrome.storage.local;

ls.fetch = a => a ? ls.get(a, s => console.log(s[a])) : ls.get(s => console.log(s));
