function Notifier() {
   this.oQuee = {};
}

Notifier.prototype.setListener = function(oListener, sMessage, fFunction, oNotifier) {

    function x_setListener(oListener, sMessage, fFunction, oNotifier) {
       for (var j in oThis.oQuee[sMessage]) {
          if (oThis.oQuee[sMessage][j] === oListener){ return false;}
       }
       if (!oThis.oQuee[sMessage]){ oThis.oQuee[sMessage] = [];}
       j = oThis.oQuee[sMessage].length;   //IE5.0
       oThis.oQuee[sMessage][j++] = ({obj:oListener, fun:fFunction, ntf:oNotifier});
       return true;
    }

    var oThis = this;
    if (utils.isArray(oListener)) {
        for (var i in oListener) {
            x_setListener(oListener[i], sMessage, fFunction, oNotifier);
        }
    } else {
        return x_setListener(oListener, sMessage, fFunction, oNotifier);
    }

};


Notifier.prototype.Notify = function(oNotifier, sMessage, oComment, oListener) {
    var sAnyMessage = "*";
    for (var i in this.oQuee[sAnyMessage]) {
        if (null == oListener || this.oQuee[sAnyMessage][i].obj == oListener) {
            if (this.oQuee[sAnyMessage][i].ntf == null || this.oQuee[sAnyMessage][i].ntf === oNotifier) {
                if ("function" == typeof this.oQuee[sAnyMessage][i].fun) {
                    var fun = this.oQuee[sAnyMessage][i].fun;
                    fun(this.oQuee[sAnyMessage][i].obj, oComment, sMessage, oNotifier);
                }
            }
        }
    }

   for (i in this.oQuee[sMessage]) {
        if (null == oListener || this.oQuee[sMessage][i].obj == oListener) {
            if (this.oQuee[sMessage][i].ntf == null || this.oQuee[sMessage][i].ntf === oNotifier) {
               if ("function" == typeof this.oQuee[sMessage][i].fun) {
                  if (this.oQuee[sMessage][i].fun(this.oQuee[sMessage][i].obj, oComment, sMessage, oNotifier)) {
                     return;
                  }
               }
            }
        }
    }
};

// Singleton for global shared notifier
Notifier.getInstance = function() {
   if (!Notifier.instance) {
       Notifier.instance = new Notifier();
   }
   return Notifier.instance;
};