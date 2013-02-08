/*
	DWBOX
	by Damon Wall (c) 2012-2013
	
	flexible, light-weight and simple alternative to fancybox (which gone commercial recently)
	
	req. jQuery 1.8+
	
	
	! WARNING ---------------------------------------------------------------------!
	!
	!    this plugin designed for programmers use only, not for some shitcoders, they
	!	 won't figure out how to use this one anyway, so it's safe =)
	!
	! ---------------------------------------------------------------------------- !
	
	
	---------------------------------------------------------------------------------------
	HOW TO USE:

	1st way. Apply this function to any links: dwbox.hrefs($('a'));
	2nd way. Add to a (or any other element) onclick="dwbox.load(path_to_your_resourse);"
 
	as a href of path_to_resource there can be 4 ways:
	
	1. jquery-selector, as: dwbox.load($('div#selector'));
	2. selector, as dwbox.load('div#selector');
	3. path to pic (png,jpg,jpeg,gif): dwbox.load('/images/path_to_pic.png');
	4. path to pics, separated by ',' or ';': dwbox.load('/images/pic1.png','/images/pic2.png');
	5. path to document (php,html,js,css) dwbox.load('/include_areas/script.php');
	
	
	----------------------------------------------------------------------------------------
	GALLERIES support:
	
	Dwbox supports galleries in it's usual way. There are 3 easy ways to create a gallery:
	
	1. Set dwbox.load('pic1.jpg;pic2.jpg;pic3.jpg');
	2. Set dwbox.hrefs('a#dwbox') on contructions like <a href='path_to_pic1.png' rel='gallery'>pushme!</a>
		if the attribute 'rel' of <a>-tags will be the same, dwbox will create the gallery out of them.
		! It can be not only path_to_pic, but also a jQuery-selector, like div#mydiv1. !
	3. Set dwbox.load('div#mydiv') or dwbox.load($('div#mydiv'));
		if <div id="mydiv" rel="gallery">...</div> have tag rel, dwbox will create gallery from this div and other
		elements of the page, which have the same rel attribute.
	
	----------------------------------------------------------------------------------------
	LOADING status
	
	When dwbox manages the a picture gallery, it's using loading screen, which can be customized through
	this parameters:
	
	dwbox.loadingSrc = '/images/loader.gif';
	dwbox.loadingWidth = 90;
	dwbox.loadingHeight = 90;
	dwbox.loadingBackgroundColor = '#e7ebee';
	
	----------------------------------------------------------------------------------------
	CUSTOMIZATION of look
	
	Also we have a headerHTML and footerHTML parameters, which can be set to any html code you want.
	It's sometimes crucial to do some javascript on every slide, so you can reload
		dwbox.onChangeSlide
	
	In this function on html-code you might find useful to use parameters and functions:
	
	dwbox.curslide - current number of slide in gallery (starting with 0)
	dwbox.gallery - array of current gallery
	dwbox.over - boolean value, shows if the mouse is over the fancybox
	
	dwbox.close(); - close dwbox
	dwbox.load() - see the manual up the page
	dwbox.next()
	dwbox.prev() - navigation through the gallery
	dwbox.hrefs() - see the manual up the page
	
	
	Configuring behavior:
	under the label "USER PARAMETERS" there are some parameters, which can be modifyed
	
	Modifying appearance:
	in dwbox.js there is a function under the label INIT, in which there is an CSS and HTML block,
	which can be modified in any way you want
	
	---------------------------------------------------------------------------------------
	
*/


dwbox = {};


//  U S E R    P A R A M E T E R S  -

	dwbox.closeOnOverlayClick = true; //to close dwbox on overlay click
	dwbox.backgroundSrc = '/images/black40.png'; //background image source
	
	dwbox.resizeImageToFitTheScreen = true;
	
	dwbox.loadingSrc = '/images/loader.gif';
	dwbox.loadingWidth = 90;
	dwbox.loadingHeight = 90;
	dwbox.loadingBackgroundColor = '#e7ebee';
	
	dwbox.headerHTML = "";
	dwbox.footerHTML = "";
	
	dwbox.onChangeSlide = function(){};
	
	
// ----------------


//system parameters
dwbox.scroll = {};
dwbox.size = {};
dwbox.over = false;

dwbox.gallery = [];
dwbox.curslide = 0;

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
		background-color: white;\
		position: absolute;\
		margin: 0px;\
		padding: 0px;\
		z-index: 1101;\
		width: auto;\
		height: auto;\
		display: block;\
	}\
	div.dwbox_wrap.loading {\
		background-image: url("+dwbox.loadingSrc+");\
		background-position: 50% 50%;\
		background-repeat: no-repeat;\
		overflow:hidden;\
		padding-right:"+dwbox.loadingWidth+"px;\
		padding-top:"+dwbox.loadingHeight+"px;\
		border-radius: 7px;\
		background-color:"+dwbox.loadingBackgroundColor+"\
	}\
	</style>");
	
	// HTML
	$('body').append('\
		<div class="dwbox_overlay" style="display: none;">\
			<div class="dwbox_wrap">\
			</div>\
		</div>\
	');
		
//----------------------------------------------------------------------------------	
// L O G I C
//
	
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
	
	
	dwbox.scroll = { x:$(window).scrollLeft(), y:$(window).scrollTop() };
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


// setloading block
// for loading pictures specially
// if picture is loaded, it calls for stoploading() function
dwbox.setloading = function(){
	$('div.dwbox_wrap').addClass('loading');
	
	$('div.dwbox_wrap').css('width','0px').css('height','0px');
	
	dwbox.adjust();
}
dwbox.stoploading = function(){

	if(!$('div.dwbox_wrap').hasClass('loading')) return;
		
	$('div.dwbox_wrap').removeClass('loading');
	$('div.dwbox_wrap').css('width','auto').css('height','auto');
	
	//resize images
	if(dwbox.resizeImageToFitTheScreen == true)
	{
		var images = $('div.dwbox_wrap img').toArray();
		for(var i=0; i < images.length; i++)
		{
			var iw = $(images[i]).width();
			var ih = $(images[i]).height();
			var nw = iw;
			var nh = ih;
			
			if(nw > dwbox.size.width-20)
			{
				nw = dwbox.size.width-20;
				nh = nw*ih/iw;
			}

			if(nh > dwbox.size.height-20)
			{
				nh = dwbox.size.height-20;
				nw = nh*iw/ih;
			}

			
			$(images[i]).css('width',nw+'px').css('height',nh+'px');
		}
	}
	
	dwbox.adjust();

}

//adjust placement of window on the screen
dwbox.adjust = function(){

	//positionate center
	var curw = $('div.dwbox_wrap').width();
	var curh = $('div.dwbox_wrap').height();
				
	if($('div.dwbox_wrap').hasClass('loading'))
	{
		curw += dwbox.loadingWidth;
		curh += dwbox.loadingHeight;
	}
	
	var offset_x = (dwbox.size.width - curw)*0.5;
	if(offset_x < 0) offset_x = 0;
	if(dwbox.scroll.x > 0) offset_x += dwbox.scroll.x;
	
	var offset_y = (dwbox.size.height - curh)*0.5;
	if(offset_y < 0) offset_y = 0;
	if(curh > dwbox.size.height) offset_y -= dwbox.scroll.y-20;
	
	$('div.dwbox_wrap').css('left',offset_x+'px').css('top',offset_y+'px');
	
};

//opens dwbox overlay
dwbox.open = function(){	
	$('div.dwbox_overlay').show();
	dwbox.adjust();
};

//close dwbox
dwbox.close = function(){
	$('div.dwbox_overlay').hide();
	dwbox.gallery = [];
};

//loadnext
dwbox.next = function(){
	if(dwbox.curslide < dwbox.gallery.length-1)
	{
		dwbox.curslide++;
		dwbox.load(dwbox.gallery[dwbox.curslide],false);
	}
}

//loadprev
dwbox.prev = function(){
	if(dwbox.curslide > 0)
	{
		dwbox.curslide--;
		dwbox.load(dwbox.gallery[dwbox.curslide],false);
	}
}

dwbox.load = function(obj, initgallery){
		
	if(typeof(obj) == 'object') //assume it's already loaded object
	{
		if($(obj).is('a'))
		{
			if(initgallery != false) dwbox.update_gallery_from_link(jQuery(obj));
			
			var contents = '<img src="'+$(obj).attr('href')+'" onload="dwbox.stoploading();">'
			$('div.dwbox_wrap').html('').append(dwbox.headerHTML+contents+dwbox.footerHTML);
			
			dwbox.open();
			dwbox.setloading();
		}
		else
		{
			if(initgallery != false) dwbox.update_gallery_from_object(jQuery(obj).eq(0));
			
			var contents = jQuery(obj).eq(0).clone();
			$('div.dwbox_wrap').html('').append(dwbox.headerHTML+contents+dwbox.footerHTML);
			
			dwbox.open();
		}
	}
	else if(typeof(obj) == 'string' &&
		( RegExp('\.png','i').test(obj) || RegExp('\.jpg','i').test(obj) || RegExp('\.jpeg','i').test(obj) || RegExp('\.gif','i').test(obj))
		) //assume it's image or other single stuff
	{
		var array = [];
		if( RegExp(';','i').test(obj)) array = obj.split(';');
		else if( RegExp(',','i').test(obj)) array = obj.split(',');
		if(array.length == 0)
		{
			var contents = '<img src="'+obj+'" onload="dwbox.stoploading();">'
			$('div.dwbox_wrap').html('').append(dwbox.headerHTML+contents+dwbox.footerHTML);
			
			dwbox.open();
			dwbox.setloading();
		}
		else
		{
			if(initgallery != false)
			{
				dwbox.gallery = array;
				dwbox.curslide = 0;
			}
			
			var contents = '<img src="'+array[0]+'" onload="dwbox.stoploading();">'
			$('div.dwbox_wrap').html('').append(dwbox.headerHTML+contents+dwbox.footerHTML);
			
			dwbox.open();
			dwbox.setloading();
		}
	}
	else if(typeof(obj) == 'string' &&
		( RegExp('\.php','i').test(obj) || RegExp('\.html','i').test(obj) || RegExp('\.css','i').test(obj) || RegExp('\.js','i').test(obj))
		) //assume it's url
	{
		$.ajax({
			type: "POST",
			url: obj,
			success: function(html) {
					$('div.dwbox_wrap').html('').append(dwbox.headerHTML+html+dwbox.footerHTML);
					
					dwbox.open();	
				}
			});
	}
	else //assume it's jquery selector
	{
		if(initgallery != false) dwbox.update_gallery_from_object(jQuery(obj).eq(0));
		
		var contents = jQuery(obj).eq(0).clone();
		$('div.dwbox_wrap').html('').append(dwbox.headerHTML+contents+dwbox.footerHTML);
		
		dwbox.open();
	}
	
	//events
	dwbox.onChangeSlide();
};


//internal func for galleries
dwbox.update_gallery_from_object = function(obj)
{	
	var gal = jQuery(obj).attr('rel');
	if(typeof(gal) == 'string')
	{
		var arr = $('[rel="'+gal+'"]').toArray();
		if(arr.length > 0)
		{
			for(var i=0;i<arr.length;i++)
			{
				if($(arr[i]).html() == $(obj).html()) dwbox.curslide = i;
			}
			dwbox.gallery = arr;
		}
	}
}

dwbox.update_gallery_from_link = function(obj)
{
	var gal = jQuery(obj).attr('rel');
	if(typeof(gal) == 'string')
	{
		var arr = $('[rel="'+gal+'"]').toArray();
		if(arr.length > 0)
		{
			dwbox.gallery = [];
			for(var i=0;i<arr.length;i++)
			{
				if($(arr[i]).attr('href') == $(obj).attr('href')) dwbox.curslide = i;
				dwbox.gallery.push($(arr[i]).attr('href'));
			}
		}
	}
}


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
						dwbox.load($(this));
						return false;
					});
				}
			});
		}
	}
};
