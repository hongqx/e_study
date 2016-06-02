function getData(url,data,successFn,errorFn){
    $.ajax({
        url:url,
        data:data,
        dataType:"json",
        success:function(data){
           successFn(data);
        },
        error:function(){
            errorFn();
        },
        complete:function(data){
            console.log(data);
        }

    });
}
var url = "http://m.yxgapp.com/d/mooc/GetCourseDetail.json";
var params = {
    username:username,
    token:token,
    courseId:courseId

};
var videoUrl = "http://m.yxgapp.com/d/mooc/SyncSubtitle.json";
var videoParams = {
    username:username,
    token:token
};
function videoSuccessFn(data){
    window.videoData = data;
    var params ={
        username:username,
        token:token,
        videoId:''
    };
}
function successFn(data){
  window.data = data;
  var _videoId = data.data.unitList[0].videoList[0].id;
  videoParams.videoId = _videoId;
  videoParams.version = -1;
  getData(videoUrl,videoParams,function(data){
    window.videoData = data;
  },function(){
    console.log(error);
  });
  console.log("the data："+data);
}
function errorFn(){
    console.log("error");
}
getData(url,params,successFn,errorFn);
