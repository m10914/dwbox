/*
	DWBOX
	by Damon Wall (c) 2012
	
	flexible, light-weight and simple alternative to fancybox
	
	
	! WARNING ---------------------------------------------------------------------!
	!
	!    this plugin designed for programmers use only, not for shitcoders, they
	!	 won't figure out how to use this one anyway
	!
	! ---------------------------------------------------------------------------- !
	
	req. jQuery 1.8+
 
	---------------------------------------------------------------------------------------
	how to use:

	1st way. Apply this function to any links: dwbox.hrefs($('a'));
	2nd way. Add to a (or any other element) onclick="dwbox.load(path_to_your_resourse);"
 
	as a href of path_to_resource there can be 4 ways:
	
	1. jquery-selector, as: dwbox.load($('div#selector'));
	2. selector, as dwbox.load('div#selector');
	3. path to pic (png,jpg,jpeg,gif): dwbox.load('img.fancy');
	4. path to document (php,html,js,css) dwbox.load('/include_areas/script.php');
	
	Configuring behavior:
	under the label "USER PARAMETERS" there are some parameters, which can be modifyed
	
	Modifying appearance:
	in dwbox.js there is a function under the label INIT, in which there is an CSS and HTML block,
	which can be modified in any way you want
	
	---------------------------------------------------------------------------------------
	
*/


dwbox = {};


// USER PARAMETERS -

	dwbox.closeOnOverlayClick = true; //to close dwbox on overlay click
	dwbox.alwaysCenter = true; //to center dwbox automatically
	dwbox.backgroundSrc = '/images/black80.png'; //background image source

// ----------------


//system parameters
dwbox.scroll = {};
dwbox.size = {};
dwbox.over = false;

//
// INIT
//
$(document).ready(function(){

	// CSS
	$('body').append("<style type='text/css'>\
		div.dwbox_overlay {\
		position: fixed;\
		top: 0;\
		left: 0;\
		bottom: 0;\
		right: 0;\
		background-image: url("+dwbox.backgroundSrc+");\
		z-index: 1100;\
		display: block;\
	}\
	div.dwbox_wrap {\
		position: absolute;\
		margin: 0px;\
		padding: 0px;\
		z-index: 1101;\
		width: auto;\
		height: auto;\
		display: block;\
	}\
	</style>");
	
	// HTML
	$('body').append('\
		<div class="dwbox_overlay" style="display: none;">\
			<div class="dwbox_wrap">\
			</div>\
		</div>\
	');
	
	
	// BEHAVIOR
	$('div.dwbox_wrap').mouseover(function(){
		dwbox.over = true;
	});
	$('div.dwbox_wrap').mouseout(function(){
		dwbox.over = false;
	});
	
	//overlay click
	$('div.dwbox_overlay').click(function(){
		if(dwbox.over == false && dwbox.closeOnOverlayClick == true)
			dwbox.close();
	});
	
	//closebtn_click
	
	
	dwbox.scroll = { x:window.scrollX, y:window.scrollY };
	dwbox.size = { width:$(window).width(), height: $(window).height() };
		
});

//upd
$(window).scroll(function(){
	dwbox.scroll = { x:window.scrollX, y:window.scrollY };
	dwbox.adjust();
});
$(window).resize(function(){
	dwbox.size = { width:$(window).width(), height: $(window).height() };
	dwbox.adjust();
});


//adjust placement of window on the screen
dwbox.adjust = function(){
	//positionate center
	if(dwbox.alwaysCenter == true)
	{
		var curw = $('div.dwbox_wrap').width();
		var curh = $('div.dwbox_wrap').height();
		
		var offset_x = (dwbox.size.width - curw)*0.5;
		if(offset_x < 0) offset_x = 0;
		if(dwbox.scroll.x > 0) offset_x += dwbox.scroll.x;
		
		var offset_y = (dwbox.size.height - curh)*0.5;
		if(offset_y < 0) offset_y = 0;
		//if(dwbox.scroll.y > 0) offset_y += dwbox.scroll.y;
		
		$('div.dwbox_wrap').css('left',offset_x+'px').css('top',offset_y+'px');
	}
};

//opens dwbox overlay
dwbox.open = function(){	
	$('div.dwbox_overlay').show();
	dwbox.adjust();
};
//close dwbox
dwbox.close = function(){
	$('div.dwbox_overlay').hide();
};

dwbox.load = function(obj){

	if(typeof(obj) == 'object') //assume it's already loaded object
	{
		var contents = jQuery(obj).eq(0).clone();
		$('div.dwbox_wrap').html('').append(contents);
		
		dwbox.open();
	}
	else if(typeof(obj) == 'string' &&
		( RegExp('\.png','i').test(obj) || RegExp('\.jpg','i').test(obj) || RegExp('\.jpeg','i').test(obj) || RegExp('\.gif','i').test(obj))
		) //assume it's image or other single stuff
	{
		var contents = '<img src="'+obj+'">'
		$('div.dwbox_wrap').html('').append(contents);
		
		dwbox.open();
	}
	else if(typeof(obj) == 'string' &&
		( RegExp('\.php','i').test(obj) || RegExp('\.html','i').test(obj) || RegExp('\.css','i').test(obj) || RegExp('\.js','i').test(obj))
		) //assume it's url
	{
		$.ajax({
			type: "POST",
			url: obj,
			success: function(html) {
					$('div.dwbox_wrap').html('').append(html);
					
					dwbox.open();	
				}
			});
	}
	else //assume it's jquery selector
	{
		var contents = jQuery(obj).eq(0).clone();
		$('div.dwbox_wrap').html('').append(contents);
		
		dwbox.open();
	}
};

//in obj = jQuery selector
dwbox.hrefs = function(obj){

	if(typeof(obj) == 'object')
	{
		obj.getClass = {}.toString;
		var cls = obj.getClass();
		if(cls == "[object Object]")
		{
			obj.each(function(){
				if($(this).is('a'))
				{
					//transform
					$(this).click(function(){
						dwbox.load($(this).attr('href'));
						return false;
					});
				}
			});
		}
	}
};

