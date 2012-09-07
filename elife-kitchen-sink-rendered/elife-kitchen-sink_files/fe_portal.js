// Requires: Base-p.js
Portal = Base.extend({
   constructor: function() {
      this.init();
   },
   init: function() {
   }
}, {
   _instance: null,

   getInstance: function() {
      return Portal._instance || (Portal._instance = new Portal());
   },

   // Request that the dispatcher submit the form after all message passing
   // has completed.
   requestSubmit: function() {
      Dispatcher.getInstance().requestSubmit();
   },

   // Broadcast a message to all listeners.
   // Perform submit if any listeners requested it.
   $send: function(sMessage, oData, oDst) {
      var d = Dispatcher.getInstance();
      d.submitCheckBegin();
      d.notify(null, sMessage, oData, oDst);
      d.submitCheckEnd();
   }
});

Portal.Component = Base.extend({

   // Instance interface
   constructor: function(path, name, notifier) {
      this.init(path, name, notifier);
   },

   // Initialize this component instance
   init: function(path, name, notifier) {
      this.name = name;
      this.path = path;
      this.notifier = notifier;

      // A component may listen for global message by defining a
      // method called listen.<messagename>, and defining a
      // callback function f(message, data, src); "message" is the
      // message text, "data" is the object the sender transmitted with
      // the message, and "src" is the sender.
      // When the function is called, the value of "this" is the portlet.
      //
      // Example:
      // Portal.Portlet.ShowIt = Portal.Portlet.extend({
      //   init: function(a,b,c) { this.base(a,b,c); },
      //
      //    listen: {
      //       selectionChanged: function(msg, data, src) {
      //          alert("Selchange to " + data.newText + " on " +src.name);
      //          this.setValue("selText", data.newText);
      //    }
      //
      // This approach has the following limitations:
      // -- Can only listen for global message
      // -- It's static; meaning you can't listen now and then unlisten later
      //
      // The listen clause can also be used to define browser event handlers
      //      listen: {
      //	"Go<click>": function(e, target, name) { }
      //      }
      // Drawback:
      // -- Fourth argument to utils.addEvent("bubble") is always false.
      //

      if (this.listen) {
         var msg;
         var isEvent = new RegExp(/^([^<]+)<([^>]+)>/);
         var m;
         var d = Dispatcher.getInstance();
         for (msg in this.listen) {
            m = isEvent.exec(msg);
            if (m) {
               this.addEvent(m[1], m[2], this.listen[msg], false);
           } else {
               this._listen(msg, this.listen[msg], null);
            }
         }
      }

      // Initialize senders. A send: function defined as "null" gets
      // the default implementation, which is a call to this._send()
      if (this.send) {
         for (msg in this.send) {
            if (this.send[msg] == null) {
               this.send[msg] = this.makeSender(this, msg);
            }
         }
      }
   },

   // Return a function that sends a specific message
   makeSender: function(sender, msg) {
      return function(obj) {
         // FIXME: Here's where destination is lost
         return sender._send(msg, obj, null);
      };
   },

   // Get a portlet attribute by name.
   // Pass the name of the attribute to get just the attribute's value
   // Pass { 'attr': attrvalue, 'prop': propvalue } to get a property instead.
   // If there are multiple items with the same name, you get an array
   getValue: function(attr) {
      var prop = null;
      var ix;

      if(typeof attr === "object"){
         prop = attr.prop;
         attr = attr.attr;
      }
      else if ((ix = attr.indexOf(":")) >= 0) {
         prop = attr.substring(ix+1);
         attr = attr.substring(0, ix);
      }

      var inp = this.getInputs(attr);
      if (!inp) { return null; }

      if (inp.length == 1) {
         inp = inp[0];
         return (prop && prop.toLowerCase() !== "value")? inp.getAttribute(prop) : htmlutils.getValue(inp);
      }      
      else if (inp.length > 0 && (!prop || prop.toLowerCase() === "value") && (inp[0].type || "").toLowerCase() === "radio") { 
         return htmlutils.getValue(inp);
      }      
      var result = [];
      for (var i = 0; i < inp.length; i++) {
         if (prop  && prop.toLowerCase()!=="value") {
            if (typeof(inp[i][prop]) != 'undefined') {
               result[result.length] = inp[i][prop];
            } else {
               result[result.length] = inp[i].getAttribute(prop);
            }
         } else {
            result[result.length] = htmlutils.getValue(inp[i]);
         }
      }
      return result;
   },

   // Get a portlet attribute's value as a *list* by name.
   // This always returns an array.
   // Currently can't do this by prop, and only works for single inputs
   // If there are multiple items with the same name, you get an array
   // of arrays, even if the items are scalars                                  
   getList: function(attr) {
      var ix;
      var prop = null;

      if ((ix = attr.indexOf(":")) >= 0) {
         prop = attr.substring(ix+1);
         attr = attr.substring(0, ix);
      }
      if (prop) {
         throw "UNIMPLEMENTED: Component.getList: Getting list by property";
      }

      var inp = this.getInputs(attr);

      if (!inp) { return null; }

      if (inp.length == 1) {
         inp = inp[0];
         return htmlutils.getList(inp);
      }

      var result = [];
      for (var i = 0; i < inp.length; i++) {
         result[result.length] = htmlutils.getList(inp[i]);
      }
      return result;
   },

   // Set the value of a named portlet attribute.
   // A scalar input must exist for the attribute.
   // If the value is an array, try splitting the array with ", " and
   // setting the result.
   // If the attribute name is "attrname:prop", the set the
   // HTML attribute property prop instead of setting its "value".
   setValue: function(attr, value) {
      var prop = null;
      var ix;

      if ((ix = attr.indexOf(":")) >= 0) {
         prop = attr.substring(ix+1);
         attr = attr.substring(0, ix);
      }

      var inp = this.getInputs(attr);
     
      if (inp.length == 1) {
         inp = inp[0];
         if (prop) {
            if (typeof(inp[prop]) != 'undefined') {
               inp[prop] = value;
            } else {
               inp.setAttribute(prop, value);
            }
         } else {
            inp.value = value;
         }
      } else {
         // FIXME: This does nothing so far. It should split
         // values and assign one-to-one.
         throw "UNIMPLEMENTED: Cannot (yet) set vector values from scalar";
         // If value is array, set matching keys; else, try splitting.
//         if (typeof(value)=='string') {
//            value = value.split('\s*,\s*');
//         }
      }

   },

   // Get a list of inputs matching name
   getInputs: function(name) {
      var inp = document.getElementsByName(this.path + "." + name);
      if (!inp || inp.length === 0) {
         inp = null;
      }
      return inp;
   },

   // Get the first input matching name
   getInput: function(name) {
      var inp = this.getInputs(name);
      return ((inp && inp.length > 0) ? inp[0] : null);
   },
   
   focusInitialInput: function( name, overrideEnterWatch ){
      var inp = this.getInput( name );
      if(inp){
        Portal.initialElement.focusElement( inp, overrideEnterWatch );
      }
   },

   has: function(attrname) {
      var inp = document.getElementsByName(this.path + "." + attrname);
      return (inp && (inp.length > 0));
   },

   // Add event listeners to controls for named attribute
   // You can pass either the name of the attribute, or a list of DOM
   // nodes to hook up. This method fixes up "this" for the callback,
   // so that "this" is the Component that registered for the call.
   addEvent: function(inputName, eventName, f, flag) {
      var inputs;
      var oThis = this;

      if (typeof(inputName) == 'string') {
         inputs = this.getInputs(inputName);
      } else if (utils.isArray(inputName)) {
         inputs = inputName;
      } else { // Make an array of one node (assume it's a node)
         inputs = [ inputName ];
      }

      if (!inputs) {
         console && console.warn("Can't find: " + inputName);
         return;
      }

      var d = Dispatcher.getInstance();
      
      for (i = 0; i < inputs.length; i++) {
         d.addRule(oThis, eventName, inputs[i].name, f, null);
         d.listenForEvents(inputs[i], eventName);
      }

      return;
   },

   // Add event listeners to controls for named attribute
   removeEvent: function(inputName, eventName, f, flag) {
      var inputs = this.getInputs(inputName);
      for (var i = 0; inputs && (i < inputs.length); i++) {
         utils.removeEvent(inputs[i], eventName, f, flag);
      }
   },

   // Index of messages being listened for
   iListen: 0,

   // Return next listener name
   iNextListen: function() {
      return "L$" + this.iListen++;
   },

   // Listen for a message [on an optional source] and send
   // call back fFunction when the message occurs.
   _listen: function(sMessage, fFunction, sSource) {
      var oThis = this;
      var fName = this.iNextListen() + "$"+ sMessage;

      // Create a reference to the function that is owned by
      // this instance so that when the callback occurs, "this" is
      // correct.
      this[fName] = fFunction;
      var d = Dispatcher.getInstance();
      d.setListener(oThis, sMessage,
         function(dst, data, message, src) {
            oThis[fName](message, data, src);
         }, sSource);
   },

   // Broadcast a global message to listeners
   // In the component JS class:
   //    send: {
   //       "Cmd": null
   //    }
   // Causes message to be dispatched using default _send() below.
   // All objects listening for message sMessage will receive
   // the message with the given data.
   // oData is optional; if absent, sends null to all listeners
   // oDst is optional; if absent (as usual), broadcasts to all listeners
   //
   //
   _send: function(sMessage, oData, oDst) {
      var d = Dispatcher.getInstance();
      d.notify(this, sMessage, oData, oDst);
   },

   // Return metadata about this component
   getMetaData: function() {
      var result = {};

      result.listensFor = [];
      if (this.listen) {
         for (var msg in this.listen) {
            result.listensFor[result.listensFor.length] = msg;
         }
      }

      result.sends = [];
      if (this.send) {
         for (msg in this.send) {
            result.sends[result.sends.length] = msg;
         }
      }

      result.attributes = [];
      for (var attr in this.getAttributes()) {
         result.attributes[result.attributes.length] = attr;
      }
      return result;
   }

}, {

   // Tree of all instances
   $i: {},

   // Index of instances by short name
   $$i: {},

   // Create a <type> object called <name> at <path>
   // <path> is a dotted path of assoc refs starting at Portal.Component.$i
   create: function(type, path, cname, notifier) {

      var p = Portal.Component.$i;
      var pelem = path.split(".");
  
      // Traverse to penultimate path object
      for (var i = 0; i < pelem.length-1; i++) {
         p = p[pelem[i]];
      }

      var sname = path.substring(1+path.lastIndexOf("."));
  
      // Create a new object of the given type; if it fails, create a
      // new object of the named <type>.  The constructor for an
      // Portal object called <cname> of (<type> in [Portlet, Cluster,
      // Layout]) is by convention Portal.<type>.<cname>, and is an
      // extension of Portlet.<type>.  So Portlet Foo would be defined
      // as Portal.Portlet.Foo = Portal.Portlet.extend(...);
      //
      // <path> determines the short cname of the object created;
      // <cname> is what the instance claims its name is.  So if an
      // object's path is a.b.c, and the object says its name is
      // "qqq", then the object path is Portal.Component.$i.a.b.c, but
      // Portal.Component.$i.a.b.c.get("cname") will return "qqq".
      //
      if (typeof(Portal[type]) == 'undefined') {
         throw("No such portlet type: " + type);
      }
      if (typeof(Portal[type][sname]) == 'undefined') {
         p[sname] = new Portal[type](path, cname, notifier);
      } else {
         try {
            p[sname] = new Portal[type][sname](path, cname, notifier);
         } catch (e) {
            console && console.error("Creating Portlet."+type+"."+sname+": " + e.message);
            throw e;
         }
      }

      // Add component to instance index
      var l;
      if (!(l = Portal.Component.$$i[sname])) {
         l = Portal.Component.$$i[sname] = [];
      }
      l[l.length] = p[cname]; // Append cname to index

      // Implement "magic" methods

      // beforesubmit: if defined, it is called before a form submit.
      // If beforesubmit() returns anything but null, the returned
      // object is sent as a comment with message portal$vetosubmit to
      // the global notifier.
      //
      // The global dispatcher typically listens for this message, and
      // prevents form submission (Dispatcher.veto()) if it received
      if (p[cname].beforesubmit) {
         var d = Dispatcher.getInstance();
         var oThis = this;
         d.setListener(oThis, "portal$beforesubmit",
                       function(dst, data, message, src) {
                          var whydata = p[cname].beforesubmit();
                          if (typeof(whydata) == 'boolean') {
                             return whydata;
                          } else if (typeof(whydata) == 'object') {
                             d.notify(this, 'portal$vetosubmit', whydata, null);
                             return true;
                          }
                          throw cname+".beforesubmit: returned " + typeof(whydata);
                       }, null);
      }

      return p[cname];
   },

   // Get a specific instance of a portlet, given its full path
   // Throws an exception if something in the path does not exist.
   get: function(path) {
      return eval("Portal.Component.$i." + path);
   },

   // Get by short name; returns an array of instances of that component type
   getByShortName: function(name) {
      return eval("Portal.Component.$$i." + name);
   },

   // Does this portlet class exist?
   classExists: function(name) {
      return (typeof(Portal.Component[name]) != "undefined");
   },

   // Does a portlet exist at this path?
   instanceExists: function(path) {
      try {
         eval("Portal.Component.$i" + path);
         return true;
      } catch (e) { }
      return false;
   }

});

Portal.Layout = Portal.Component.extend({
  constructor: function(path, name, notifier) {
     this.base(path, name, notifier);
     //console && console.info("Created Layout: " + path);
   }
});

Portal.Cluster = Portal.Component.extend({
   constructor: function(path, name, notifier) {
      this.base(path, name, notifier);
      //console && console.info("Created Cluster: " + path);
   }
});

Portal.Portlet = Portal.Component.extend({

   getAttributes: function() {
      var t = document.getElementsByTagName("input");
      var result = {};
      var pathlen = this.path.length;

      for (var i = 0; i < t.length; i++) {
         var it = t[i];
         var itn = it.getAttribute("name");
         if (!itn) { continue; }
         var prefixlen = itn.lastIndexOf(".");
         var samePrefix = (itn.substring(0, this.path.length)==this.path);
         if ((prefixlen == pathlen) && samePrefix) {
            result[itn.substring(1+prefixlen)] = it.value;
         }
      }
      return result;
   }

});

// Convenience functions

// Portal Instance: return instance of portal at path
$PI = function(path) {
   return Portal.Component.get(path);
};

// Portal Name: Return portal with given short name.
// Return the instance if there is exactly one;
// otherwise return array.
$PN = function(name) {
   var c = Portal.Component.getByShortName(name);
   if (typeof(c) == "undefined") { return null; }
   return (c.length == 1) ? c[0] : c;
};

// Uncomment this line to test console
// console.info("Using console");

// htmlutils: Provide a uniform value/list accessor API for form elements

// TODO: Complete the following API and put it in utils.js
// Currently implemented only for select.get*

htmlutils = {

    accessors: {

        select: {

            getValue: function (node) {
                return this.getList(node).join(", ");
            },

            getList: function (node) {
                var opts = node.options;
                var r = [];
                for (var i = 0; i < opts.length; i++) {
                    if (opts[i].selected) {
                        r[r.length] = opts[i].value;
                    }
                }
                return r;
            }
        },

        button: {
            getValue: function (node) {
                var attrNode = node.getAttributeNode('value');
                return (attrNode !== null) ? attrNode.nodeValue : null;
            }
        },

        input_radio: {
            getValue: function (nodes) {
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].checked) return nodes[i].value;
                }
                return null;
            }
        }

    },

    getValue: function (elem) {
        var em = elem.length > 1 ? elem[0] : elem;
        var tagName = em.tagName.toLowerCase();
        if (tagName === "input") {
            tagName += "_" + em.type;
        }
        var v = this.accessors[tagName];
        return v && v.getValue ? v.getValue(elem) : elem.value;
    },

    getList: function (elem) {
        var v = this.accessors[elem.tagName.toLowerCase()];
        return v && v.getList ? v.getList(elem) : (elem.value ? [elem.value] : []);
    }
    
};

utils.addEvent(window, "load", function() {
   Portal.getInstance();
}, false);


(function(){

    Portal.initialElement = {
        count : 0,
        key13Pressed : false,
        hasListenTimePassed : false,
        listenTime : 175,
        _focusQueue : null,
        focus : function( elem, ignoreEnter ){
            if(document.all){
                elem.blur();
            }
            if(elem && (!Portal.initialElement.key13Pressed || ignoreEnter) ){
                if(Portal.initialElement.hasListenTimePassed || ignoreEnter){
                    if (elem.createTextRange) {
                        var text = elem.createTextRange();
                        text.moveStart('character', elem.value.length);
                        text.collapse();
                        text.select();
                    }
                    else if( elem.setSelectionRange ){                    
                        elem.focus();
                        var len = elem.value.length;
                        elem.setSelectionRange(len, len);
                    }
                    else{
                        elem.focus();
                        elem.value = elem.value;
                    }
                }
                else{
                    Portal.initialElement._focusQueue = elem;
                }            
            }            
        },
        timerEnd : function(){
            Portal.initialElement.hasListenTimePassed = true;
            var elem =  Portal.initialElement._focusQueue;
            if(elem!==null) Portal.initialElement.focus( elem );
            elem = null;
        }        
    }
    
    function watchKeyPress( evt ){
        evt = evt || window.event;
        var keyCode = evt.keyCode || evt.which;
        if(keyCode==13){
            Portal.initialElement.key13Pressed = true;
            Portal.initialElement.count++;
        }
    }
   
    if (document.addEventListener){  
        document.addEventListener('keypress', watchKeyPress, false);   
        document.addEventListener('keydown', watchKeyPress, false);   
    } else if (document.attachEvent){  
        document.attachEvent('onkeypress', watchKeyPress);  
        document.attachEvent('onkeydown', watchKeyPress);  
    }
    
    window.setTimeout(Portal.initialElement.timerEnd, Portal.initialElement.listenTime);    
    
})();



