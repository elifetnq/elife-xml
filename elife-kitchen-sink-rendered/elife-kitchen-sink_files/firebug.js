// This code creates window.console if it doesn't exist.
// It also creates stub functions for those functions that are missing in window.console.
// (Safari implements some but not all of the firebug window.console methods--this implements the rest.)
(function() {
    var names = [ "log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group",
                  "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd" ];

    if (typeof(console) === 'undefined' || typeof console === "function" ) { //"typeof function" is needed see PP-769 
      console = {};
    }

    for (var i = 0; i < names.length; ++i) {
       if (typeof(console[names[i]]) === 'undefined') {
          console[names[i]] = function() { return false; };
       }
    }
})();
