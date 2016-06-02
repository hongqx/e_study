/*version 2016-04-28*/
(function($){
var LocalStorage = {
    ifsupport : window.localStorage ? true : false,
    setItem : function(key,value){
        try{
           window.localStorage.setItem(key,value);
        }catch(e){
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
         var arr = _orgVal.length > 0 ? _orgVal.split(","):[];
         if(arr.length > 2){
            for(var i = 0 ; i < arr.length-2;i++){
                var _key = arr.shift();
                if(_key !== value){
                  this.removeItem(_key+"_subtitle");
                }
            }
          }
          _orgVal = arr.join(",");
          if(_orgVal.indexOf(value) < 0){
             arr.push(value);
          }
          window.localStorage.setItem(key,arr.join(","));
        }catch(e){
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
        var _domain = ";domain=yxgapp.com";
        document.cookie = key + "=" + encodeURIComponent(value) + expStr+_domain;
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
                return  decodeURIComponent(document.cookie.substring(_cstart,_cend));
            }
        }
        return "";
    }
};

var videoPlayer = {
    /**
     * 初始化播放组件
     * @param  {String} containerId    容器id
     * @param  {Object} options 配置信息
     * @return {}         [description]
     */
    init:function(containerId,options){
        this.containerId = containerId;
        this.container = $("#"+this.containerId);
        this.video = $(this.container).find("video")[0];
        this.options = options;
        this.userInfo = options.userInfo;
        this.controlBtn = $(this.container).find(".play-btn")[0];
        this.trigger = $(this.container).find(".video-trigger")[0];
        this.mask = $(this.container).find(".video-mask")[0];
        this.startPlay = false;
        $(this.video).attr("preload","auto");
        this.videoId = this.options.videoId;
       /* if(videoData){
          this.initData(videoData);
          return;
        }*/
        this.getData();
        //this.data = data;
    },
    changeVideo:function(data,videoId){
        this.dataIsok = false;
        this.startPlay = false;
        this.videoId = videoId;
        this.currentTime = 0;
        this.totalTime = 0;
        this.data = data;
    },
    initData:function(data,callback){
       if(!data.result.result){
          //console.log("data result is error");
          if(this.options.onDataError){
            this.options.onDataError(data);
          }
       }else if(!this.dataIsok){
          this.dataIsok = true;
          this.data = data.video;
          if(this.options.onDataok){
             this.options.onDataok(this.data);
          }
          if(!this.eventIfOk){
            this.eventIfOk = true;
            this.addEvent();
          }
          this.initPlayer();
          if(callback){
            callback(data);
          }
       }
       
    },
    getData:function(){
        var _url = "http://m.yxgapp.com/d/mooc/GetVideo.json",
            _self = this;
        var _params = {
            videoId:this.videoId,
            token:this.userInfo.token,
            username:this.userInfo.username
        };
       $.ajax({
            url:_url,
            data:_params,
            dataType:"json",
            success:function(data){
               _self.initData(data);
               //console.log(data);
            },
            error:function(){
                //console.log("参数错误");
            }
       });
    },
    initPlayer:function(){
        this.poster = document.createElement("img");
        this.poster.src = this.data.coverUrl;
        $(this.video).after(this.poster);
        this.video.src = this.data.url;
        this.video.load();
        $(this.video).show();
        this.totalTime = this.data.durationHour;
        if(this.options.autoPlay){
            this.video.play();
        }
    },
    addEvent:function(){
        var _self = this;
        $(this.controlBtn).on("click",function(){
           _self.play();
           return false;
        });
        $(this.trigger).on("mouseenter",function(e){
           //console.log("mouseenter");
           _self.showControl();
        });
        $(this.trigger).on("mouseleave",function(e){
           //console.log("mouseleave");
           _self.hideControl();
        });
        $(this.trigger).on("click",function(){
           _self.showControl();
        })
        var eventList = {
           "play":"onPlay",
           "pause":"onPause",
           "timeupdate":"onTimeUpdate",
           "error":"onError",
           "ended":"onEnded",
           "seeking":"onSeeking",
           "seeked":"onSeeked",
           "waiting":"onWating"
        };
        function addEventHander(object,fun){
            var args = Array.prototype.slice.call(arguments).slice(2);
               return function(event) {
                //console.log("$ " + fun);
                return fun.apply(object, [event || window.event].concat(args));
            }
        }
        for(var key in eventList){
          var keyFn = addEventHander(this,this[eventList[key]]);
          $(this.video).on(key,keyFn);
        }
    },
    hideControl : function(){
        if(!this.startPlay || this.video.paused ||  $(this.controlBtn).css("display") === "none"){
            return;
        }
        $(this.controlBtn).fadeOut();
        $(this.mask).fadeOut();
    },
    showControl : function(){
        //console.log(this.startPlay+"  " +!this.video.paused+"  "+ ($(this.controlBtn).css("display")==="none"));
        if(this.startPlay){
            $(this.controlBtn).fadeIn();
            $(this.mask).fadeIn();
        }
    },
    changeBtnState:function(state){
        //播放状态 显示暂停
        if(state){
            $(this.trigger).removeClass("playbtn");
            $(this.trigger).addClass("pausebtn");
        //暂停状态
        }else{
            $(this.trigger).addClass("playbtn");
            $(this.trigger).removeClass("pausebtn");
        }
    },
    removeEvent : function(){
    },
    onPlay : function(){
       this.startPlay = true;
       $(this.poster).fadeOut("slow");
       //this.hideControl();
       this.changeBtnState(true);
       this.hideControl();
    },
    onPlaying : function(){
       console.log("onplaying");
    },
    onEnded : function(){
        this.showControl();
        this.changeBtnState(false);
        if(this.options.onEnd){
            this.options.onEnd();
        }
    },
    onPause : function(){
        //console.log("onPause");
        this.changeBtnState(false);
        this.showControl();
    },
    onWating : function(){
        //console.log("onWating");
        this.video.play();
    },
    onTimeUpdate : function(){
       this.currentTime = this.video.currentTime;
       this.options.onUpdate ? this.options.onUpdate(this.video.currentTime) : "";
       //console.log("currentTime:"+this.currentTime);
    },
    onError : function(){
        console.log("the video play is error");
    },
    onSeeking : function(argument) {
      //console.log("onSeeking");
    },
    onSeeked : function (argument) {
       //console.log("onSeeked");
    },
    play : function(){
       $(this.poster).fadeOut("slow");
       if(!this.startPlay){
         //this.hideControl();
         this.video.play();
       }else{
         if(this.video.paused){
            this.video.play();
         }else{
            this.video.pause();
         }
       }
    },
    pause:function(){
      this.video.pause();
    },
    isPause : function(){
       return this.video.paused;
    },
    seek : function(time, callback){
     // console.log("seek:"+time);
       this.video.currentTime = time;
       if(callback){
         callback(this.currentTime);
       }
       //this.video.load();
       this.video.play();
      //console.log("currentTime:"+this.video.currentTime);
    }
};

var subtitle = {
    init:function(containerId,options){
        this.container =  $("#"+containerId);
        this.videoId = options.videoId;
        this.dataOk = false;
        this.options = options;
        this.userInfo = options.userInfo;
        this.storeKey = this.videoId+"_subtitle";
        if(videoPlayer){
          this.player = videoPlayer;
        }
        this.params = {
            videoId:this.videoId,
            token:this.userInfo.token,
            username:this.userInfo.username
        };
        var _key = this.storeKey;
        /*先获取本地存储中的数据 初始化出来*/
        if(LocalStorage.getItem(_key)){
            var _subtitle = JSON.parse(LocalStorage.getItem(_key));
            if(_subtitle){
               this.version =  _subtitle.version;
               this.data = _subtitle;
            }else{
               this.version = -1;
            }
            //this.initData(_subtitle);
        }else{
            this.version = -1;
        }
        LocalStorage.appendItem("videos",this.videoId);
        this.getData();
        this.newSubtitle = [];
    },
    getData:function(){
        //if(this.dataOk) return;
        var _url = "http://m.yxgapp.com/d/mooc/SyncSubtitle.json",
            _self = this;
        var _params = this.params;
        _params.version = this.version;
        $.ajax({
            url:_url,
            data:_params,
            dataType:"json",
            success:function(data){
              _self.getCallback(data);
            },
            error:function(){
                //console.log("参数错误");
            }
        });
    },
    getCallback : function(data){
      if(!data.result.result){
        //console.log("the subtitleList is Run||"+data.result.reason);
        if(this.options && this.options.errorFun){
           this.options.errorFun(data.result);
        }else{
           alert("登录失效，请重新登录");
        }
      }else{
        //如果存在缓存 已缓存数据为标准，仅仅改变缓存数据的version
        if(this.version === -1){
           //缓存中没有数据 先讲数据进行排列处理
           data.subtitle.subtitleItems = this.queueItems(data.subtitle.subtitleItems);
           this.data = data.subtitle;
           this.version = data.subtitle.version;
           this.dataOk = true;
           this.initData();
        }else{
           //如果之前存在缓存 将获取到的数据和现在缓存中数据做比较
           this.checkLocalData(data.subtitle);
           this.initData();
        }
        LocalStorage.setItem(this.storeKey,JSON.stringify(this.data));
      }
    },
    initData : function(){
           //this.dataOk =  true;
           //this.data = subtitle;
           //console.log(subtitle.subtitleItems);
           //this.data.subtitleItems = this.data.subtitleItems;
           if(this.options.onDataok){
               //数据到位之后的回调
               this.options.onDataok(this.data);
           }
           this.totalNum = this.data.subtitleItems.length;
           this.curIndex  = this.data.subtitleItems[0] ? 0 : this.getNextIndex(0);
           this.pIndex = 0;//标记位置的
           this.curEndTime = this.data.subtitleItems[this.curIndex].endTime / 1000;
           this.createSubtitle(this.data.subtitleItems);
           this.totalDom = this.liDomList.length;
           this.addEvent();
           this.setPositionParams();
    },
    setPositionParams : function(){
        this.lineHeight = $(this.liDomList[0]).outerHeight();
        this.showNum =  parseInt(this.container.height() / this.lineHeight);
    },
    queueItems : function(items){
        var _len = items.length;
        var _newItems = new Array(_len);
        for(var i = 0 ; i < _len ; i++){
          var _item = this.checkItem(items[i]);
          _newItems[_item.index-1] = _item;
        }
        return _newItems;
    },
    //检查每一个新的item
    checkItem : function(_item){
      _item.sTime = this.getTimeModel(_item.startTime);
      _item.eTime = this.getTimeModel(_item.endTime);
      /*当字幕为空的时候 补充相关的信息*/
      if(!_item.baseSubtitleItem){
         _item.baseSubtitleItem = {
            subtitleItemId: _item.id,
            historyType : 1,
            content:"",
            isDifficult : 1,
            autoCaption : 0,
        };
      }
      if(!_item.extSubtitleItem){
        _item.extSubtitleItem = {
            subtitleItemId: _item.id,
            historyType : 2,
            content:"",
            isDifficult : _item.isDifficult,
            autoCaption : 0
        };
      }
      return _item;
    },
    /*获取线上数据之后和本地数据进行对比*/
    checkLocalData : function(newSubtitle){
        var _subTitleItems  = newSubtitle.subtitleItems,
            _len = _subTitleItems.length;
        for(var i = 0 ; i < _len ; i++){
           var _item = _subTitleItems[i];
           var _index = _item.index - 1;
           if(_item.version > this.data.subtitleItems[_index].version){
               _item = this.checkItem(_item);
               this.data.subtitleItems[_index] = _item;
           }
        }
        if(newSubtitle.version > this.data.version){
           this.data.version = newSubtitle.version;
           this.version = newSubtitle.version;
        }
    },
    getNextIndex : function(lastIndex){
       var tag = false,
          _nextindex = lastIndex+1;
       while(!tag && _nextindex < this.totalNum){
          if(!this.data.subtitleItems[_nextindex]){
            _nextindex++
          }else{
            tag =  true;
          }
       }
       return _nextindex;
    },
    addEvent : function(){
        //如果已经绑定过事件  不在做绑定
        if(this.eventOk){
           return;
        }
        this.eventOk =  true;
        var _self = this;
        this.container.delegate("li","click",function(e){
            //console.log("liClick");
            _self.changeIndex($(this),e);
            return false;
        });
        this.container.delegate(".ch-area","click",function(e){
           //console.log("ch-area click");
           //$(this).focus();
           _self.chClick($(this),e);
           return false;
        });
        this.container.delegate(".ch-area","focus",function(e){
           //console.log("ch-area focus");
           _self.edit = true;
           _self.editType = "ch";
           return false;
        });
        this.container.delegate(".ch-area","blur",function(e){
           //console.log("ch-area blur");
           _self.chBlur($(this),e);
           return false;
        });

        //英文显示部分交互
        this.container.delegate(".en-txt","click",function(e){
          _self.enClick($(this),e);
          return false;
        });
        this.container.delegate('.en-area','blur',function(e){
          _self.enBlur($(this),e);
          return false;
        });
        this.addKeyDownEvent();

    },
    /*添加键盘tab事件的处理*/
    addKeyDownEvent : function(){
        var _self = this;
        document.onkeydown = function(event){
            //console.log("onkeydown" + event.keyCode);
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if(e && e.keyCode==9){ // 按 Tab 
                _self.tabClick(event);
            }
            
        };
    },
    tabClick : function(event){
        //console.log("tabClick");
        if(this.pIndex+1 < this.totalDom){
          var _target = $(this.liDomList[this.pIndex+1]);
          var _textArea = _target.find(".ch-area");
          _textArea.click();
        }
    },
    changeIndex : function(target, e){
        //console.log("changeIndex:"+target.attr("data-index"));
        var _isPause = this.player.isPause();
        if(_isPause){
            this.seekVideo(target.attr("data-index"));
        }
        this.changeCurItem(target.attr("data-pindex"),e);
        return false;
    },
    chClick : function(target, e){
        this.edit = true;
        this.editType = "ch";
        this.changeIndex(target,e);
        return false;
    },
    chBlur : function(target, e){
        //console.log("chBlur");
        this.edit = false;
        this.editType = null;
        var _index = parseInt(target.attr("data-index"));//this.curIndex;
        var _subtitle = this.data.subtitleItems[_index];
        var val = target.val();
        if(_subtitle.extSubtitleItem.content !== val && val !== ""){
            _subtitle.extSubtitleItem.content = val;
            _subtitle.extSubtitleItem.updateTime = parseInt(new Date().getTime()/1000);
            _subtitle.extSubtitleItem.username = this.userInfo.username;
            _subtitle.extSubtitleItem.userNickname = this.userInfo.nickname;
            _subtitle.extSubtitleItem.autoCaption = 0;
            this.saveSubtitle(_subtitle.extSubtitleItem,_index);
        }
    },
    enClick : function(target, e){
        //console.log("enClick");
        this.edit = true;
        //var _this = $(this),
        this.editType = "en";
        val = target.text();
        target.hide();
        target.siblings(".en-area").val(val).show().focus();
        this.changeIndex(target,e);
        return false;
    },
    enBlur : function(target, e){
        //console.log("enBlur");
        this.edit = false;
        this.editType = null;
        val = target.val();
        target.hide();
        target.siblings('.en-txt').text(val).show();
        var _index = parseInt(target.attr("data-index"));
        var _basesubtitle = this.data.subtitleItems[_index].baseSubtitleItem;
        if(_basesubtitle.content !== val && val !== ""){
            _basesubtitle.content = val;
            _basesubtitle.updateTime =  parseInt(new Date().getTime()/1000);
            _basesubtitle.autoCaption = 0;
            _basesubtitle.username = this.userInfo.username;
            _basesubtitle.userNickname = this.userInfo.nickname;
            this.saveSubtitle(_basesubtitle,_index);
        }
    },
    changByTime : function(_time){
        if(this.edit && this.curEndTime < _time){
           this.player.pause();
        }
        var _nextindex = this.pIndex+1;
        if(!this.edit && this.curEndTime < _time /*&& _nextpindex < this.totalDom*/){
           this.changeCurItem(_nextindex);       
        }
        // var  _nextpindex = this.pIndex;
        // if(!this.edit && this.curEndTime < _time /*&& _nextpindex < this.totalDom*/){
        //    //var _nextpindex =  this.pIndex +1;
        //     for(var i = this.curItem ; i < this.totalNum; i++){
        //         var _item = this.subtitle.subtitleItems[i]
        //         if(_item.endTime / 1000 > _time && _item.startTime / 1000 < _time){
        //               break;
        //         }else{
        //             _nextpindex++;
        //         }      
        //     }
        //    this.changeCurItem(_nextpindex);
        // }
    },
    changeCurItem : function(_pindex,e){
        _pindex = parseInt(_pindex);
        if(_pindex === this.pIndex){
           return;
        }else{
           $(this.liDomList[this.pIndex]).removeClass("active");
           var _dom = $(this.liDomList[_pindex]);
           _dom.addClass("active");
           var _index = parseInt(_dom.attr("data-index"));
           this.curEndTime = this.data.subtitleItems[_index].endTime /1000;
           this.scroll(_pindex);
           e ? this.seekVideo(_index) : "";
           this.curIndex = _index;
           this.pIndex = _pindex;
        }
    },
    scroll : function(_index){
        if(_index > (this.totalNum-(this.showNum+1))){
          return;
        }
        var _top = _index === 0 ? 0 : (_index - 1) * this.lineHeight;
        this.container.mCustomScrollbar("scrollTo",_top);
    },
    seekVideo : function(_index){
        var _time = this.data.subtitleItems[_index].startTime;
        this.player.seek(_time/1000);
    },
    getTimeModel : function(_time){
        var _secondNum = parseInt(_time / 1000 ) ;
        var _minutes = parseInt(_secondNum / 60 );
        var _hours = parseInt(_minutes / 60 );
        _minutes = _minutes > 9 ? _minutes : ("0"+_minutes);
        _secondNum = _secondNum % 60;
        _secondStr = _secondNum > 9 ? _secondNum  : ("0"+_secondNum);
        if(_hours > 0){
          return  _hours+":"+_minutes+":"+_secondStr;
        }else{
          return _minutes+":"+_secondStr;
        }
    },
    createSubtitle : function(subtitleItems){
       var _len = subtitleItems.length;
       this.ulDom = this.container.find("ul").length === 0 ? $(document.createElement("ul")) : $(this.container.find("ul")[0]);
       this.ulDom.css({positon:"relative",top:0,left:0});
       var _pindex = 0;//标识位置的参数
       for(var i = 0 ; i < _len ; i++){
        var _liDom = document.createElement("li"),
            _domArr = [],
            _item = subtitleItems[i];
        if(!_item){
           continue;
        }
        var _index = _item.index;
        $(_liDom).attr("data-pindex",_pindex);
        $(_liDom).attr("data-index",(_index-1));
        if(i === this.curIndex){
           $(_liDom).addClass("active");
        }
        _domArr.push('<div class="trans-en">');
        _domArr.push('<div class="sign clearfix">');
        _domArr.push('<div class="gather circle fl"></div>');
        _domArr.push('<span class="dur-time fl">'+_item.sTime+'</span>');
        if(_item.baseSubtitleItem){
          _item.baseSubtitleItem.autoCaption === 1 ? _domArr.push('<div class="gather auto fl"></div>') : _domArr.push("");
          _domArr.push('</div>');
          _domArr.push('<a href="javascript:void(0);" data-index="'+(_index-1)+'" data-pindex = "'+_pindex+'" class="en-txt">'+_item.baseSubtitleItem.content+'</a>');
          _domArr.push('<textarea class="en-area" data-index="'+(_index-1)+'"data-pindex = "'+_pindex+'"  autofocus="autofocus"></textarea>');
          _domArr.push('</div>');
        }else{
          _domArr.push('</div>');
          _domArr.push('<a href="javascript:void(0);" data-index="'+(_index-1)+'" data-pindex = "'+_pindex+'" class="en-txt"></a>');
          _domArr.push('<textarea class="en-area" data-index="'+(_index-1)+'" data-pindex = "'+_pindex+'"  autofocus="autofocus"></textarea>');
          _domArr.push('</div>');
        }
        _domArr.push('<div class="trans-ch"><div class="sign clearfix">');
        _domArr.push('<div class="gather circle fl"></div>');
        if(_item.extSubtitleItem) {
          _item.extSubtitleItem.isDifficult === 2 ? _domArr.push('<div class="gather square fl"></div>') : _domArr.push("");
          _domArr.push('</div>');
          _domArr.push('<textarea tabindex="'+ (_index) +'" autofocus="autofocus" name="' + (_index) + '" data-index = "' + (_index-1) + '" data-pindex = "'+_pindex+'" class="ch-area">' + _item.extSubtitleItem.content + '</textarea>');
          _domArr.push("</div>");
        } else {
          _domArr.push('</div>');
          _domArr.push('<textarea tabindex="'+ (_index) +'" autofocus="autofocus" name="' + (_index) + '" data-index = "' + (_index-1) + '" data-pindex = "'+_pindex+'" class="ch-area"></textarea>');
          _domArr.push("</div>");
        }
        
        $(_liDom).html(_domArr.join(""));
        this.ulDom.append(_liDom);
        _pindex++;
       }
       this.container.html(this.ulDom);
       this.liDomList = this.container.find("li");
       this.container.mCustomScrollbar({
          theme:"my-theme"
        });
    },
    postData : function(version,newSubtitle){
        if(!version || !newSubtitle || newSubtitle.length === 0){
            return;
        }
        var url = "";
        var _params = {};
        _params.token = this.params.token;
        _params.username = this.params.username;
        _params.videoId = this.params.videoId;
        _params.version = version;
        _params.newSubtitle = JSON.stringify(newSubtitle);
        var _self = this;
        $.ajax({
         url:'http://m.huaeros.com:8080/d/mooc/SyncSubtitle.json',
         data:_params,
         type:"GET",
         dataType:"json",
         success:function(data){
           if(data.result.result){
               console.log(data);
               _self.resetSubTitleItems(data);
           }else{
              if(this.options && this.options.errorFun){
                 this.options.errorFun(data.result);
              }else{
                 alert("登录失效，请重新扫码登录");
              }
           }
         },
         error:function(data){
           console.log("error");
         }
       });
        
    },
    saveSubtitle : function(newSubtitle,_index){
       this.newSubtitle.push(newSubtitle);
       if(parseInt(newSubtitle.historyType) === 1){
          this.data.subtitleItems[_index].baseSubtitleItem = newSubtitle;
       }else{
          this.data.subtitleItems[_index].extSubtitleItem =  newSubtitle;
       }
       this.data.subtitleItems[_index].version = this.data.version;
       LocalStorage.setItem(this.storeKey,JSON.stringify(this.data));
       var _version = this.data.version;
       this.postData(_version,this.newSubtitle);
       this.newSubtitle = [];
    },
    //用户提交成功之后，重置信息
    resetSubTitleItems : function(data){
       this.data.version = data.subtitle.version;
       this.version = this.data.version;
       if(data.subtitle.subtitleItems.length > 0){
          var _subtitleItems = data.subtitle.subtitleItems;
          this.checkLocalData(data.subtitle);
        }
        LocalStorage.setItem(this.storeKey,JSON.stringify(this.data));
    },
    resetOption : function(){
       this.changeCurItem(0);
    }
};
var contentControl = {
     init : function(videoPlayer,subtitle){
         this.getUserInfo();
         this.showUserInfo();
         var _self = this;
         var playerOption = {
           onStartPlay:null,
           onEnd:function(){
              subtitle.resetOption();
           },
           onError:null,
           onDataError:null,
           onPause:null,
           onDataok : function(data){
              _self.videoData = data;
              _self.videoOk = true;
              _self.showVideoInfo(_self.videoData);
              if(_self.subTitleOK){
                 _self.hideLoadNote();
              }
           },
           onUpdate:function(time){
              subtitle.changByTime(time);
           },
           userInfo:this.userInfo,
           videoId : this.videoId
         };
         videoPlayer.init("video_container",playerOption);
         
         /*初始化字幕信息*/
         var subTitleOption = {
           errorFun : function(){
              _self.showErrorNote();
           },
           onDataok : function(){
              _self.subTitleOK = true;
              if(_self.videoOk){
                 _self.hideLoadNote();
              }
           },
           userInfo : this.userInfo,
           videoId : this.videoId
         };
        subtitle.init("js_tranList",subTitleOption);

        /*获取课程信息*/
        this.getCourseData();

     },
     showLoadNote : function(){
         $("#js_mask").show();
         $("#js_note").show();
     },
     hideLoadNote : function(){
         $("#js_mask").hide();
         $("#js_note").hide();
     },
     // 接口获取失败提示处理
     showErrorNote : function(msg){
        this.hideLoadNote();
        msg = msg ? msg : "登陆状态失效，请重新扫描二维码进行登录";
        var _loginurl = "http://t.yxgapp.com/d/mooc/webClient/login.html";//上线的时候需要改动
        $("#js_mask").show();
        var btn = $("#js_note .layui-layer-btn0");
        var _conten = $("#js_note .layui-layer-content").html(msg);
        btn.html("前往扫描二维码");
        btn.attr("href",_loginurl);
        $("#js_note .layui-layer-btn").show();
        $("#js_note").show();
    },
    showUserInfo : function(data){
        $("#js_userpic").attr("src",this.userInfo.avatarUrl);
        $("#js_nickname").html(this.userInfo.nickname);
    },
    /*获取课程详细信息*/
    getCourseData : function(){
       var _params = {};
       _params.username = this.userInfo.username;
       _params.token = this.userInfo.token;
       _params.courseId = this.courseId;
       _params.command="command_detail";
       var _self = this;
       $.ajax({
         url:"http://m.yxgapp.com/d/mooc/PutOpenCourseRecord.json",
         data:_params,
         type:"GET",
         dataType:"json",
         success : function(data){
            _self.showCourseInfo(data);
         },
         error:function(data){
      
         }
       });
    },
    showCourseInfo:function(data){
        if(!data.result.result){
           this.showErrorNote();
        }else{
          this.courseData = data.data;
          if(this.courseData.videoNumber  > 1){
            $("#js_coursetitle").html(this.courseData.name);
          }else{
            $("#js_coursetitle").html(this.courseData.enName);
          }
          this.showUniversity();
        }
    },
    showUniversity : function(){
      if(this.courseData.joinNumber){
        $("#js_joinCount").html(this.courseData.joinNumber+"次");
      }
      if(!this.courseData.university && !this.courseData.authors){
         $("#js_courseInfo").hide();
      }else{
         if(this.courseData.university){
            var img = document.createElement("img");
            $(img).attr("src",this.courseData.university.iconUrl);
            var span = document.createElement("span");
            $(span).html(this.courseData.university.name);
            var _unit = $("#js_courseinfo .unit");
            _unit.append(img);
            _unit.append(span);
         }
         if(this.courseData.authors.length > 0){
           var _author = this.courseData.authors[0];
           var _techimg = document.createElement("img");
           $(_techimg).attr("src", _author.iconUrl);
           var teacherInfo = document.createElement("div");
           $(teacherInfo).attr("class","teacher-info");
           $(teacherInfo).html('<div class="name">'+_author.name+'</div><div class="rank">'+_author.jobTitle+'</div>');
           var techDom = $("#js_courseinfo .teacher");
           techDom.append(_techimg);
           techDom.append(teacherInfo);
           
         }
      }
    },
    /**
     * 显示该视频相关的数据 视频标题 翻译情况等
     * @return {[type]} [description]
     */
    showVideoInfo : function(data){
         $("#js_videotitle").html(data.name);
         var transInfo = data.translateInfo,
             allNum = transInfo.allTranslateSentencesNumber,
             baseNum = transInfo.baseSentencesNumber,
             ratio = (allNum/baseNum * 100).toFixed(0);
         $("#js_progress").html(ratio+"%");
         $("#js_total").html(baseNum+"句");
    },
    /*从cookie中获取二维码扫描页面中拿到的数据*/
    getUserInfo : function(){
        this.userInfo = {};
        this.userInfo.username = Cookie.get("userId");
        this.userInfo.token = Cookie.get("token");
        this.courseId = Cookie.get("courseId");
        this.videoId = Cookie.get("videoId");
        this.userInfo.nickname = Cookie.get("nickname");
        this.userInfo.avatarUrl = Cookie.get("avatarUrl");
    }

};
window.onload = function(){
   contentControl.showLoadNote();
   contentControl.init(videoPlayer,subtitle);
};
})($);