
// $Id: utils.js 157869 2009-04-20 18:12:26Z miller $
/*
Portal version of light weight utilities

File: utils (utils.js)
Class: utils
*/

var utils = {
/*
******************************************************************
Group: Constants
*/
    
/*    
Constant: KeyCode_TAB
Maps to 9

*/
KeyCode_TAB: 9,
/* 
Constant: KeyCode_DELETE
Maps to 46
*/
KeyCode_DELETE: 46,
/* 
Constant: KeyCode_BACKSPACE
Maps to 8
*/
KeyCode_BACKSPACE: 8,
/* 
Constant: KeyCode_LEFT_ARROW
Maps to 37
*/
KeyCode_LEFT_ARROW: 37,
/* 
Constant: KeyCode_RIGHT_ARROW
Maps to 39
*/
KeyCode_RIGHT_ARROW: 39,
/* 
Constant: KeyCode_HOME
Maps to 36
*/
KeyCode_HOME: 36,
/* 
Constant: KeyCode_END
Maps to 35
*/
KeyCode_END: 35,
/* 
Constant: KeyCode_PAGE_UP
Maps to 33
*/
KeyCode_PAGE_UP: 33,
/* 
Constant: KeyCode_PAGE_DOWN
Maps to 34
*/
KeyCode_PAGE_DOWN: 34,
/* 
Constant: KeyCode_UP_ARROW
Maps to 38
*/
KeyCode_UP_ARROW: 38,
/* 
Constant: KeyCode_DOWN_ARROW
Maps to 40
*/
KeyCode_DOWN_ARROW: 40,
/* 
Constant: KeyCode_ESC
Maps to 27
*/
KeyCode_ESC: 27,
/* 
Constant: KeyCode_ENTER
Maps to 13
*/
KeyCode_ENTER: 13,
/* 
Constant: KeyCode_SPACE
Maps to 32
*/
KeyCode_SPACE: 32,
/* 
Constant: KeyCode_SHIFT_KEY
Maps to 16
*/
KeyCode_SHIFT_KEY: 16,
/* 
Constant: KeyCode_CTRL_KEY
Maps to 17
*/
KeyCode_CTRL_KEY: 17,
/* 
Constant: KeyCode_ALT_KEY
Maps to 18
*/
KeyCode_ALT_KEY: 18,
/* 
Constant: KeyCode_LEFT_MS_WINDOWS_KEY
Maps to 91
*/
KeyCode_LEFT_MS_WINDOWS_KEY: 91, 
/* 
Constant: KeyCode_RIGHT_MS_WINDOWS_KEY
Maps to 92
*/
KeyCode_RIGHT_MS_WINDOWS_KEY: 92,
/* 
Constant: KeyCode_MS_MENU_KEY
Maps to 93
*/
KeyCode_MS_MENU_KEY: 93,
    
    
/*
******************************************************************
Group: Browser Checking
*/
    
/*    
Constant: bIsIe
true if brouse is Internet Explorer
*/
bIsIe:false/*@cc_on || true @*/,

/*
******************************************************************
Group: Object Type Checking
*/
    
/*    
Method: isArray()
Returns boolean whether argument is an array or not.

Arguments: 
oObj - Argument to be tested whether array or not.

Syntax:
>utils.isArray(elems) //returns true, if elems is an array.

*/
isArray: function(oObj) {
    return this.isObject(oObj) && oObj.constructor == Array;
},
/*
Method: isObject()
Returns whether item is object or not.

Arguments:
oObj - Item to be tested.

Returns:
Boolean

*/
isObject: function(oObj) {
    return (oObj && typeof oObj == 'object');
},
    


/*
******************************************************************
Group: Class Manipulation
*/

/*
Method: hasClass()
Returns true if an element has passed class, false if not.

Arguments:
oEl - (Element) The element to test.
className - (String) The className to test for.

Example:
(start code)
//returns true if oEl has a class attribute set to "foo"
utils.hasClass(oEl, 'foo');
(end code)
*/
hasClass: function(oEl, className) {
    var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
    return regexp.test(oEl.className);
},

/*
Method: addClass()
Adds a class to an HTML element.

Does not replace the class, like setting element.className would do. Instead this adds *or appends* a class.

Arguments:
oEl - (Element) The element to which you add a class attribute.
className - (String) The class you add.

Example:
(start code)
var oEl = $('someId');
// adds 'foo' class to oEl
utils.addClass(oEl, 'foo');
(end)
*/
addClass: function(oEl, className) {
    if (!this.hasClass(oEl, className)) {
        if (oEl.className) oEl.className += " " + className;
        else oEl.className = className;
    }
},

/*
Method: removeClass()
Removes a class from an HTML element.

Arguments:
oEl - (Element) The element to which you remove a class attribute.
className - (String) The class you remove.

Example:
(start code)
var oEl = $('someId');
// removes 'foo' class from oEl
utils.removeClass(oEl, 'foo');
(end)
*/
removeClass: function(oEl, className) {
    var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
    var b = regexp.test(oEl.className);
    oEl.className = oEl.className.replace(regexp, "$2");
    return b;   // true if class has been removed
},

/*
Method: toggleClass()
Add a class to an HTML element if element does not have the class 
and remove the class if the element does have it.

Arguments:
oEl - (Element) The element to which you toggle a class attribute.
className - (String) The class you remove.

Example:
(start code)
var oEl = $('someId');
// toggle 'foo' class from oEl
utils.toggleClass(oEl, 'foo');
(end)
*/
toggleClass: function (oEl, className) {
	if (this.hasClass(oEl, className)) this.removeClass(oEl, className);
	else this.addClass(oEl, className);
},



/*
******************************************************************
Group: Cookies Processing
*/

/*
Method: createCookie()
Creates a cookie using day expiration instead of millaseconds. 

This is a convenience method that allows you to bypass the standard
'document.cookie = name=value;' syntax.

Arguments:
name - (String) The name of the cookie you want to create.

value - (String) The value of the cookie you want to create.

days - (String) The number of days you want to set cookie to expire.

path (Optional) - (String) The path in the domain you want your cookie to be accessible from.
  
*/
createCookie: function(name, value, days, path) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = '; expires=' + date.toGMTString();
    } else expires = '';
    
    document.cookie = name + '=' + value + expires + '; path=' + (path ? path : "/");
},

/*
Method: readCookie()
Reads the value of a named cookie.
   
Arguments:
name - (String) The name of the cookie you want to read.
*/
readCookie: function(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return "";
},

/*
Method: eraseCookie()
Erases an existing cookie.

Arguments:
sName - (String) The name of the cookie to erase.
bOnlyInMyDomain - (Boolean) Delete cookie only in the current domain, otherwise delete in 3  NIH domains
*/
eraseCookie: function(sName, bOnlyInMyDomain) {
     if (bOnlyInMyDomain) {
         this.createCookie(sName, "", -1);
     } else {
         var x = sName + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=";
         document.cookie = x + "ncbi.nlm.nih.gov";
         document.cookie = x + "nlm.nih.gov";
         document.cookie = x + "nih.gov";
     }
},


/*
******************************************************************
Group: Events
*/

// begin http://dean.edwards.name/weblog/2005/10/add-event/ 
// a counter used to create unique IDs
addEvent_guid: 1,

/*
Method: addEvent()
Adds a handler function to an object.  

From http://dean.edwards.name/weblog/2005/10/add-event/.
 
Use this instead of either W3C standard addEventListener(), 
or IE's attachEvent() if you want use more than one event handler.

Arguments:
oEl - (Object) The element (or object) you want to attach a handler to.
sType - (String) The type of event, minus the 'on' prefix.
fHandler - (Function) The handler to attach.

Examples:
(start code)
//Run a function after the window (DOM) loads
utils.addEvent(window, 'load', someFunction);

// attach a function to hover event of link
var link = $('someLink');
utils.addEvent(link, 'hover', someFunction);

// attach a function to click event of button, passing a parameter to handler function
utils.addEvent($('btn'), 'click', function(){
    someFunction(someParameter);
});
(end)
*/
addEvent: function (oEl, sType, fHandler) {
                   
//     if (sType == "click" && oEl.nodeName == "BUTTON") {
//         alert(["addEvent", oEl.id, sType]);
//     }
	// assign each event handler a unique ID
                   
	if (!fHandler.$$guid) fHandler.$$guid = this.addEvent_guid++;
//    console.log(fHandler.$$guid)
	// create a hash table of event types for the element
	if (!oEl.events) oEl.events = {};
	// create a hash table of event handlers for each element/event pair
	var handlers = oEl.events[sType];
	if (!handlers) {
		handlers = oEl.events[sType] = {};
		// store the existing event handler (if there is one)
		if (oEl["on" + sType]) {
			handlers[0] = oEl["on" + sType];
		}
	}
	// store the event handler in the hash table
	handlers[fHandler.$$guid] = fHandler;
	// assign a global event handler to do all the work
	oEl["on" + sType] = handleEvent;
    
    function handleEvent(e) {
    	var returnValue = true;
    	// grab the event object (IE uses a global event object)
    	e = e || fixEvent(window.event);
    	// get a reference to the hash table of event handlers
    	var handlers = this.events[e.type];
    	// execute each event handler
    	for (var i in handlers) {
    		this.$$handleEvent = handlers[i];
    		if (this.$$handleEvent(e) === false) {
    			returnValue = false;
    		}
    	}
    	return returnValue;
    };
    
    function fixEvent(e) {
    	// add W3C standard event methods
    	e.preventDefault = fixEvent.preventDefault;
    	e.stopPropagation = fixEvent.stopPropagation;
    	return e;
    };
    fixEvent.preventDefault = function() {
    	this.returnValue = false;
    };
    fixEvent.stopPropagation = function() {
    	this.cancelBubble = true;
    };

    try{}finally{element = null;}   // prevent memory leak for IE6
        
    return fHandler.$$guid;
},
// end http://dean.edwards.name/weblog/2005/10/add-event/ 

/*
Method: removeEvent()
Removes event handler from object. 

Arguments:
oEl - (Object) The object to remove the event from.
type - (String) The event type minus the 'on' prefix.
fHandler - (Function) The function to remove.

Example:
(start code)
// remove event handler from some element
utils.removeEvent(someElement, 'click', someFunction);
(end)
*/

removeEvent: function (oEl, sType, fHandler) {
	// delete the event handler from the hash table
	if (oEl.events && oEl.events[sType]) {
		delete oEl.events[sType][fHandler.$$guid];
        return fHandler.$$guid;
	}
    return null;
},

/*
Method: preventDefault()
Prevents default action from occuring on an element.

Arguments:
e - (Object) The event object.

Example:
Prevent a link from being followed.
(start code)
utils.addEvent(link, click, function(e){
   alert('This link was clicked, but not followed');
   utils.preventDefault(e);
});
(end)
*/
preventDefault: function(e) {
     if (e.preventDefault) e.preventDefault();
     else window.event.returnValue = false;
},

/*
Method: getRelatedTarget()
Gets element mouse came from for mouseover or element mouse went to for mouseout.

Arguments:
e - (Object)- Implied argument passed from event.
*/
getRelatedTarget: function(e) {
    if (!e) var e = window.event;
	if (e.relatedTarget)    return e.relatedTarget;
	else if (e.toElement)   return e.toElement;
//    else if (e.fromElement) return e.fromElement;
},

/*
Method: getTargetObj()
Returns the object that received an event.

Arguments:
e - (Object) The event.

Returns:
Object
*/ 
getTargetObj: function(e) {
    var oTarget;
    e = e || window.event;
    if (e == null) return null;
    if (e.srcElement == null) oTarget = e.target;
    else oTarget = e.srcElement;
    while (oTarget && oTarget.nodeType != 1) oTarget = oTarget.parentNode;
    return oTarget;
},


/*
******************************************************************
Group: Geometry
*/

/*
Method: getPageDim()
Returns an object representing height and width of total page, not just viewable page. 
This is usually the entire body element.

Arguments:
oEl - (DOM element) The element whose width and height you want to get, 'document.body' if omitted.

From: http://www.quirksmode.org/viewport/compatibility.html

Example:
(start code)
//get height of entire page
var h = utils.getPageDim().h;
(end)
*/
getPageDim: function(oEl) {
    // 
    var dim = {w:0, h:0};
    var test1, test2;
    var x;
    if (undefined == oEl) {
        x = document.body;
    } else {
        x = oEl;
    }
    var test1 = parseInt(x.scrollHeight);
    var test2 = parseInt(x.offsetHeight);
    if (test1 > test2) { // all but Explorer Mac
    	dim.w = parseInt(x.scrollWidth);
    	dim.h = test1;
    } else {// Explorer Mac;
         //would also work in Explorer 6 Strict, Mozilla and Safari
    	dim.w = parseInt(x.offsetWidth);
    	dim.h = test2;
    }
    return dim;
},

/*
Method: getWindowDim() 
Returns an object representing inside dimensions of window.

Getting window dimensions is very browser depenendent. This method should work across different browsers.

Arguments:
None

From: http://www.quirksmode.org/viewport/compatibility.html

Example:
(start code)
//get the height of the window
var h = utils.getWindowDim().h;
(end)
*/
getWindowDim: function() {
    var dim = {w:0, h:0};
    if (self.innerHeight) { // all except Explorer
    	dim.w = self.innerWidth;
    	dim.h = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) {
    	// Explorer 6 Strict Mode
    	dim.w = document.documentElement.clientWidth;
    	dim.h = document.documentElement.clientHeight;
    } else if (document.body) {// other Explorers
    	dim.w = document.body.clientWidth;
    	dim.h = document.body.clientHeight;
    }
    dim.w = parseInt(dim.w);
    dim.h = parseInt(dim.h);
    return dim;
},

/*
Method: getXY()
Returns an object representing the x, y coordinates and height and width of passed element.

Arguments: 
oEl - (Element) The object whose coordinates you want to get.

Example:
(start code)
var elem = $('someId');
var pos = utils.getXY(elem);
window.scrollTo(pos.x, pos.y);
(end code)
*/
getXY: function (oEl, oParent){
 /*
 (x,y)
   +------------- w ----+
   |                    |
   |                    |
   h                    |
   |                    |
   |                    |
   +--------------------+
 */
     
     var dim = {x:0, y:0, w:oEl.offsetWidth, h:oEl.offsetHeight};
     
     if (oEl.offsetParent) {
         while(oEl && oEl != oParent) {
             dim.x += oEl.offsetLeft;
             dim.y += oEl.offsetTop;
             oEl = oEl.offsetParent;
         }
     } else if (oEl.x) {
         dim.x = oEl.x;
         dim.y = oEl.y;
     }
     return dim;
},


/*
Method: getBorders()
Returns object representing thickness of passed element's borders.

The returned object also has an isInner property which represents whether the currentStyle property exists.
If the currentStyle  property exists, we know we are using the IE client.
This is useful because in quirks mode, IE includes margins, padding, and borders in its calculation
of the total width of an element. Thus in IE, elements with a declared width will often be
rendered more narrow than in other browsers.

Arguments: 
oEl - (Element) The element whose borders to get.

Example:
(start code)
var el = $('someElement');
var leftBorder = utils.getBorders(el).l;
(end)
*/
getBorders: function(oEl) {
     var res = {t:0, b:0, l:0, r:0, isInner:false};
     res.t = this.getStyle(oEl, "borderTopWidth");
     if (typeof(res.t) == "string" && res.t != "") {        //IE, Firefox
         res.b = this.getStyle(oEl, "borderBottomWidth");
         res.l = this.getStyle(oEl, "borderLeftWidth");
         res.r = this.getStyle(oEl, "borderRightWidth");
     } else {
         res.t = this.getStyle(oEl, "border-top-width");   //Firefox, Opera
         res.b = this.getStyle(oEl, "border-bottom-width");
         res.l = this.getStyle(oEl, "border-left-width");
         res.r = this.getStyle(oEl, "border-right-width");
     }
     
     if (oEl.currentStyle) {
         res.isInner = true;
     }
     res.b = parseInt(res.b); if (isNaN(res.b)) res.b = 0;
     res.t = parseInt(res.t); if (isNaN(res.t)) res.t = 0;
     res.l = parseInt(res.l); if (isNaN(res.l)) res.l = 0;
     res.r = parseInt(res.r); if (isNaN(res.r)) res.r = 0;
     return res;
},

/*
Method: getPaddings()
Returns an object with the top, right, bottom, left (t,r,b,l) thickness of an element's padding in pixels. 

Object also has an isInner property, which represents whether the element is being rendered
in Microsoft Internet Explorer (IE6) or not. The isIe property is useful because in quirks mode,
IE includes margins, padding, and borders in its calculation of the total width of an element.
Thus in IE, elements with a declared width will often be rendered more narrow than in other browsers.

Arguments:
oEl - (Element) The element whose paddings to return.

Example:
(start code)
//get top padding of element
var el = $('aPara');
var topPadding = utils.getPaddings(el).t;
(end)
*/
getPaddings: function(oEl) {
     var res = {t:0, b:0, l:0, r:0};
     res.t = this.getStyle(oEl, "paddingTop");
     if (typeof(res.t) == "string" && res.t != "") {    //IE, Firefox
         res.b = this.getStyle(oEl, "paddingBottom");
         res.l = this.getStyle(oEl, "paddingLeft");
         res.r = this.getStyle(oEl, "paddingRight");
     } else {
         res.t = this.getStyle(oEl, "padding-top");    //Firefox, Opera
         res.b = this.getStyle(oEl, "padding-bottom");
         res.l = this.getStyle(oEl, "padding-left");
         res.r = this.getStyle(oEl, "padding-right");
     }
     
     res.b = parseInt(res.b); if (isNaN(res.b)) res.b = 0;
     res.t = parseInt(res.t); if (isNaN(res.t)) res.t = 0;
     res.l = parseInt(res.l); if (isNaN(res.l)) res.l = 0;
     res.r = parseInt(res.r); if (isNaN(res.r)) res.r = 0;
     return res;
},

/*
Method: getMargins()
Returns an object with the top, right, bottom, left (t,r,b,l) thickness of an element's margins in pixels. 

Arguments:
oEl - (Element) The element whose margins to return.

Example:
(start code)
//get top margin of element
var el = $('aPara');
var topMargin = utils.getMargins(el).t;
(end)
*/
getMargins: function(oEl) {
     var res = {t:0, b:0, l:0, r:0};
     res.t = this.getStyle(oEl, "marginTop");
     if (typeof(res.t) == "string" && res.t != "") {    //IE, Firefox
         res.b = this.getStyle(oEl, "marginBottom");
         res.l = this.getStyle(oEl, "marginLeft");
         res.r = this.getStyle(oEl, "marginRight");
     } else {
         res.t = this.getStyle(oEl, "margin-top");    //Firefox, Opera
         res.b = this.getStyle(oEl, "margin-bottom");
         res.l = this.getStyle(oEl, "margin-left");
         res.r = this.getStyle(oEl, "margin-right");
     }
     
     res.b = parseInt(res.b); if (isNaN(res.b)) res.b = 0;
     res.t = parseInt(res.t); if (isNaN(res.t)) res.t = 0;
     res.l = parseInt(res.l); if (isNaN(res.l)) res.l = 0;
     res.r = parseInt(res.r); if (isNaN(res.r)) res.r = 0;
     return res;
},

/*
Method: getScrolls()
Returns an object representing horizontal and vertical scroll in pixels of the window.

Arguments:
None.

Example: 
(start code)
//get vertical scroll
vertScroll = utils.getScrolls().y;
(end)
*/
getScrolls: function() {
     // http://www.quirksmode.org/viewport/compatibility.html
     var dim = {x:0, y:0};
     if (self.pageYOffset) { // all except Explorer
         dim.x = self.pageXOffset;
         dim.y = self.pageYOffset;
     } else if (document.documentElement /* && document.documentElement.scrollTop */) {
         // Explorer 6 Strict
         dim.x = document.documentElement.scrollLeft;
         dim.y = document.documentElement.scrollTop;
     } else if (document.body) { // all other Explorers
         dim.x = document.body.scrollLeft;
         dim.y = document.body.scrollTop;
     }
     dim.x = parseInt(dim.x);
     dim.y = parseInt(dim.y);
     return dim;
},

/*
******************************************************************
Group: Node Manipulation

Method: insertAfter()
Inserts a node into the document tree after a specified node. This is useful because there is no built-in JavaScript insertAfter method.

Arguments:
parent - (Element) The parent node of the node you are inserting

node - (Element) The node you are inserting

referenceNode - (Element) The node after which you are inserting the node
*/
insertAfter: function(parent, node, referenceNode) {
	parent.insertBefore(node, referenceNode.nextSibling);
},

/*
Method: moveAfter()
Moves a node after another one

Arguments:
item1 - (Node) The node to move
item2 - (Node) The reference node
*/
moveAfter: function(item1, item2) {
    var parent = item1.parentNode;
    parent.removeChild(item1);
    parent.insertBefore(item1, item2 ? item2.nextSibling : null);
},

/*
Method: moveBefore()
Moves a node before another one

Arguments:
item1 - (Node) The node to move
item2 - (Node) The reference node

*/
moveBefore: function(item1, item2) {
    var parent = item1.parentNode;
    parent.removeChild(item1);
    parent.insertBefore(item1, item2);
},

/*
Method: removeChildren()
Removes the children nodes of passed node

Arguments:
oObj - The node whose children you want to remove
*/  
removeChildren: function(oObj) {
     if (!oObj || typeof oObj != "object") return;
     while(oObj && oObj.hasChildNodes()) {
//         this.removeAllChildren(oObj.firstChild);
         oObj.removeChild(oObj.firstChild);
     }
},

// obsolete and MUST BE REMOVED!
removeAllChildren: function(oObj) {
     this.removeChildren(oObj);
},


/*
******************************************************************
Group: Node Querying.
*/

/*
Method: getParent()

Description:
Returns the parent element of a node. 

This is different than the built-in JavaScript parentNode method,
in that it gets the parent that is an *element*. This is useful because a parent can also be a 
text node (including white-space).

Arguments:
oEl - The object for which you want to get the parent.

Returns:
Element.
*/
getParent: function(oEl) {
     if (oEl) {
         var result = oEl.parentNode;
         while (result && result.nodeType != 1) result = result.nextSibling;
         if (result) return result;
     }
     return null;
},

/*
Method: getFirstChild()
Returns the first-child element of a node. 

This is different than the built-in JavaScript firstChild property, in that it gets the firstChild that is an *element*. This is useful because a firstChild could also be a  text node or white-space.

Arguments:
oEl - (Element) The element for which you want to get the firstChild element.

Returns:
Element.
*/  

getFirstChild: function(oEl) {
     if (oEl) {
         var result = oEl.firstChild;
         while (result && result.nodeType != 1) result = result.nextSibling;
         if (result) return result;
     }
     return null;
},

    
/*
Method: getNextSibling()
Gets the next element sibling of passed element.

Arguments:
oEl - (Element) The element for which you want to get the next element sibling.
sTagName (optional) - (String) Supply a tagName to filter results.

Returns:
Element.
*/   
getNextSibling: function(oEl, sTagName) {
    if (oEl) {
        var result = oEl.nextSibling;    
        if (sTagName) {
            var tn = sTagName.toUpperCase();
            while (result && result.tagName != tn) result = result.nextSibling;
        } else {
            while (result && result.nodeType != 1) result = result.nextSibling;
        }
        return result;
    }
    return null;
},

/*
Method: getPreviousSibling()
Gets the previous element sibling of passed element.

Paramters:
oEl - (Element) The element for which you want to get the previous element sibling.
sTagName (optional) - (String) Supply a tagName to filter results.

Returns:
Element.
*/
getPreviousSibling: function(oEl, sTagName) {    
     if (oEl) {
         var result = oEl.previousSibling;    
         if (sTagName) {
             var tn = sTagName.toUpperCase();
             while (result && result.tagName != tn) result = result.previousSibling;
         } else {
             while (result && result.nodeType != 1) result = result.previousSibling;
         }
         return result;
     }
     return null;
},
    
/*
Method: nextItem()
Gets the next node of a particular node name

Arguments:
oEl - (Element) The start element
sNodeName - (String) The nodeName of the next item you want to get (ie #comment, #text etc.)
*/ 
nextItem: function(oEl, sNodeName) {
    if (oEl == null) return null;
    var next = oEl.nextSibling;
    while (next != null) {
        if (next.nodeName == sNodeName) return next;
        next = next.nextSibling;
    }
    return null;
},

/*
Method: previousItem()
Gets the previous node of a particular node name

Arguments:
item - (Element) The item to start from.
sNodeName - (String) The nodeName of the next item you want to get (ie #comment, #text etc.).
*/
previousItem: function(oEl, sNodeName) {
    var previous = oEl.previousSibling;
    while (previous != null) {
        if (previous.nodeName == sNodeName) return previous;
        previous = previous.previousSibling;
    }
    return null
},

/*
Method: containsNode()
Check if the element contains into given node.

Arguments:
oEl - (Element) The object to check.
oContainer - (Element) The given container.
*/
containsNode: function(oEl, oContainer) {
//     console.info(oObj, oContainer)
	if (oEl == null)
		return false;
	if (oEl == oContainer)
		return true;
	else
		return this.containsNode(this.getParent(oEl));
},

/*
Group: Style Querying
*/

/*
Method: getStyle()
Returns the style of passed property.

Tries to get accurate style of element taking into account cascade from in-page and external stylesheet, not just inline or javascript-set styles.

Arguments:
oEl - (Element) The element whose style to return.
sStyleProp - (String) The CSS property to return.   

Example:
(start code)
var para = $('myPara');
var color = utils.getStyle(para, 'color');
(end)
*/

getStyle: function (oEl, sStyleProp) {
    if (oEl.currentStyle) { // IE way
    	return oEl.currentStyle[sStyleProp];
    } else if (document.defaultView && document.defaultView.getComputedStyle) { // Standard way
    	return document.defaultView.getComputedStyle(oEl, '').getPropertyValue(sStyleProp);
    }     
},


/*
******************************************************************
Group: Text Processing
*/

/*
Method: getSelection()
Gets text selected by keyboard or mouse.

Arguments:
None.

Example:
(start code)
// given that user has some text selected in window
var selected = utils.getSelection();
(end)
*/

getSelection: function() {
     var text = "";
     if (window.getSelection) {  
         text += window.getSelection();
     } else if (document.getSelection) {  
         text += document.getSelection();
     } else if (document.selection){        //IE
         text += document.selection.createRange().text;
     }
     return text;
},

/*
Method: selectRange()
Selects text on page.

Arguments:
oEl - (Element) The parent element of the text to select.
iStart - (Integer) The index position to start selection.
iLength - (Integer) The length of selection. 
*/
selectRange: function (oEl /*:element*/, iStart /*:int*/, iLength /*:int*/) {
    if (!(oEl && oEl.value)) return;
    
    if (oEl.createTextRange) {
        //use text ranges for Internet Explorer
        var oRange = oEl.createTextRange(); 
        oRange.moveStart("character", iStart); 
        oRange.moveEnd("character", iLength - oEl.value.length);      
        oRange.select();
    } else if (oEl.setSelectionRange) {
        //use setSelectionRange() for Mozilla
        oEl.setSelectionRange(iStart, iLength);
    }     
    //set focus back to the textbox
    oEl.focus();      
},


/*
Method: getTextContent()
Get text content of element.

Arguments:
oEl - (Element) The element whose text content you want to get.
*/
getTextContent: function(oEl) {
     /*@cc_on return oEl.text; @*/     // !! do not remove this comment !!
     return oEl.textContent;
},

/*
Method: getPlural()
Get suffix for creating plural form for noun.

Arguments:
iN - (Integer) 
sSuffix - (String) hint ("y") for words like 'assembly'
// example "4 + cap" + getPlural(4) -> "4 caps"
*/
getPlural: function(iN, sSuffix) {
    if (undefined == sSuffix) { // second param is omitted
        return (iN > 1 ? "s" : "");
    } else if ("y" == sSuffix) {    // assembly -> assemblies
        return (iN > 1 ? "ies" : "y");
    } else {
        return (iN > 1 ? sSuffix + "s" : sSuffix);
    }
},

/*
Method: getPeriodToString()
Get delta between two timestamps, return something like "2 days and 3 hours ago".

Arguments:
iDelta - (Integer) - time period in milliseconds.

Returns:
String.
*/
getPeriodToString: function(iDelta) {
    var x = "Error, cannot convert '" + iDelta + "'";
    var sDir;
    iDelta = parseInt(iDelta);
    if (iDelta < 0) {
        sDir = " before";
        iDelta = -iDelta;
    } else 
        sDir = " ago";
    
    var iS = parseInt(iDelta / 1000);
    var iM, iH, iD;
    if (iS < 60) {
        x = iS + " second" + this.getPlural(iS);
    } else {
        iM = parseInt(iS / 60);
        if (iM < 60) {
            x =  iM + " minute" + this.getPlural(iM);
        } else {
            iH = parseInt(iM / 60);
            if (iH < 24) {
                iM = iM - iH * 60;
                x =  iH + " hour" + this.getPlural(iH) + " and " + iM + " minute" + this.getPlural(iM);
            } else {
                iD = parseInt(iH / 24);
                iH -= iD * 24;
                x =  iD + " day" + this.getPlural(iD) + " and " + iH + " hour" + this.getPlural(iH);
            }
        }
    }
    return x + sDir;
},


/*
Method: isEmail()
Check if string looks like valid e-mail address.

Arguments:
sAddress - (String) String to be test.

Returns:
Boolean, 'true' if sAddress looks like e-mail address, 'false' otherwise
*/
isEmail: function (sAddress) {
     // http://www.javascriptkit.com/script/script2/acheck.shtml
     var filter=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
     return (filter.test(sAddress))
},


/*
Method: getParams()
Parse string like "a=x&b=y" and return object "o": o.a=x; o.b=y

Arguments:
sStr - (String) String to be parse.
sDelim - (String) delimiter between parameters. Default values is "&amp;" and "&".

Returns:
Object  
*/
getParams: function(sStr, sDelim) {
     var res = {};
     if (undefined == sStr) return res;
     var a;
     if (sDelim) {
         a = sStr.split(sDelim);
     } else {
         if (sStr.indexOf("&amp;") == -1) {
             a = sStr.split("&");
         } else {
             a = sStr.split("&amp;");
         }
     }
//    console.info(a);
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split("=");
        if (b[0] == "") continue;
        if (b[1] == "") {
            res[b[0]] = true;
        } else {
            res[b[0]] = unescape(b[1]);
        }
    }
    return res;
},


/*
Method: Dump()
Dump object to string

Arguments:
oObj - (Object) Object to dump.
l - (Integer) Depth level, 1 by default.

Returns:
String.
From: http://dklab.ru/chicken/nablas/38.html 
*/
Dump: function(oObj, iDepth) {
    if (iDepth == null) iDepth = 1;
    var s = '';
    if (typeof(oObj) == "object") {
        s += typeof(oObj) + " {\n";
        for (var k in oObj) {
            for (var i = 0; i < iDepth; i++) s += "  ";
            s += k + ": " + this.Dump(oObj[k], iDepth + 1);
        }
        for (var i = 0; i < iDepth - 1; i++) s += "  ";
        s += "}\n"
    } else {
        s += "" + oObj + "\n";
    }
    return s;
},

/*
Group: Java Script on demand loader

Loads JavaScripts from other JavaScript files. 

This is useful because you can load related scripts only when needed. 
If scriptA needs a component from script b, you can load script b from script a.  

jsLoader is an object acting as a class. You will need to set one of its properties (sBase) 
and call its method (load).
*/
jsLoader:  {
/*
Method: jsLoader.load()
Loads JavaScripts from other JavaScript files. 

Parameter:
aScripts - (Object) Array of strings with javascript names

Returns:
None. 
*/
    load: function (aScripts) {
        var oS = document.getElementsByTagName("script");
        for (var j = 0; j < oS.length; j++) {
            if (oS[j].src == "") continue;
            this.oLoaded.push(oS[j].src);
        }

        var sHost = document.location.protocol + "/" + "/" + document.location.host;
        var sPath = document.location.pathname;
        sPath = sPath.substring(0, sPath.lastIndexOf("/")) + "/";

        var oHead = document.getElementsByTagName("head")[0];
        for (var i = 0; i < aScripts.length; i++) {
            var sNewSrc = this.sBase + aScripts[i];
            if (sNewSrc.indexOf(":/" + "/") == -1) {
                if (sNewSrc.indexOf("/") == 0) {
                    sNewSrc = sHost + sNewSrc;
                } else {
                    sNewSrc = sHost + sPath + sNewSrc;
                }
            }

            var oS = document.getElementsByTagName("script");
            var b = true;
            for (var j = 0; j < this.oLoaded.length; j++) {
                if (sNewSrc == this.oLoaded[j]) {
                    b = false;
                }
            }

            if (b) {
                document.write("<script src='" + sNewSrc + "' type='text/javascript'></script>");
                this.oLoaded.push(sNewSrc);
            }
        }
    },
    
/*
Property: jsLoader.sBase
String
*/
    sBase: "",
    oLoaded: []
},

/*
******************************************************************
Group: Obsolete parts
*/
/*
Method: insertInHtml()
Insert text into object.

Arguments:
text - (String) Text to insert.
obj - (Object) Object wich text be inserted.
*/
insertInHtml: function(text, obj) {
	if (document.all) {
		obj.innerHTML += text;
	} else {
		var range = document.createRange();
		range.setStartAfter(obj);
		var docFrag = range.createContextualFragment(text);
		obj.appendChild(docFrag);
	}
},
    
/*
Method: replaceInHtml()
Replace text into object.

Arguments:
text - (String) Text to replace existing content.
obj - (Object)object wich text be replaced.
*/
replaceInHtml: function(text, obj) {
	if (document.all) {
		obj.innerHTML = text;
	} else {
		while (obj.hasChildNodes()) obj.removeChild(obj.firstChild);
		var range = document.createRange();
		range.setStartAfter(obj);
		var docFrag = range.createContextualFragment(text);
		obj.appendChild(docFrag);
	}
},

/*
Method: drawText()
Insert/Replace text into object.

Arguments:
sText - (String) Text to replace existing content.
sId - (String) Object Id.
add - (Boolean) Add text if 'add' is true.
*/
drawText: function (sText, sId, add) {
    if (!sId) sId = "debug";
    var obj = document.getElementById(sId);
    if (obj) {
        if (add)
            obj.innerHTML = "<br/>" + sText;
        else
            obj.innerHTML += sText;
        }
    },


// ==== portal related functions ====
   // Create an id that doesn't exist in this document
   createNewId: function() {
      var newid = null;

      while (!newid || document.getElementById(newid)) {
         newid = "XID" + Math.round(Math.random() * 65536).toString(16);
      }
      return newid;
   }
};

/*
******************************************************************
Class: String
Extensions to core JavaScript String Class

Method: trimSpaces()
Trims leading and/or trailing spaces from a string

Arguments:
trimMode (Optional) - (Int) How to trim spaces. 0, trim leading and trailing; 1, trim leading only; 2, trim trailing only. Defaults to 0.

Example:
(start code)
//trim all spaces from string
var str = "  hello world    ";
str.trimSpaces();
(end)

*/
String.prototype.trimSpaces = function(trimMode) {
    var targetString = this;
    var iPos = 0;
    if (!trimMode) trimMode = 0;
    
    if (trimMode==0 || trimMode==1) {
        if (targetString.charAt(iPos)==" ") {
            while(targetString.charAt(iPos)==" ") iPos++;
            targetString = targetString.substr(iPos);
        }
    }

    iPos = targetString.length-1;
    if (trimMode==0 || trimMode==2) {
        if (targetString.charAt(iPos) == " ") {
            while(targetString.charAt(iPos) == " ") iPos--;
            targetString = targetString.substr(0, iPos + 1);
        }
    }
    return targetString;
}



/*
******************************************************************
Class: Helpers

Group: Shortcuts

Function: $()
Shortcut for document.getElementById.

If you supply multiple ids as parameter, $() returns an array.

Arguments:
id - (String) The id(s) of the elemnent(s) to return.

Returns:
Element/Array

Example:
> var elems = $('foo','bar');
> // elems is an array with an element whose id="foo" and another element whose id="bar"

*/
function $() {
  var elements = new Array();

  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (typeof element == 'string')
      element = document.getElementById(element);

    if (arguments.length == 1)
      return element;

    elements.push(element);
  }

  return elements;
}

/*
Function: $C()
Returns an array of nodes by class or another specified attribute. 

This is the getElementByClass method that is missing from the built-in DOM methods.

$C() is not a member of the utils object, so you do not need to call it like this
> utils.$C('foo');

Instead call it like this,
> $C('foo');

Arguments:
attrValue - (String) The the name of the class (or attribute) you want to query. This is the only required argument. By default, if you supply just this attribute, the method returns array of nodes by class. i.e. 
You can supply the attrValue argument with a wildcard ('*') to return any attribute value of a given attribute. i.e.
>$C('*', 'id', document, 'p') //Returns any p tag in document with  an id attribute, with any value.
 
attrName (Optional) - (String) You can supply an attribute name to return an array of elements with that attribute name. i.e.
> $C('foo', 'name') //Returns an array of elements with the attribute 'name' of 'foo'.

node (Optional) - (Node) By default this is 'document'. You can supply a parent node in order to define a range for your query. This allows you to avoid traversing the entire DOM. i.e. 
> $C('foo', 'name', $("containerDiv")); 

tag (Optional) - The tag name of the element you want to return. You can further limit what you return by supplying a tag name. You must supply a node if you want to limit by tag name.

Returns:
Array

Example:
(start code)
//get all elements with class="foo"
var elems = $C('foo');
(end)


*/
// http://www.dustindiaz.com/top-ten-javascript/ (but has some errors)
function $C(attrValue, attrName, node, tag) {
    //alert([attrValue, attrName, node, tag])
    if ("*" == attrValue) {
        return $AN(attrName, node, tag);
    }
	var oElements = new Array();
	if (!node) node = document;
	if (!tag) tag = '*';
	if (!attrName) attrName = 'class';
    
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("(^|\\s)" + attrValue + "(\\s|$)");
    var j = 0;
	for (i = 0; i < elsLen; i++) {
		if (attrName == "class" && pattern.test(els[i].className)) {
            // IE behavior
            oElements[j++] = els[i];
		} else if (pattern.test(els[i].getAttribute(attrName))) {
			oElements[j++] = els[i];
		}
	}
    return oElements;
}

/*
Function: $AN()
Returns an array of nodes which have attribute names that match supplied attrName argument. 

You can futher limit what is returned by supplying a parent node (by default this is 'document') and a tag.

$AN() is not a member of the utils object, so do not call it like this, 
> utils.$AN()

Instead call it like this,
> $AN()

Arguments:
attrName - (String) The name of the attribute of the elements you want to return

atttrNode (Optional) -  By default this is 'document'. You can avoid traversing the entire DOM by supplying a parent
node other than document, if one exists. 

tag (optional) = (String) You can limit by tag name the elements that are returned.

Returns: Array

Example:
(start code)
// returns all p elements with a style attribute in the body of the document
var elems = $AN('style', document.body, 'p');
(end)

*/

// and which has attribute "attrName"
function $AN(attrName, node, tag) {
	var oElements = new Array();
	if (node == null) node = document;
	if (tag == null)tag = '*';
	var els = node.getElementsByTagName(tag);
	for (i = 0; i < els.length; i++) {
		if (els[i].getAttribute(attrName) > "") {
			oElements[oElements.length] = els[i];
		}
	}
	return oElements;
}

// Shortcut for getElementsByName
/*
Function: $N()
Returns an array of nodes by name.

You can limit DOM traversal by passing a parent node.

Arguments:
name - (String) The value of the name attribute to return.
node (Optional) - (Node) The parent node.

Example:
(start code)
// get all elements in the head of the document with a name="foo"
var anchors = $N('foo', $('head'));
(end)

*/
function $N(name, node) {
   var oElements = [];
   if (node == null) node = document;
   var els = node.getElementsByName(name);
   for (i = 0; i < els.length; i++) {
       oElements[oElements.length] = els[i];
   }
   return oElements;
}
//=========================












// Default debug implementation does nothing
debug = function() { };

debug.prototype = {
   constructor: function() { },
   enable: function() { },
   disable: function() { }
};

