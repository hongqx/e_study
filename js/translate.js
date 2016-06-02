(function($){
	"use strict";
	//视频下方渲染
	var detail = {
		//interface_Detail: 'http://m.yxgapp.com/d/mooc/GetCourseDetail.json',//username,token,courseId
		interface_Detail: 'http://m.yxgapp.com/d/mooc/GetCourse.json',
		init: function(){
			var pramas = { 
				"model":"Course", 
				"fields":[ 
					"id",
					"name",
					"language",
					"subtitle",
					"platform",
					"durationHour",
					"durationWeek",
					"coverUrl",
					"previewVideoUrl",
					"previewCoverVideoUrl"
					 ], 
				"sort":[ 
					{ "name":"desc" } ], 
				"offset":0, 
				"count":50, 
				"relations":[ { 
					"model":"University", 
					"fieldName":"university", 
					"fields":[] },
					{ "model":"Author[]", 
					"fieldName":"authorList", 
					"fields":[]} 
				] 
			};
			var str = JSON.stringify(pramas);
			$.ajax({
				type: 'GET',
				url: detail.interface_Detail,
				dataType: 'json',
				data: {
					id: 989,
					command:str,
				},
				success:detail.generate
			});
		},
		generate: function(json){
			if(json.result.result){
				$('#classification').text(json.data.classification);
				$('#partName').text(json.data.name);
				var university = json.data.university;
				if(university.length != 0){
					var universityHtml = [
						'<img src="'+university.iconUrl+'" />',
						'<span>'+university.name+'</span>'
					].join('');
				}else{
					var universityHtml = '';
				}
				
				var transInfo = json.data.translateInfo,
					allNum = transInfo.allTranslateSentencesNumber,
					baseNum = transInfo.baseSentencesNumber,
					ratio = (allNum/baseNum * 100).toFixed(1);
				var infoHtml = [
					'<div class="progress clearfix">',
						'<div class="gather circle fl"></div>',
						'<div class="data fl">'+ratio+'%</div>',
					'</div>',
					'<div class="sentence">',
						'<div class="gather circle fl"></div>',
						'<div class="data fl">'+transInfo.baseSentencesNumber+'句</div>',
					'</div>',
					'<div class="times">',
						'<div class="gather circle fl"></div>',
						'<div class="data fl">'+json.data.joinNumber+'次</div>',
					'</div>'
				].join('');
				
				var authors = json.data.authors;
				if(authors.length != 0){
					var authorsHtml = '';
					//for(var i = 0;i < authors.length;i++){
						var author = authors[0];
						authorsHtml += [
						'<div class="teacher">',
							'<img src="'+author.iconUrl+'" />',
							'<div class="teacher-info">',
								'<div class="name">'+author.jobTitle+'</div>',
								'<div class="rank">'+author.name+'</div>',
							'</div>',
						'</div>'
						].join('');
					//}
				}else{
					var authorsHtml = '';
				}
				$('.video-data').html(infoHtml);
				$('.unit').html(universityHtml);
				$('.teacher-wrap').html(authorsHtml);
			}else{
				alert(json.result.reason)
			}
		}
	};
	detail.init();

	//显示用户信息
	var userInfo = {
		interface: 'http://m.yxgapp.com/d/if/account.jhtml',
		init: function(){
			$.ajax({
				type: 'GET',
				url: userInfo.interface,
				dataType: 'json',
				data: {
					action: 'GetUserInfo',
					username: '15210582639',
					sign: 'd2c2e28f32cf6a07689edca727db0f7b1461478032857'
				},
				success:userInfo.generate
			});
		},
		generate: function(json){
			console.log(json)
			var userHtml;
			if(json.result.result){
				var user = json.user,
					name = user.nickname ? user.nickname : user.username;
				userHtml = [
					'<img class="portrait" src="'+user.avatarUrl+'"/>',
					'<span class="user-name">'+name+'</span>'
				]
			}else{
				alert(json.result.reason)
			}
			$('.user').html(userHtml);
		}
	};
	userInfo.init();
	//英文显示部分交互
	$('.en-txt').on('click',function(){
		var _this = $(this),
			val = _this.text();
		_this.hide();
		_this.siblings(".en-area").val(val).show().focus();
	});
	$('.en-area').on('blur',function(){
		var _this = $(this),
			val = _this.val();
		_this.hide();
		_this.siblings('.en-txt').text(val).show();
	});
	//自定义翻译部分滚动条
	$(window).load(function(){
        $(".trans-right").mCustomScrollbar({
        	theme:"my-theme"
        });
    });
})(jQuery) 