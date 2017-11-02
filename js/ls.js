var ls = chrome.storage.local;

ls.fetch = a => {
  if(a)
    ls.get(a, s => console.log(s[a]));
  else
    ls.get(s => console.log(s));
}
