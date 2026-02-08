localStorage.openpages = Date.now();
var onLocalStorageEvent = function(e){
  if(e.key == "openpages"){
    // Emit that you're already available.
    localStorage.page_available = Date.now();
  }
  if(e.key == "page_available"){
    alert("One more page already open");
  }
};
window.addEventListener('storage', onLocalStorageEvent, false);