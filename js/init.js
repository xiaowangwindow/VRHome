var isNeeded = function(selectors){
    var selectors = (typeof selectors == 'string') ? [selectors] : selectors,
        isNeeded;
    for(var i=0;i<selectors.length;i++){
        var selector = selectors[i];
        if( $(selector).length > 0 ) { 
            isNeeded = true; 
            break; 
        }
    };
    return isNeeded ;
};

var cookie = {
    set:function(name,value,expires,path,domain){
        if(typeof expires=="undefined"){
            expires=365;
        }
        expires=new Date(new Date().getTime()+1000*3600*24*expires);
        document.cookie=name+"="+escape(value)+((expires)?"; expires="+expires.toGMTString():"")+((path)?"; path="+path:"; path=/")+((domain)?";domain="+domain:"");
        
    },
    get:function(name){
        var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
        if(arr!=null){
            return unescape(arr[2]);
        }
        return null;
    }
}

var dateFormat = function(format, times){
    var now = new Date(times);
    var o = {
        "M+" : now.getMonth()+1, //month 
        "d+" : now.getDate(), //day 
        "h+" : now.getHours(), //hour 
        "m+" : now.getMinutes(), //minute 
        "s+" : now.getSeconds(), //second 
        "q+" : Math.floor((now.getMonth()+3)/3), //quarter 
        "S" : now.getMilliseconds() //millisecond 
    }
    if(/(y+)/.test(format)) { 
        format = format.replace(RegExp.$1, (now.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    } 
    for(var k in o) { 
        if(new RegExp("("+ k +")").test(format)) { 
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
        } 
    } 
    return format; 
}

var ajaxSubmit = function(form, callback){
    var inp = $(form).find('input,select,textarea'),
        formData = {},
        url = $(form).attr('action'),
        postType = $(form).attr('method') || 'get';
    inp.each(function(){
        var type = $(this).prop('type'),
            name = $(this).attr('name');
        switch (type){
            case 'text':
            case 'password':
            case 'textarea':
            case 'file':
            default:
                formData[name] = $(this).val();
                break;
            case 'radio':
            case 'checkbox':
                formData[name] = $('input[name="' + name + '"]:checked').val();
                break;
            case 'select-one':
                formData[name] = $(this).find("option:selected").val();
                break;
            case 'select-multiple':
                formData[name] = $(this).find("option:selected").val();
                break;
        }
    });

    $.ajax({
        url: url,
        type: postType,
        data: formData,
        success: function(data){
            if(data == '' || data == undefined) return;
            callback(data);
        }
    });
}

var AddFavorite = function(sURL, sTitle){
    try{
        window.external.addFavorite(sURL, sTitle);
    }
    catch(e){
        try{
            window.sidebar.addPanel(sTitle, sURL, "");
        }
        catch(e){
            alert("您的浏览器暂不支持，加入收藏失败，请使用Ctrl+D进行添加！");
        }
    }
}
var _userID = '',
    _t = (new Date()/1),
    logined = false;
$(function(){
	$(".list-gotop").click(function(){
		$("html, body").animate({ scrollTop: 0 }, 120);	
	});
    $('.j-add-fav').click(function(e){
        var url = location.href,
            title = document.title;
        AddFavorite("http://skycn.com", "天空下载");
        return false;
    });
    $('.back').click(function(e){
        e.preventDefault();
        var href=decodeURIComponent(location.href);
        if(href.indexOf("from")==-1){
            var nowhref="http://skycn.com";
        }
        else{
            var nowhref=href.substring( href.indexOf("from")+5);
        }
        location.href=nowhref;
    });
    
    $('[dlcount]').on('click', function(e){
        e.preventDefault();
        var dlData = $.trim($(this).attr('dlcount')).split('|'),
            _sid = dlData[0];
        $.getScript("http://pvtest.zol.com.cn/images/skydown.gif?t="+new Date().getTime()+"&ip_ck="+cookie.get("ip_ck")+"&url="+window.location.href+"&sid="+_sid+"&area="+dlData[2],function(){});
        if (document.all) {
        	$(this).parent().append('<a href="'+$(this).attr("href")+'" id="_refer" style="display:none"></a>');
        	document.getElementById("_refer").click();
        	$("#_refer").detach();
        } else {
        	window.location.href=$(this).attr("href");
        }
    });
    
    $.fn.xPlaceholder();

    if(isNeeded('#j_search_form')){
        var hotUrl = '/Public/Home/Js/26.js?t='+new Date().getTime(),
            hotData = [];
        $.ajax(hotUrl, { 
            dataType: 'text', 
            success: function(data) {
                if(data == '') return;
                var num = 0;
                data = data.split(',');
                for(var i=0; i<data.length; i++){
                    if(data[i] != '') hotData.push(data[i]);
                    var numArr = data[i].split('|');
                    if(numArr[1] == 1) num++;
                }
                if(num==0){$('#j_auto_btn').find('.ico').hide();}
                $('#j_auto_btn').find('.ico').html(num); 
            } 
        });
        var _hotNew = cookie.get('__hotNewNum_');
        var nowTime = new Date().getTime(),
            lastTime = _hotNew == undefined ? nowTime - 3600000 : _hotNew;

        if(nowTime - lastTime >= 3600000){
            $('#j_auto_btn').find('.ico').show();
        }

        var key = $('#j_autocomplete'),
            form = $('#j_search_form');
        $.fn.xAutocomplete({
            node: key,
            source: PHP_HOME+'/s.php?ac=api',
            width: 350,
            fixed: {
                x: -1,
                y: 0
            },
            extBtn: $('#j_auto_btn'),
            extSource: hotData
        });
        form.submit(function(){
            if($.trim(key.val()) == ''){
                key.focus();
                return false;
            }else{
				  tracker&&tracker.send({title:key.val(),page:'hao123-skycn-search',pageId:'hao123-skycn-search',type:'submit'});
			}
        });
    }
    
    if(isNeeded('#j_idx_focus')){
        var obj = $('#j_idx_focus');
        $.fn.xTaber({
            content: obj,
            tab: obj,
            auto: true,
            style: 'left',
            prev: obj.find('.btn-prev'),
            next: obj.find('.btn-next')
        });
    }

    if(isNeeded('#j_btn_bag')){
        var bagBtn = $('#j_btn_bag'),
            bagOk = $('#j_btn_ok'),
            bagNo = $('#j_btn_no'),
            btnPar = $('#j_btn_no').parent(),
            bagTxt = btnPar.find('.txt');
        var getCurBag = function(){
            var cur = $('#j_bag_tab').find('.current'),
                catid = cur.attr('catid'),
                bagList = $('#j_bag_con').find('[rel="'+catid+'"]');
            return bagList;
        }

        var countDlNum = function(){
            var obj = getCurBag();
            var num = obj.find('.ico-selected').length;
            return num;
        }

        $('#j_bag_con').find('.ico').on('click', function(e){
            if($(this).hasClass('ico-selected')){
                $(this).removeClass('ico-selected').addClass('ico-select');
            }
            else{
                $(this).removeClass('ico-select').addClass('ico-selected');
            }
            var num = countDlNum();
            bagTxt.find('i').html(num);
            e.preventDefault();
            e.stopPropagation();
        });

        bagBtn.click(function(e){
            var bagList = getCurBag();
            var num = countDlNum();
            bagList.addClass('soft-list-dls').siblings().removeClass('soft-list-dls');
            btnPar.find('.btn').show();
            $(this).hide();
            bagTxt.html('批量下载<i>'+num+'</i>款软件');
            e.preventDefault();
        });

        bagOk.click(function(e){
            // todo
            var obj = getCurBag(),
                selPos = obj.find('.ico-selected');
            if(selPos.length == 0){
                alert('至少选择一个软件！');
                e.preventDefault();
                return;
            }
            selPos.each(function(){
                var singleDl = $(this).parents('li').find('.btn-soft-dl'),
                    url = singleDl.attr('href');
                if(url != undefined){
                    var dlData = $.trim($(this).attr('dlcount')).split('|'),
                    _sid = dlData[0];
	                $.getScript("http://pvtest.zol.com.cn/images/skydown.gif?t="+new Date().getTime()+"&ip_ck="+cookie.get("ip_ck")+"&url="+window.location.href+"&sid="+_sid+"&area="+dlData[2],function(){});
	                if (document.all) {
	                	$(this).parent().append('<a href="'+$(this).attr("href")+'" id="_refer" style="display:none"></a>');
	                	document.getElementById("_refer").click();
	                	$("#_refer").detach();
	                } else {
	                	window.location.href=$(this).attr("href");
	                }
                }
            });
            
            e.preventDefault();
        });

        bagNo.click(function(e){
            var bagList = getCurBag();
            $('#j_bag_con').find('ul').removeClass('soft-list-dls');
            btnPar.find('.btn').hide();
            bagTxt.html('可选择多款软件一键');
            bagBtn.show();
            e.preventDefault();
        });
    }

    $.fn.xHover({
        node: $('.j-hover-1').find('li')
    });

    $('.j-tab-comm').each(function(){
        var obj = $(this);
        $.fn.xTaber({
            content: obj,
            tab: obj,
            mouseEvent: 'click'
        });
    });

    if(isNeeded('#j_soft_desc')){
        var shorttxt = $('#j_soft_desc').find('.short-desc'),
            all = $('#j_soft_desc').find('.all-desc'),
            btn = $('#j_soft_desc').find('.short-btn');
        btn.click(function(e){
            shorttxt.hide();
            all.show();
            e.preventDefault();
        });
    }
    

    if(isNeeded('#j_cmt_form')){
        var cmtForm = $('#j_cmt_form'),
            cmtBtn = cmtForm.find('button'),
            cmtTxt = cmtForm.find('textarea');
            cmtForm.bind('submit', function(){
                if($.trim(cmtTxt.val()) == ''){
                	alert('评论不能为空,请填写内容!');
                    return false;
                }
                ajaxSubmit(cmtForm, function(data){
    				data = $.parseJSON(data);
    				cmtTxt.val('');
    				alert(data.msg);
                });
                return false;
            });
    }

//     if(isNeeded('#j_cmt_list')){
//        var softId = $('#softId').val(),
//            url = '/?m=comments&a=getSoftComment&softid='+softId,
//            page = 1,
//            ii = 0,
//            
//            getComStr = function(data){
//                var str = '';
//                var repayStr = '';
//                for(var i in data){
//                    var d = data[i];
//                    var repayStr = '';
//                    if(d.replay != null ){
//                        for(var j=0;j<d.replay.length;j++){
//                            repayStr += '<div class="cmt-reply"><p class="cmt-name"><span class="blue">'+d.replay[j].com_userid+'</span></p><p>'+d.replay[j].com_say+'</p><i></i></div>';
//                        
//                        }
//                    }
//                    str += '<li><div class="cmt-name"><span class="blue">'+d.com_userid+'</span><span class="cmt-date">'+d.com_date+'</span></div><div class="cmt-con clearfix"><p>'+d.com_say+'</p><span class="cmt-opt"><a href="javaScript:void(0);" rel="btn_reply" class="demo" cid="'+d.com_id+'">回复</a></span></div>'+repayStr+'</li>';
//                    ii++;
//                }
//                
//                return str;
//            }
//        $.getJSON(url, function(data){
//            if(data != null){
//            	var strr = '<ul class="cmt-list">';
//                strr += getComStr(data);
//                strr += '</ul>';
//                $('#j_cmt_list').html(strr);
//                if(ii < 10){
//                    $('.btn-more-cmt').hide();
//                }
//                Replay();
//
//            }
//            else{
//                $('#j_cmt_list').html('<div class="no-cmt">还没有相关评论，快来抢沙发吧。</div>');
//                $('#btn-more-cmt').hide();
//            }
//        });
//
//        if($('.btn-more-cmt').css('display') != 'none'){
//            $('.btn-more-cmt').find('.btn').click(function(e){
//                page = page+1;
//                $.getJSON(url+'&page='+page, function(data){
//                    if(data != null){
//                        var str2 = getComStr(data);
//	                    $('.cmt-list').append(str2);
//                    }
//                    else{
//                        $('.btn-more-cmt').hide();
//                    }
//                });
//                e.preventDefault();
//            });
//        }
//        
//        
//    }
    
	$('#j_cmt_list').on('click','a',function(e){
		var _slef = $(this),
		cid = _slef.attr('cid'),
		softId = $('#softId').val(),
		rePar = cid;
		if($('.cmt-reply-box').get(0)){
			$('.cmt-reply-box').remove();
		}
		
		if(_slef.attr('rel') == 'open'){
			_slef.attr('rel', 'close');
			e.preventDefault();
			return;
		}
		
		_slef.parents('li').append('<div class="cmt-reply-box"><form name="replycmt" method="post" action="/?m=comments&a=index" id="j_reply_cmt"><div class="cmt-text"><textarea name="content" maxlength="200"></textarea></div><input type="hidden" name="contentid" value="'+rePar+'"><input type="hidden" name="softId" id="softId" value="'+softId+'"><input type="hidden" name="replayId" id="replayId" value="'+rePar+'"><div class="cmt-btn"><button type="submit">发表评论</button></div></form></div>');
		// 状态判断
		_slef.attr('rel', 'open');
		
		var cmtReplyForm = $('#j_reply_cmt'),
		cmtReTxt = cmtReplyForm.find('textarea');
		
		cmtReplyForm.focus();
		
		cmtReplyForm.on('submit', function(){
			if($.trim(cmtReTxt.val()) == ''){
				alert('回复不能为空,请填写内容!');
				return false;
			}
			ajaxSubmit(cmtReplyForm, function(data){
				data = $.parseJSON(data);
				$('.cmt-reply-box').remove();
				alert(data.msg);
			});
			return false;
		});
		e.preventDefault();
	});
});