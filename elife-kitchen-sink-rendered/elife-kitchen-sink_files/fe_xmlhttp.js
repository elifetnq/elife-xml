// FIXME: include the global version of this class
//
// $Id: fe_xmlhttp.js 192490 2010-05-24 22:16:26Z pascaree $

function RemoteDataProvider(sUrl) {
    this.sUrl = sUrl;
    this.bAsync = true;
    this.iTimeout = 0;
}

RemoteDataProvider.prototype.x_GetHttpObj = function() {
    var oHttpObj = null;
    try {
        oHttpObj = new ActiveXObject("Msxml2.XMLHTTP");
    } catch(e) {
        try {
            oHttpObj = new ActiveXObject("Microsoft.XMLHTTP");
        } catch(oc) {
            oHttpObj = null;
        }
    }
    if (!oHttpObj && typeof XMLHttpRequest != "undefined") {
        oHttpObj = new XMLHttpRequest();
    }
    this.oHttpObj = oHttpObj;
    return oHttpObj; 
};


RemoteDataProvider.prototype.x_onChange = function(oHttpObj, oTimer) {
    if (oTimer.bTimeout) { return; }  // timeout is occured
    if (oHttpObj.readyState == 4 && oHttpObj.status == 200) {
        if (oTimer.oTimer) { clearTimeout(oTimer.oTimer); }
        this.onSuccess(oHttpObj);
        this.onStop();    
    } else if (oHttpObj.readyState == 4 && oHttpObj.status != 200) {
        if (oTimer.oTimer) { clearTimeout(oTimer.oTimer); }
        this.onError(oHttpObj);
        this.onStop();    
    }
};

RemoteDataProvider.prototype.x_Init = function(oTimer) {
    var oHttpObj = this.x_GetHttpObj();
    if (null == oHttpObj) { return null; }
    
    if (oHttpObj.readyState !== 0) { oHttpObj.abort(); }
    
    var oThis = this;
    if (this.bAsync) {
        oHttpObj.onreadystatechange = function () {
            oThis.x_onChange(oHttpObj, oTimer);
        };
    }
    
    this.iActiveRequests++;
    this.onStart();
    if (this.iTimeout > 0) {
        oTimer.bTimeout = false;
        oTimer.oTimer = setTimeout(function() {
            oTimer.bTimeout = true;
            oHttpObj.abort();
            oThis.onTimeout(oThis.iTimeout); 
        }, this.iTimeout);
    }
    return oHttpObj;
};

// GET request
RemoteDataProvider.prototype.Get = function(sRequest) {
    var sUrl = this.sUrl + (sRequest ? sRequest : "");
    var oTimer = {};
    var oHttpObj = this.x_Init(oTimer); 
    
    if (oHttpObj) {
        oHttpObj.open("get", sUrl, this.bAsync);
        oHttpObj.send(null);
        if (!this.bAsync) {
            this.x_onChange(oHttpObj, oTimer);
        }
    }
};

// POST request
RemoteDataProvider.prototype.Post = function(sRequest) {
    this.Request(null, sRequest);
};


// GET + Post request
RemoteDataProvider.prototype.Request = function(sGetRequest, sPostRequest) {
    var sUrl = this.sUrl + (sGetRequest ? sGetRequest : "");
    var oTimer = {};
    var oHttpObj = this.x_Init(oTimer); 
    if (oHttpObj) {
        if (typeof sPostRequest != "string" || sPostRequest === "") {
            sPostRequest = "";
        }
        oHttpObj.open("post", sUrl, this.bAsync);
        oHttpObj.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
        oHttpObj.setRequestHeader("Content-length", sPostRequest.length); 
        oHttpObj.send(sPostRequest);
        if (!this.bAsync) {
            this.x_onChange(oHttpObj, oTimer);
        }
    }
};


RemoteDataProvider.prototype.onSuccess = function(obj) {
    alert(["succes:", obj.responseText]);
};

RemoteDataProvider.prototype.onStart = function() {
//    alert(["start:"]);
};

RemoteDataProvider.prototype.onStop = function() {
//    alert(["start:"]);
};

RemoteDataProvider.prototype.onError = function(obj) {
    alert(["error:", obj.status]);
};

RemoteDataProvider.prototype.onTimeout = function(iTime) {
    alert(["timeout:", iTime + " ms"]);
};

RemoteDataProvider.prototype.Abort = function() {
    this.oHttpObj.abort();
}

// siteName is p$site (from the "page")
// Variable number of arguments
// Args are JSON pairs [attr_name => attr_value]

xmlHttpCall = function (siteName, portletPath, actionName, args, callback, userArgs, oThis) {

   // Build query string
   var xhrArgs = {
      'p$site': siteName,
      'p$rq':   portletPath + ":" + actionName
   };

   for (var arg in args) {
      xhrArgs[arg] = args[arg];
   }

   var query_string = "";
   var hasValue = false;
   for (var arg in xhrArgs) {
      var sep = (hasValue)?"&":"";
      query_string += sep + encodeURIComponent(arg);
      if (xhrArgs[arg] != null) {
            query_string += "="+encodeURIComponent(xhrArgs[arg]);
      }
      hasValue = true;
   }

   // Post back to portal.fcgi
   var rdp = new RemoteDataProvider(window.location.href.replace(/\?.*/,''));

   // Asynchronous if there's a callback
   rdp.bAsync = (callback != null);
   
   //Only need to add if it is Async [Sync will lock up browser]
   if(rdp.bAsync){
       xmlHttpCall._addCall(rdp);
   }
   
   // Long timeout--10 seconds
   rdp.iTimeout = 10000;

   // Do callback if function succeeds
   rdp.onSuccess = rdp.onError = function(obj) {
         
      xmlHttpCall._removeCall( rdp );
   
      // FIXME: Have to:
      // var result = xmlHttpObject.responseText;
      // result = result.replace(/\\\"/g,'"');
      // JSON parse here?
      if (callback && typeof(callback) == 'function') {
         if (oThis != null) {
            callback.call(oThis, obj, userArgs);
         } else {
            callback(obj, userArgs);
         }
      } else {
         throw "xmlHttpCall: callback not defined or not a function";
      }
   };

   // Fake a 408 to indicate timeout
   rdp.onTimeout = function(obj) {
   
      xmlHttpCall._removeCall( rdp );
   
      var fakeHttpResponse = {
         'iTimeout': obj,
         'responseText': null,
         'responseXML': null,
         'status': 408,
         'statusText': 'Request Timeout'
      };

      if (oThis != null) {
         if (callback && typeof(callback) == 'function') {
            if (oThis != null) {
               callback.call(oThis, fakeHttpResponse, userArgs);
            } else {
               callback(fakeHttpResponse, userArgs);
            }
         } else {
            throw "xmlHttpCall: callback not defined or not a function (timeout)";
         }
      }
   };

   // Do POST
   rdp.Post(query_string);
};


//Store Array of Active Ajax Calls
xmlHttpCall._activeCalls = [];

//Add Active Call to Array [Called on itialization of call]
xmlHttpCall._addCall = function(xhrObj){
    xmlHttpCall._activeCalls.push( xhrObj );
};

//Remove Active Call [called onError/onSuccess/onTimeout]
xmlHttpCall._removeCall = function(xhrObj){
    for(var i=0;i<xmlHttpCall._activeCalls.length;i++){
        if(xmlHttpCall._activeCalls[i] === xhrObj){
            xmlHttpCall._activeCalls.splice(i,1);
            break;
        }        
    }
};

//Kills all of the Ajax Calls that are active [called by form submission in dispatcher]
xmlHttpCall.abortCalls = function(){
    for(var i = xmlHttpCall._activeCalls.length;i--;){
        try{
            xmlHttpCall._activeCalls[i].abort();
        }
        catch(e){}  
    }
    xmlHttpCall._activeCalls = [];
};

