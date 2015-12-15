$(document).ready(
function()
{

	if($('#facebook').length > 0)
	{
		var pageTitle=document.title;

		if(pageTitle)
		{
        		if(encodeURIComponent){pageTitle=encodeURIComponent(pageTitle);}
        		else
        		if(encodeURLComponent){pageTitle=encodeURLComponent(pageTitle);}
        		else
        		if(escape){pageTitle=escape(pageTitle);}

        		var anchorIds=["facebook","twitter","pinterest", "linkedin"];
			
        		for(var i=0;i<anchorIds.length;i++)
        		{
				var anchor=$('#'+anchorIds[i]);
				if(anchor.length == 0){continue;}
				
				var href=$(anchor).attr("href");
				if(!href){continue;}
				
				var eq=href.lastIndexOf("=");
                		var at=href.indexOf('@');

                		if(at==-1)
                		{
                        		$(anchor).attr("href",href.substring(0,eq+1)+pageTitle+"&");
                		}
                		else
                		{
					$(anchor).attr("href",href.substring(0,eq+1)+document.title+" "+href.substring(at));
                		}
        		}
		}
	}
});
