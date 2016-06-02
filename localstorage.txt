var LocalStorage = {
    ifsupport : window.localStorage ? true : false,
    setItem : function(key,value){
        try{
           window.localStorage.setItem(key,value);
        }catch(e){
           console.log("localStorage is not support"+e);
        }
    },
    getItem : function(key){
      try{
         return window.localStorage.getItem(key);
      }catch(e){
         return null;
      }
    },
    removeItem : function(key){
       try{
         window.localStorage.removeItem(key);
       }catch(e){
          console.log("localStorage is not support"+e);
       }
    },
    checkStorage : function(key,value){
        
    },
    appendItem :function(key,value){
        try{
         var _orgVal = window.localStorage.getItem(key);
         if(!_orgVal){
            this.setItem(key,value);
            return;
         }
         var arr = _orgVal.split(",");
         if(arr.length > 2){
            var _len = arr.length - 2;
            for(var i = 0 ; i < _len;i++){
              var _key = arr.shift();
              if(_key !== value){
                  this.removeItem(_key);
              }
            }
         }
         arr.push(value);
         window.localStorage.setItem(key,arr.join(","));
        }catch(e){
          console.log("localStorage is not support"+e);
        }
    }
};

var Cookie = {
     set : function(key,value,expires){
        var expStr ="";
       if(expires){
           var time = new Date().getTime();
           time += expires;
           expStr = ";expires="+new Date(time).toGMTString();
        }
        document.cookie = key + "=" + value + expStr;
    },
    get : function(key){
        if(document.cookie.length > 0){
            var _cstart = document.cookie.indexOf(key+"=");
            if(_cstart > -1){
                _cstart = _cstart + key.length + 1;
                var _cend = document.cookie.indexOf(";",_cstart);
                if(_cend === -1){
                    _cend = document.cookie.length;
                }
                return  unescape(document.cookie.substring(_cstart,_cend));
            }
        }
        return "";
    }
};