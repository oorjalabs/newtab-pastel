var ls = chrome.storage.local;

ls.fetch = function(a){
  if(a)
    ls.get(a, function(s){console.log(s[a])});
  else
    ls.get(function(s){console.log(s)});
}
