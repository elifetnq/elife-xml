// Requires: console, utils, notify, Base-p

Dispatcher = Base.extend({
   constructor: function(oRules, oHierarchy) {
      this.init();
   },

   init: function() {
      this.oNotifier = new Notifier();
      this.submitOK = true;
      this.submitter = false;
      this.submitRequested = false;
      this.submitChecking = false;
      this._rules = {};
   },

   // Initialize client-side data exchange based on rules
   initDataExchange: function(oRules) {

      var oThis = this;
      var activenames = ActiveNames;
      var i, j;
      var rulehash = {};

      // This hash contains all active names on the page
      activenames = ActiveNames;

      // By default, form is submittable.
      // Any object can listen for "portal$beforesubmit" and veto the submission
      // by sending "portal$vetosubmit"; that action sets
      // submitOK to false (see veto() below). submitRequested is used by
      // message dispatcher to defer submits until all message passing completes
      this.submitOK = true;
      this.submitRequested = false;
      this.submitter = null;

      // Set up data exchange rules...
      this.oRules = oRules;

      // Hash rule event sources for fast lookup
      for (i = 0; i < oRules.length; i++) {
         var name = oRules[i].ename;
         rulehash[name] = (rulehash[name]||[]);
         rulehash[name][rulehash[name].length] = oRules[i];
      }

      // ...for each link on the page...
      var links = document.links;
      for (i = 0; i < links.length; i++) {
         initializeControl(links[i]);
      }

      // ... and for each name in ActiveNames
      for (name in ActiveNames) {
         var ctrl;
         var elems = document.getElementsByName(name);
         for (i = 0; i < elems.length; i++) {
            initializeControl(elems[i]);
         }
      }

      // Set up listeners for data exchange functions
      for (var fname in this.dataExchangeFunctions) {
         this.setListener(this, fname, this.dataExchangeFunctions[fname], null);
      }

      // Inner functions
      function initializeControl(domCtrl) {
         var thisName = domCtrl.name;
         var j, oRule;

         if ( ! ( thisName && typeof activenames[thisName] !== 'undefined') ) {
            return;
         }

         // Start group if it has a name; else just print name
         //console && console.group && console.group(thisName + "[" + domCtrl.getAttribute("sid") +"]");

         try {
            // Get action event for this control
            var sActionEvent = oThis.actionEventName(domCtrl);
   
            // Set up action handler and define rules for the control
            if (sActionEvent > "") {
   
               // If this node has rules, define them. Is this
               // really redundant?
               if (rulehash[thisName]) {
                  oThis.addRule(oThis, sActionEvent, thisName,
                               oThis.doDataExchange, rulehash[thisName]);
                  //console && console.info("Rule: " + thisName +"." + sActionEvent +": " + rulehash[thisName].m);
               }
   
               // If items with this name submit, configure rule to request
               // submit when activated
               if (activenames[thisName]) {
                  oThis.addRule(oThis, sActionEvent, thisName,
                                oThis.doSubmitAttribute, null);
                  //console && console.info("Rule: " + thisName +"." + sActionEvent +": doSubmit");
               }
   
               // Listen for events. This listener handles
               // both rule execution and submit.
               oThis.listenForEvents(domCtrl, sActionEvent);
            }
         } finally {
            //console && console.groupEnd && console.groupEnd();
         }
      };

   },

   // Define rule: When <sEvent> occurs on <sName>, call <oThis>.<fFunc(<oArg>)> 
   // You can only register each function once for a name$event pair.
   addRule: function(oThis, sEvent, sName, fFunc, oArg) {
      var rules = this._rules;
      var ename = sName + "$" + sEvent;
      var i;

      // If name/event->func already exists, return
      if (typeof(rules[ename]) != 'undefined') {
         for (i = 0; i < rules[ename].length; i++) {
            if (rules[ename][i].func == fFunc) {
               return;
            }
         }
      } else {
         rules[ename] = [];
      }

      // Push rule
      rules[ename][rules[ename].length]= {
         'thisptr': oThis, 'func': fFunc, 'arg': oArg
      };
   },


   // Return list of rules for a name$event pair
   getRulesFor: function(sName, sEvent) {
      return this._rules[sName + "$" + sEvent];
   },

   // Register callback to handleAction exactly once for each node/event pair
   listenForEvents: function(domCtrl, sEventName) {
      domCtrl._i_ = (domCtrl._i_||[]);
      if (!domCtrl._i_[sEventName]) { // init flag
         domCtrl._i_[sEventName] = 1;
         utils.addEvent(domCtrl, sEventName, this.handleAction);
      }
   },

   // Execute all data exchange rules for target.
   doDataExchange: function(eEvent, domTarget, oArg) {
      var d = Dispatcher.getInstance();
      var rules = oArg;

      if (!rules) { return; }

      for (var k = 0; k < rules.length; k++) {
         d.notify(domTarget, rules[k].m, rules[k]);
      }
   },

   // Nodes with "submit attribute" execute this rule:
   // * Cancel default action
   // * Request submit
   // * set p$a to indicate which element caused submit
   // * set p$ExL for external links
   doSubmitAttribute: function(eEvent, domTarget, oArg) {
      
      // If we're going to submit, then we don't want the default
      // action. Right?
      eEvent.preventDefault();
      eEvent.stopPropagation();

      console && console.info("Submitting request because submit attribute set");
      
      // FIXME: These portal variables should have ids as well
      // as names, to make them easier/faster to get--they're
      // platform variables, not component variables, so id is OK
      var realname = domTarget.getAttributeNode("realname");
      realname = realname ? realname.value : null;
      if (domTarget.name || realname) {
          this.setSubmitSource(realname || domTarget.name);      
      }                                          

      // If the element clicked is an external link (name='p$ExL'),
      // set p$el to the value of href, so the server knows where
      // to forward the link. (Hack alert)
      if (domTarget.name == "p$ExL") {
         el = document.getElementsByName('p$el');
         if ( (typeof(el) != 'undefined') && (el.length > 0) ) {
            el[0].value = domTarget.getAttribute("href");
         }
      }
      
      // Request the submit
      Dispatcher.getInstance().requestSubmit();
   },

   // "Rules" are either data exchange rules or custom JavaScript
   // event handlers defined in listen: blocks on inputs.
   // All data exchange rules are executed first, then
   // custom JS event listeners.
   // NOTE: when handleAction is called, "this" is the dom element,
   // not the dispatcher!

   //
   // handleAction performs a submit if:
   //   [1] The DOM target node has "submit" attribute (with any value)
   //   [2] A custom function calls Portal.requestSubmit (or,
   //       identically, document.forms[0].submit())

   // "submit" also implies setting hidden variable p$a, which
   // is the name of the node that requested in the submit.

   handleAction: function(e) {

      // Initialize rule notification
      var d = Dispatcher.getInstance();
      var t = this; // Callback to object that registered for event
      var i;

      // For links, cancel default action. (Are there others?)
      if (t.tagName && t.tagName.toLowerCase() == 'a') {
         e.preventDefault();
         e.stopPropagation();
      }

      // Set p$a to tell server which component caused submit, if applicable
      var realname = this.getAttributeNode("realname");
      realname = realname ? realname.value : null;
      if (this.name || realname) {
         d.setSubmitSource(realname || this.name);
      }

      // Set up to perform submit, if any callers request it
      d.submitCheckBegin();

      // Execute rules (which may request submit)
      try {
         console && console.info("Executing rule " + t.name +"."+e.type);
         // Execute all rules for this node, based on its name
         // This executes both data exchange rules and custom rules
         // from portal JS code.
         var rules = d.getRulesFor(t.name, e.type);
         for (i = 0; rules && (i < rules.length); i++) {
            var rule = rules[i];
            
            // Catch and report failures from custom JS
            // If one fails, recover and do others.
            try {
               rule.func.call(rule.thisptr, e, t, rule.arg);
            } catch (err) {
               console && console.error("Dispatcher.handleAction: rule failed: "+ t.name + "$" + e.type + ": " + err);
            }
         }

      } catch (err) {
         console && console.error("Error: handleAction: " + err);
      } finally {
         d.submitCheckEnd();
      }
   },
   
   // Return the platform event name corresponding to an action
   // (implying data exchange)
   actionEventName: function(t) {
      var ttype = (t.getAttribute("type") || '').toLowerCase();
      switch (t.tagName.toLowerCase()) {
        case 'select':
        case 'textarea':
           return 'change';
        case 'form':	// Return nothing for form (so it is ignored)
           return '';
        case 'input':
           if (ttype == 'text') {
              return 'change';
           } else if(ttype == 'hidden'){
              return '';
           }
      }
      return 'click';
   },

   // Create client-side portlet components
   initHierarchy: function (oTree) {

      // Don't initialize empty hierarchy
      if (!oTree || !oTree.name) {
         return;
      }
      
      var sname = oTree.shortname ||
         oTree.name.substring(1+oTree.name.lastIndexOf("."));
      
      // Create object. Print error message but continue if object creation fails.
      // (Portlet instances execute custom code (init() method) on construction--
      //  programmer errors and exceptions shouldn't kill page initialization)
      try {
         // Create component
         var c = Portal.Component.create(oTree.type, oTree.name, sname, this.oNotifier);

         // Add "realname" attribute to component (to support XHR callbacks); do this
         // here to avoid changing component init interface
         c.realname = oTree.realname;
      } catch (e) {
         console && console.group && console.group("Exception creating portlet " + oTree.name);

         console && console.info("Message: " + e.toString());

         if (typeof(e) != 'string') {
            console && console.group && console.group("Details");
            console && console.dir && console.dir(e);
            console && console.groupEnd && console.groupEnd();
         }

         console && console.group && console.group("Trace")
         console && console.trace && console.trace();
         console && console.groupEnd && console.groupEnd();

         console && console.groupEnd && console.groupEnd();
      }
      
      if (oTree.children) {
         for (var i = 0; i < oTree.children.length; i++) {
            this.initHierarchy(oTree.children[i]);
         }
      }
   },

   // Submit form unless a submit interceptor vetoes
   submit: function() {
      if (this.submitCheck()) {
	 // Native implementation that actually *does* submit
         // _submit was initialized by the page load event, which hijacks
         // document.forms[0].submit().
         
         if(xmlHttpCall && xmlHttpCall.abortCalls){
             xmlHttpCall.abortCalls();
         }
         
         document.forms[0]._submit();
      }
   },

   // Tell all listeners that submit is going to occur.
   // Return false if any of them veto; otherwise, return true.
   submitCheck: function() {
      var oThis = this;
      var thisForm = document.forms[0];
   
      this.submitOK = true;
      this.vetoWhy = null;
   
      // Notify all listeners that submit is about to occur
      this.notify(this, "portal$beforesubmit", { form: thisForm }, null);
   
      return this.submitOK;
   },
   
   // Veto form submit
   veto: function(whydata) {
      this.submitOK = false;
      this.vetoWhy = whydata;
   },

   // Return whether the current form submission is vetoed
   isVetoed: function() {
      return !this.submitOK;
   },

   // Set p$a, which tells the server what page element activated the submit
   setSubmitSource: function(sourceName) {
      // Tell the portal server which element caused the submit
      var el = document.getElementsByName('p$a');
      if ( (typeof(el) != 'undefined') && (el.length > 0) ) {
         if (typeof(sourceName) == 'undefined') {
            console && console.warn("Warning: Can't identify submitter: using p$a=''");
         } else {
            el[0].value = sourceName;
         }
      }
   },

   // Work out which nodes are src and dst for a user event,
   // based on data exchange rules. Used internally.
   getSrcDst: function(oRule, oNotifierObj) {
      
      // Inner function
      function x_FindObj(name, sid) {
         var oResult = [];
         var oControls = $N(name);
         for (var i = 0; i < oControls.length; i++) {
            if ("*" == sid || oControls[i].getAttribute("sid") == sid) {
               oResult[oResult.length] =  oControls[i];
            }
         }
         return oResult; 
      }

      // getSrcDst
      var oThis = this;
      
      var name = oRule.sname;
      var sid  = oRule.ssid;
      
      if ("#" == name) {
         name = oRule.ename;
      }
      if ("#" == sid) {
         sid = oRule.esid;
         sid = oNotifierObj.getAttribute("sid");
      }
      
      var oSrc = x_FindObj(name, sid);
      
      name = oRule.dname;
      sid  = oRule.dsid;
      if ("#" == name) {
         name = oRule.ename;
      }
      if ("#" == sid) {
         sid = oRule.esid;
         sid = oNotifierObj.getAttribute("sid");
      }
      
      var oDst = x_FindObj(name, sid);
      
      return {src:oSrc, dst:oDst};
   },

   // Receive messages from the dispatcher's notifier
   setListener: function(oListener, sMessage, fFunction, oNotifier) {
      return this.oNotifier.setListener(oListener, sMessage, fFunction, oNotifier);
   },

   // Send a message to the dispatcher's notifier
   notify: function(oNotifier, sMessage, oComment, oListener) {
      return this.oNotifier.Notify(oNotifier, sMessage, oComment, oListener);
   },

   // This is a dictionary of data exchange functions
   dataExchangeFunctions: {

      CopyValue: function(oListener, oRule, sMessage, oNotifierObj) {
         var dispatcher = oListener;
         var oSrcDst = dispatcher.getSrcDst(oRule, oNotifierObj);
         
         // For each destination...
         for (var j = 0; j < oSrcDst.dst.length; j++) {
            // Send a message from each source...
            for (var i = 0; i < oSrcDst.src.length; i++) {
               oSrcDst.dst[j].value = oSrcDst.src[i].value;
            }
         }
      },

      AddValue: function(oListener, oRule, sMessage, oNotifierObj) {
         var dispatcher = oListener;
         var oSrcDst = dispatcher.getSrcDst(oRule, oNotifierObj);

         // For each destination...
         for (var j = 0; j < oSrcDst.dst.length; j++) {
            // Send a message from each source...
            for (var i = 0; i < oSrcDst.src.length; i++) {
               oSrcDst.dst[j].value += (oSrcDst.dst[j].value > "" ? ", " : "") + oSrcDst.src[i].value;
            }
         }
      },


      SetValue: function(oListener, oRule, sMessage, oNotifierObj) {
         var dispatcher = oListener;
         var oSrcDst = dispatcher.getSrcDst(oRule, oNotifierObj);
         
         // For each destination...
         for (var j = 0; j < oSrcDst.dst.length; j++) {
            var dst = oSrcDst.dst[j];
            
            if (Dispatcher.isCheckable(dst)) {
               dst.checked = oRule.p[0];
            } else {
               dst.value = oRule.p[0];
            }
         }
      },
      
      // This method is mostly for converting a (src) stack
      // of checkboxes (with the same name, and different
      // sids) to a (dst) comma-separated list of the values
      // of the stacked checkboxes.  Should work for both
      // checkboxes and radio buttons; for radio buttons,
      // there''s only ever one selected item in the result
      // list (of course)
      //
      // [ ] Abc
      // [x] Def    -->    [Def, Ghi, Jkl           ]
      // [x] Ghi
      //
      // Any values that exist in the dst but not in the
      // checkboxes are retained in the dst in their
      // original order.  Values added to the dst are always
      // added onto the end.
      //

      ItemToList: function(oListener, oRule, sMessage, oNotifierObj) {
         var dispatcher = oListener;
         var oSrcDst = dispatcher.getSrcDst(oRule, oNotifierObj);
         
         for (var j = 0; j < oSrcDst.dst.length; j++) {
            var dst = oSrcDst.dst[j];
            
            // Current list of items; don't allow blank items or leading/trailing whitespace
            var dstval = dst.value.replace(/^\s+/,"").replace(/\s+$/,"");

            var dstItems = dstval.split(/\s*,\s*/).filter(function(s){return s!=="";});
            
            // Add/remove each source item''s value from list, avoiding repeats
            for (var i = 0; i < oSrcDst.src.length; i++) {
               var src = oSrcDst.src[i];
               var sc = Dispatcher.isCheckable(src);
               var checked = (sc ? src.checked : (src.value !== "")); // Is src "checked"?
               var position = dstItems.indexOf(src.value); // Where in dst is src.value?
               
               if (checked && position < 0) {          // If src checked and value not in list
                  dstItems[dstItems.length] = src.value;    // add it
               }
               if (!checked && position >= 0) {        // If src notchecked and value in list
                  dstItems.splice(position, 1);        // remove it
               }
            }
            dst.value = dstItems.join(", ");
         }
      },
      
      PropertyToValue: function(oListener, oRule, sMessage, oNotifierObj) {
         var dispatcher = oListener;
         var oSrcDst = dispatcher.getSrcDst(oRule, oNotifierObj);
         
         // For each destination...
         for (var j = 0; j < oSrcDst.dst.length; j++) {
            // Send a message from each source...
            for (var i = 0; i < oSrcDst.src.length; i++) {
               oSrcDst.dst[j].value = oSrcDst.src[i].getAttribute(oRule.p[0]);
            }
         }
      },
      
      // Identical to ItemToList, but instead of copying
      // value, it copies an attribute value corresponding
      // to the source node.
      PropertyToList: function(oListener, oRule, sMessage, oNotifierObj) {
         var dispatcher = oListener;
         var oSrcDst = dispatcher.getSrcDst(oRule, oNotifierObj);
         
         for (var j = 0; j < oSrcDst.dst.length; j++) {
            var dst = oSrcDst.dst[j];
            var o = {};
            var values = [];
            var propname = oRule.p[0];
            
            for (var i = 0; i < oSrcDst.src.length; i++) {
               var src = oSrcDst.src[i];
               var prop = src.getAttribute(propname);
               if (!prop) { continue; }
               var sc = Dispatcher.isCheckable(src);
               if (sc ? src.checked : (prop && prop !== "")) {
                  if (!o[prop]) {
                     values[values.length] = prop;
                  }
                  o[prop]=1;
               }
            }
            dst.value = values.join(", ");
         }
      }
   },

   // Send a submission request to the message bus
   requestSubmit: function(src) {
      console && console.info("Request submitted");
      this.submitter = src;
      this.submitRequested = true;
   },

   submitCheckBegin: function() {
      // FIXME: This should be an assert...
      if (this.submitChecking) {
         throw "ERRINTERNAL: recursive submit check";
      }
      this.submitChecking = true;
      this.submitter = null;
      this.submitRequested = false;
   },

   // perform submit if requested (and close guard)
   submitCheckEnd: function() {
      if (this.submitRequested) {
         this.submit();
      }
      this.submitChecking = false;
      this.submitter = null;
      this.submitRequested = false;
   }

},{

   //
   // Class methods
   //

   // Singleton instance
   _instance: null,

   getInstance: function() {
      return Dispatcher._instance || (Dispatcher._instance = new Dispatcher());
   },
   
   // TODO: ObjectLinks and objHierarchy are global variables--should clean up.
   // Load and initialize the client-side message dispatcher
   onload: function() {

      var sc = "Create components";
      var si = "Initialize components";

      var d = Dispatcher.getInstance();

      // Initialize client-side components
      //console && console.group && console.group(sc);
      //console && console.time && console.time(sc);
      d.initHierarchy(objHierarchy);
      //console && console.timeEnd && console.timeEnd(sc);
      //console && console.groupEnd && console.groupEnd();

      // Initialize client-side data exchange
      //console && console.group && console.group(si);
      //console && console.time && console.time(si);

      d.initDataExchange(ObjectLinks);

      // Any time someone posts a veto event on this form, veto form submission
      d.setListener(d, 'portal$vetosubmit',
                    function(dst, data, message, src) {
                       d.veto(data);
                    }, null);

      // Redefine document.forms[0].submit to call
      // Dispatcher.requestSubmit() instead
      var theForm = document.forms[0];
      if (theForm && !theForm._submit) {
         theForm._submit = theForm.submit;
         theForm.submit = function() {
            Dispatcher.getInstance().requestSubmit();
         };
      }

      //console && console.timeEnd && console.timeEnd(si);
      //console && console.groupEnd && console.groupEnd();
   },

   // These are class methods that probably belong in an HTML utilities class.
   isCheckbox: function(node) {
      var t = node.getAttribute("type");
      return t && (t.toLowerCase() == "checkbox");
   },
   
   isRadio: function(node) {
      var t = node.getAttribute("type");
      return t && (t.toLowerCase() == "radio");
   },
   
   isCheckable: function(node) {
      return this.isRadio(node) || this.isCheckbox(node);
   }
   
});

utils.addEvent(window, "load", Dispatcher.onload, false);
                  
