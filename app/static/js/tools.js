define(['vnd/classlist'], function(unused){
  // Some quick aliases, added to window to save typing
  window.query = window.query || document.querySelector.bind(document);
  window.queryAll = window.queryAll || document.querySelectorAll.bind(document);
  window.queryChildren = window.queryChildren || function(elem, children) {
    return query(elem).querySelectorAll(':scope ' + children);
  };

  // And same for querying beneath an element
  Element.prototype.query = Element.prototype.querySelector
  Element.prototype.queryAll = Element.prototype.querySelectorAll
  Element.prototype.queryChildren = Element.prototype.queryChildren

  window.log = window.log || console.log.bind(console);

  // Iterate over .queryAll results
  NodeList.prototype.forEach = Array.prototype.forEach;
})

