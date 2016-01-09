(function($){
    $.extend($.fn, {
        xAutocomplete: function(opts){
            opts = $.extend({}, 
                {  
                    node: null,
                    delay: 0,
                    param: null,
                    source: null,
                    onchange: null,
                    onselect: null,
                    width: null,
                    fixed: {
                        x: 0,
                        y: 0
                    },
                    extSource: ["示例"],
                    extBtn: null
                }, opts);

            var keys = { 
                RETURN: 13, 
                BACKSPACE: 8, 
                SPACE: 32,
                UP: 38,
                DOWN: 40,
                ESC: 27
            };

            var self = this,
                cacheData = {},
                currentData = [],
                lastKeyPress = null,
                lastSelectedValue = null,
                active = false,//当有自动完成的值时
                local = $.isArray(opts.source),
                mouseInSelect = false,
                timeOutActive = null,
                format = null,
                lastProcessValue = null,
                menuContainer = null,
                node = opts.node,
                delay = opts.delay,
                extBtn = opts.extBtn,
                extEvent = false;

            var init = function(){
                    //bind event
                    node.bind('keydownEvent', function(e, event){
                        _keydownEvent.apply(self, [event]);
                    }).bind('blurEvent', function(){
                        _blurEvent.apply(self);
                    }).attr('autocomplete', 'off');
                    //trigger event
                    node.keyup(function(e){
                        node.trigger('keydownEvent', [e]);
                    }).blur(function(e){
                        node.trigger('blurEvent');
                    });
                    if(extBtn != null){
                        extBtn.bind('click', function(e){
                            $(this).find('.ico').hide();
                            var hotNewTime = new Date().getTime();
                            cookie.set('__hotNewNum_', hotNewTime);
                            extEvent = true;
                            if(active){
                                _blurEvent();
                            }
                            else{
                                activeAutoComplete();
                                $(this).addClass('hot-act');
                            }
                            e.preventDefault();
                            e.stopPropagation();
                        });
                    }
                    $('body').bind('click',_blurEvent);
                },
                dealData = function(data){
                    return data;
                },
                isResult = function(data){
                    return data.length;
                },
                destroy = function(){
                    node.unbind('keydownEvent').unbind('blurEvent').removeAttr('autocomplete');
                },
                _keydownEvent = function(e){
                    extEvent = false;
                    //var self = this;
                    lastKeyPress = e.keyCode;
                    switch (lastKeyPress) {
                        case keys.UP:
                            e.preventDefault();
                            if (active) {
                                focusPrev();
                            }
                            break;
                        case keys.DOWN:
                            e.preventDefault();
                            if (active) {
                                focusNext();
                            }
                            else {
                                activeAutoComplete();
                            }
                            break;
                        case keys.RETURN:
                            e.preventDefault();
                            if(active) {
                                selectCurrent();
                                return false;
                            }
                            break;
                        case keys.ESC:
                            //esc
                            e.preventDefault();
                            if(active) {
                                finish();
                            }
                            break;
                        default:
                            activeAutoComplete();
                    }
                },
                _blurEvent = function(){
                    if(!mouseInSelect){
                        finish();
                        extBtn.removeClass('hot-act');
                    }

                },
                activeAutoComplete = function(){
                    if(timeOutActive){
                        clearTimeout(timeOutActive);
                    }
                    if(delay && !local){
                        timeOutActive = setTimeout(function(){
                            activeNow();
                        }, delay);
                    }
                    else {
                        activeNow();
                    }
                },
                activeNow = function(){
                    var value = $.trim(node.val());
                    /*if (value.length < 1) {
                        finish();
                        lastProcessValue = null;
                        return;
                    }*/
                    if (value != lastSelectedValue) {
                        lastProcessValue = value;
                        //getData(value);
                    }
                    getData(value);
                },
                finish = function(){
                    active = false;
                    menuContainer && menuContainer.hide();
                },
                getData = function(value){
                    if (typeof opts.source == 'string'){
                        if(extEvent){
                            parseData(opts.extSource);
                        }
                        else{
                            var sendData = {}, 
                                name = opts.param ? opts.param : node.attr('name');
                            sendData[name] = lastProcessValue;
                            $.ajax({
                                url: opts.source,
                                data: sendData,
                                dataType: 'json',
                                success: function(r){
                                    currentData = eval(r);
                                    setCache(value, r);
                                    parseData(currentData)
                                }
                            });
                        }
                    }
                },
                filterData = function(data, val){
                    var newArr = [];
                    $.each(data, function(i, n){
                        var reg = new RegExp(val, 'gi');
                        if (n.label) {
                            if (reg.test(n.label) || reg.test(n.value)) {
                                newArr.push(n);
                            }
                        }
                        else {
                            if (reg.test(n)) {
                                newArr.push(n);
                            }
                        }
                    });
                    return newArr;
                },
                parseData = function(data){
                    if(isResult(data)){
                        active = true;
                        createDom();
                        var data = dealData(data)
                        renderMenu(data, lastProcessValue);
                        position();
                    }
                    else{
                        finish();
                    }
                },
                createDom = function(){
                    if (menuContainer) {
                        return;
                    }
                    else {
                        var div = $('<div/>').addClass('autocomplete-container'), ul = $('<ul/>');
                        menuContainer = div;
                        menuContainer.append(ul);
                        menuContainer.appendTo(document.body);
                        ul.delegate('li', 'mouseover', function(){
                            $(this).addClass('autocomplete-hover').siblings().removeClass('autocomplete-hover');
                            mouseInSelect = true;
                            var val = $('li.autocomplete-hover',menuContainer).data('value');
                            //node.val(val);                            
                        }).delegate('li', 'mouseout', function(){
                            mouseInSelect = false;
                        }).delegate('li', 'click', function(){
                            lastSelectValue = $(this).data('value');
                            mouseInSelect = false;
                            finish();
                            node.val(lastSelectValue).focus();
                            $(node).parents('form').submit();
                        });
                        menuContainer.click(function(){return false;});
                    }
                },
                renderMenu = function(data, value){
                    var ul = menuContainer.find('ul');
                    ul.empty();
                    $.each(data, function(i, item){
                        if (!extEvent) {
                            var li = $('<li/>').data('value', item.title);
                                item.title = item.title.replace(value, '<b class="imp">' + value + '</b>');
                                li.html('<a href="'+item.url+'" target="_blank">'+item.title+'</a>');
                        }
                        else {
                            var key = item.split('|')[0];
                            var isnew = item.split('|')[1];
                            var li = $('<li/>').data('value', key);
                                li.html('<i class="auto-raq auto-'+(i+1)+'">'+(i+1)+'</i><i class="auto-key">'+key+'</i><i class="isnew-'+isnew+'"></i>');
                        }
                        ul.append(li);
                        ul.find('a').click(function(e){
                            e.stopPropagation();
                        });
                    });
                    menuContainer.show();
                },
                position = function(){
                    menuContainer.css('position', 'absolute');
                    var offset = node.offset(), 
                        height = node.outerHeight(), 
                        width = node.width();
                    if(opts.width != null){ width = opts.width}
                    menuContainer.css({
                        top: offset.top + height + opts.fixed.y,
                        left: offset.left + opts.fixed.x,
                        width: width
                    });
                },
                //读取缓存
                getCache = function(value){
                    return cacheData[value];
                },
                setCache = function(value, data){
                    if (cacheData.length && cacheData.length > 10) {
                        cacheData = {};
                        cacheData.length = 0;
                    }
                    cacheData[value] = data;
                    cacheData.length++;
                },
                //移动选中
                focus = function(index){
                    var items = $('li', menuContainer), hasSelect = false;
                    if (items.length) {
                        for (var i = 0; i < items.length; i++) {
                            if (items.eq(i).hasClass('autocomplete-hover')) {
                                selectItem(i + index);
                                hasSelect = true;
                                return;
                            }
                        }
                        if (!hasSelect) {
                            selectItem(0);
                        }
                    }
                },
                focusNext = function(){
                    focus(1);
                },
                focusPrev = function(){
                    focus(-1);
                },
                selectItem = function(index){
                    var items = $('li', menuContainer);
                        index = index < 0 ? items.length - 1 : index;
                    index = index == items.length ? 0 : index;
                    items.removeClass('autocomplete-hover');
                    items.eq(index).addClass('autocomplete-hover');
                    var val = $('li.autocomplete-hover', menuContainer).data('value');
                    node.val(val);
                    if (lastSelectedValue && !lastSelectedValue != val) {
                        if(opts.onchange)
                            opts.onchange(val);
                    }
                    lastSelectedValue = val;
                },
                selectCurrent = function(){
                    var val = $('li.autocomplete-hover',menuContainer).data('value');
                    //node.val(val);
                    lastSelectValue = val;
                    if(opts.onselect){
                        onselect(val);
                    }
                    finish();
                };

            init();
        }
    });

})(jQuery);