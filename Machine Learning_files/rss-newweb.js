
/*****************************************
* rss
*****************************************/

function RSSChannel(rssURL)
{
	this.rssURL=rssURL;
	var ahah=new Ahah();

	var response=ahah.get(rssURL,[["Cache-Control","no-cache"],["Pragma", "no-cache"]]);
	
	var rssxml=null;
	
	if(!window.DOMParser)
	{
		rssxml=new ActiveXObject("Microsoft.XMLDOM");
		rssxml.async="false";
		rssxml.loadXML(response.responseText);
		rssxml=rssxml.documentElement;
	}
	else
	{
		rssxml=response.responseXML;
	}

	this.items=[];

	this.title="";
	
	if(rssxml)
	{
		var channelElement=rssxml.getElementsByTagName("channel");
		if(channelElement)
		{
			if((typeof channelElement[0])!="undefined")
			{
				var channelTitleElements=channelElement[0].getElementsByTagName("title");
				
				for(var i=0;i<channelTitleElements.length;i++)
				{
					var titleElement=channelTitleElements[i];
					
					if(titleElement.parentNode==channelElement[0])
					{
						if(titleElement.textContent){this.title=titleElement.textContent;}
						else if(titleElement.text){this.title=titleElement.text;}
						
						break;
					}
				}
			}
		}
		
		var itemElements = rssxml.getElementsByTagName("item");

		var itemFields=["title","description","pubDate","link","guid","dcterms:valid"];
		
		for (var i=0; i<itemElements.length; i++)
		{
			var item=itemElements[i];

			var itemObj={};
			
			for(var j=0;j<itemFields.length;j++)
			{
				itemObj[itemFields[j]]="";
				if(item.getElementsByTagName(itemFields[j]) && item.getElementsByTagName(itemFields[j])[0] && item.getElementsByTagName(itemFields[j])[0].textContent){itemObj[itemFields[j]]=item.getElementsByTagName(itemFields[j])[0].textContent;}
				else if(item.getElementsByTagName(itemFields[j]) && item.getElementsByTagName(itemFields[j])[0] && item.getElementsByTagName(itemFields[j])[0].text){itemObj[itemFields[j]]=item.getElementsByTagName(itemFields[j])[0].text;}
			}
			
			// yahoo weather
			if(item.getElementsByTagName("yweather:condition") && item.getElementsByTagName("yweather:condition").length)
			{
				var conditionElement=item.getElementsByTagName("yweather:condition")[0];
				if(conditionElement)
				{
					var conditionText=conditionElement.getAttribute("text");
					var conditionCode=conditionElement.getAttribute("code");
					var conditionTemp=conditionElement.getAttribute("temp");
					itemObj.condition=conditionText;
					itemObj.code=conditionCode;
					itemObj.temp=conditionTemp;
				}
			}
			
			/*
			itemObj.title="";
			if(item.getElementsByTagName("title")[0].textContent){itemObj.title=item.getElementsByTagName("title")[0].textContent;}
			else if(item.getElementsByTagName("title")[0].text){itemObj.title=item.getElementsByTagName("title")[0].text;}

			itemObj.link="";
			if(item.getElementsByTagName("link")[0].textContent){itemObj.link=item.getElementsByTagName("link")[0].textContent;}
			else if(item.getElementsByTagName("link")[0].text){itemObj.link=item.getElementsByTagName("link")[0].text;}

			itemObj.description="";
			if(item.getElementsByTagName("description")[0].textContent){itemObj.description=item.getElementsByTagName("description")[0].textContent;}
			else if(item.getElementsByTagName("description")[0].text){itemObj.description=item.getElementsByTagName("description")[0].text;}
			
			itemObj.pubDate="";
			if(item.getElementsByTagName("pubDate")[0].textContent){itemObj.description=item.getElementsByTagName("pubDate")[0].textContent;}
			else if(item.getElementsByTagName("pubDate")[0].text){itemObj.description=item.getElementsByTagName("pubDate")[0].text;}
			*/
			
			this.items.push(itemObj);
		}
	}
}


function HTTPResponse()
{
	this.responseText=null;
	this.responseXML=null;

	this.statusText="Internal error: ahah nothing has happened.";
	this.status=501;
}

function Ahah()
{
	this.httpRequest=null;
	this.responseText=null;
	this.responseXML=null;
	this.statusText="Internal error: ahah nothing has happened.";
	this.status=501;
	this.gotXHR=false;

	if(!window.XMLHttpRequest) // || window.XDomainRequest
	{
		this.httpRequest=
		function()
		{
			//try{ return new XDomainRequest() }catch(e){}
	        try{ return new ActiveXObject("MSXML3.XMLHTTP") }catch(e){}
			try{ return new ActiveXObject("MSXML2.XMLHTTP.6.0") }catch(e){}
			try{ return new ActiveXObject("MSXML2.XMLHTTP.4.0") }catch(e){}
	        try{ return new ActiveXObject("MSXML2.XMLHTTP.3.0") }catch(e){}
	        try{ return new ActiveXObject("Msxml2.XMLHTTP") }catch(e){}
	        try{ return new ActiveXObject("Microsoft.XMLHTTP") }catch(e){}
			try{ return createRequest(); }catch(e){}
	        return null;
		}();
	}
	else
	{
		this.httpRequest=function()
		{
			try{ return new XMLHttpRequest(); }catch(e){}
			return null;
		}();
	}

	if(this.httpRequest==null)
	{
		this.status=501;
		this.statusText="Internal error: there is no XMLHttpRequest.";
	}
	else
	{
		this.gotXHR=true;
	}

	// for using the browser cache to store computed values
	this.fetchFromCache=[ ["Cache-Control","only-if-cached, max-age=86400, max-stale=86400"] ];
	this.fetchFromServer=[ ["Cache-Control","max-age=0"] ];
}

Ahah.prototype.toString=
function(){return "Ahah";};

Ahah.prototype.internalError=
function()
{
	this.status=501;
	this.statusText="Internal error: ahah not set up correctly.";
	this.responseText=null;
};

Ahah.prototype.getResponseHeader=
function(header)
{
	if(this.httpRequest)
	{
		return this.httpRequest.getResponseHeader(header);
	}
	return null;
};


Ahah.prototype.get=
function(url,headers,callback)
{
	return this.http("GET",url,"",headers,callback);
};

Ahah.prototype.post=
function(url,parameters,headers,callback)
{
	return this.http("POST",url,parameters,headers,callback);
};

function bind(obj,func,args)
{
	return function()
	{
		if(!args)
		{
			args=arguments;
		}
		return func.apply(obj, args);
	};
}

Ahah.prototype.http=
function(method,url,parameters,headers,callback)
{
	if(!this.httpRequest){this.internalError();return null;}

	var async=false;
	if(callback){async=true;}
	var response=new HTTPResponse();
	
	this.httpRequest.open(method,url,async);
	if(method=="POST")
	{
		this.httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	}
	
	if(headers)
	{
		var i;
		for(i=0;i<headers.length;i++)
		{
			this.httpRequest.setRequestHeader(headers[i][0],headers[i][1]);
		}
	}
	
	var ready=bind(this,
		function(response,callback)
		{
			this.status=this.httpRequest.status;
			this.statusText=this.httpRequest.statusText;
			this.responseText=this.httpRequest.responseText;
			try
			{
				this.responseXML=this.httpRequest.responseXML;
			}
			catch(e)
			{
			}

			response.status=this.status;
			response.statusText=this.statusText;
			response.responseText=this.responseText;
			response.responseXML=this.responseXML;

			if(callback){callback(response);}
		},
		[response,callback]);
	
	
	if(async)
	{
		this.httpRequest.onreadystatechange=bind(this.httpRequest,
		function(){if(this.readyState==4){ready();}},
		null);
	}
	
	this.httpRequest.send(parameters);
	
	if(!async){ready();}

	return response;
};


/*****************************************
* CondenseDescription
*****************************************/

function CondenseDescription(){}

CondenseDescription.prototype.createHoldingDiv=
function()
{
	if(typeof(tempHoldingDiv)=="undefined")
	{
		tempHoldingDiv=document.createElement('div');
		tempHoldingDiv.style.position='absolute';
		tempHoldingDiv.style.zindex='1000';
		tempHoldingDiv.style.top='-1000';
	}
	
	return tempHoldingDiv;
}

CondenseDescription.prototype.chopMedia=
function(html)
{
	// even though the contents div is not being attached
	// to the document dom tree, images and other media
	// are being loaded by the browsers.
	
	try
	{
	
	var toChop1=["<img","<link","<meta"];
	
	chopping1:
	for(var i=0;i<toChop1.length;i++)
	{
		var at=0;
		for(;;)
		{
			var tag=html.indexOf(toChop1[i],at);
			if(tag==-1){tag=html.indexOf(toChop1[i].toUpperCase());}
			if(tag==-1){continue chopping1;}
			var gt=html.indexOf(">",tag);
			if(gt==-1){at=tag+toChop1[i].length;continue;}
			html=html.substring(0,tag)+html.substring(gt+1);
			at=tag;
			continue;
		}
	}
	var toChop2=["<object","<embed","<iframe","<script","<noscript","<head"];
	
	chopping2:
	for(var i=0;i<toChop2.length;i++)
	{
		var at=0;
		for(;;)
		{
			var tag=html.indexOf(toChop2[i],at);
			if(tag==-1){tag=html.indexOf(toChop2[i].toUpperCase());}
			if(tag==-1){continue chopping2;}
			
			var gt=html.indexOf(">",tag);
			if(gt==-1){at=tag+toChop2[i].length;continue;}
			var slashQ=html.charAt(gt-1);
			if(slashQ=='/')
			{
				html=html.substring(0,tag)+html.substring(gt+1);
				at=tag;
				continue;
			}
			
			var endToChop="</"+toChop2[i].substring(1);
			var endtag=html.indexOf(endToChop,gt+1);
			if(endtag==-1){endtag=html.indexOf(endToChop.toUpperCase(),gt+1);}
			if(endtag==-1){at=gt+1;continue;}
			var endgt=html.indexOf(">",endtag);
			if(endgt==-1){at=gt+1;continue;}
			html=html.substring(0,tag)+html.substring(endgt+1);
			at=tag;
			continue;
		}
	}
	}
	catch(e)
	{
	}
	finally
	{
	}
	return html;
}

CondenseDescription.prototype.condense=
function(html)
{
	if(html==null){return "";}
	
	// put the contents into a div
	var node=this.createHoldingDiv();
	
	// remove media before setting the div contents
	var choppedHtml=this.chopMedia(html);
	
	$(node).html(choppedHtml);
	
	// use the dom tree to pull out a formatted
	// version of the text.
	var string="";
	var children=node.childNodes;
	var n=children.length;
	for(var i=0;i<n;i++)
	{
		string=string+this.docondense(children[i]);
	}

	return string;
}

var ELEMENT_NODE=1, ATTRIBUTE_NODE=2, TEXT_NODE=3, DOCUMENT_NODE=9;

CondenseDescription.prototype.docondense=
function(node)
{
	var string="";
	if(!node){return string;}

	if(node.nodeType==ELEMENT_NODE)
	{
		var tagName=node.tagName;
		if(this.shouldOutputTag(node))
		{
			string=string+"<"+tagName;
			// do attributes here
			var attributes=node.attributes;
			if(attributes)
			{
				var n=attributes.length;
				for(var k=0;k<n;k++)
				{
					if(attributes[k].specified)
					{
						string=string+" "+attributes[k].nodeName+"=\""+attributes[k].nodeValue+"\"";
					}
				}
			}
			string=string+">";
		}
		if(this.shouldRecurseTag(node))
		{
			var children=node.childNodes;
			var n=children.length;
			for(var i=0;i<n;i++)
			{
				string=string+this.docondense(children[i]);
			}
		}
		if(this.shouldOutputTag(node))
		{
			string=string+"</"+tagName+">";
		}
	}
	else
	if(node.nodeValue)
	{
		string=string+node.nodeValue;
	}

	return string;
}
	
CondenseDescription.prototype.shouldOutputTag=
function(node)
{
	if(!node){return 0;}
	if(node.nodeType!=1){return 0;}
	if(
	node.tagName=="H1" ||
	node.tagName=="H2" ||
	node.tagName=="H3" ||
	node.tagName=="UL" ||
	node.tagName=="OL" ||
	node.tagName=="LI" ||
	node.tagName=="I" ||
	node.tagName=="B" ||
	node.tagName=="U" ||
	node.tagName=="SPAN" ||
	node.tagName=="EM" ||
	node.tagName=="STRONG" ||
	node.tagName=="DFN" ||
	node.tagName=="CODE" ||
	node.tagName=="SAMP" ||
	node.tagName=="KBD" ||
	node.tagName=="VAR" ||
	node.tagName=="CITE" ||
	node.tagName=="PRE" ||
	node.tagName=="ADDRESS" ||
	node.tagName=="BLOCKQUOTE"
	)
	{
		return 1;
	}
	return 0;
}

CondenseDescription.prototype.shouldRecurseTag=
function(node)
{
	if(!node){return 0;}
	if(node.nodeType!=1){return 0;}
	if(
	node.tagName=="OBJECT" ||
	node.tagName=="EMBED" ||
	node.tagName=="SCRIPT" ||
	node.tagName=="NOSCRIPT" ||
	node.tagName=="LINK" ||
	node.tagName=="META" ||
	node.tagName=="TITLE" ||
	node.tagName=="HEAD" ||
	node.tagName=="IFRAME" ||
	node.tagName=="IMG"
	)
	{
		return 0;
	}
	return 1;
}

var CalendarBox=null;

function destroyCalendarBox()
{
	if(CalendarBox)
	{
		document.body.removeChild(CalendarBox);
		delete CalendarBox;
		CalendarBox=null;
	}
}

function icalLink(icalURL, calendarName)
{
	if(!icalURL){return;}
	
	var webcal=icalURL;
	if(webcal.indexOf("https")==0)
	{
		webcal="webcal"+webcal.substring(5);
	}
	else
	if(webcal.indexOf("http")==0)
	{
		webcal="webcal"+webcal.substring(4);
	}
	else
	{
		webcal="webcal://"+webcal;
	}
	
	destroyCalendarBox();
	
	
	var div=document.createElement('div');
	div.style.position='fixed';
	div.style.zIndex='1000';
	div.style.top='32%';
	div.style.left='1%';
	//div.style.height='34%';
	div.style.width='98%';
	div.style.backgroundColor='#002147';
	div.style.border='1px solid black';
	div.style.padding="5px";
	div.id="Calendarbox";
	
	var inner=document.createElement('div');
	inner.style.backgroundColor='#ffffff';
	
	var titleDiv=document.createElement('div');
	titleDiv.style.backgroundColor='#f2f9ff';
	titleDiv.style.fontSize='16px';
	titleDiv.style.fontWeight='bold';
	titleDiv.style.color='#000000';
	titleDiv.style.verticalAlign='middle';
	titleDiv.style.position='relative';
	titleDiv.style.padding='10px 15px';
	titleDiv.style.fontFamily='Verdana,Arial,sans-serif';
	titleDiv.innerHTML="Subscribe to Calendar &mdash; "+calendarName+"<span onclick='destroyCalendarBox();' style='Cursor: pointer; height: 16px; width: 16px; font-size: 16px; line-height: 16px; overflow: hidden; position: absolute; right: 15px; top: 10px'>X</span>";
	
	var contentsDiv=document.createElement('div');
	contentsDiv.style.backgroundColor='#ffffff';
	contentsDiv.style.padding='15px';
	contentsDiv.innerHTML='To subscribe to this calendar, copy and paste the following address into your calendar application:<br/><br/>'+
	'<a href="'+icalURL+'">'+icalURL+'</a><br/><br/>'+
	'<dl>'+
	'<dt>iCal</dt> <dd>Calendar -> Subscribe. Alternatively, <a href="'+webcal+'">click here</a></dd>'+
	'<dt><a target="_blank" href="http://www.google.com/calendar/">Google</a></dt> <dd>Add -> Add by URL</dd>'+
	'<dt><a target="_blank" href="http://calendar.yahoo.com/">Yahoo</a></dt> <dd>Click on the <strong>+</strong> next to Calendars -> Subscribe to calendar</dd>'+
	'<dt>Outlook</dt> <dd>Tools -> Account settings -> Internet Calendars</dd>'+
	'<dt>Thunderbird</dt> <dd>Subscribe. Choose <strong>On the Network</strong>, file type is <strong>iCalendar</strong></dd>'+
	'</dl>';
	
	inner.appendChild(titleDiv);
	inner.appendChild(contentsDiv);
	
	div.appendChild(inner);
	document.body.appendChild(div);
	CalendarBox=div;
}

function loadRSSAsNews(feedsIn,elementId,startDate,endDate,features)
{
	var feed;

	if( feedsIn.constructor == Array )
	{
		feed = feedsIn;
	}
	else
	{
		feed = [feedsIn];
	}
	
	if(!features)
	{
		features=
		{
			showDescription: true,
			chopDescription: true,
			maxTotalDescriptionSize: 0,
			randomOne: false,
			randomAll: false,
			showDate: true,
			heading: null,
			headingURL: null,
			headingSize: "3",
			more:null,
			moreURL:null,
			weather: false,
			qr: false,
			listItems: false,
			colItems: false,
			listVan: false,
			emptyMessage: null
		};
	}

	if(features.showDescription!=true && features.showDescription!=false){features.showDescription=true;}
	if(features.chopDescription!=true && features.chopDescription!=false){features.chopDescription=true;}
	if(features.randomOne!=true && features.randomOne!=false){features.randomOne=false;}
	if(features.randomAll!=true && features.randomAll!=false){features.randomAll=false;}
	if(features.showDate!=true && features.showDate!=false){features.showDate=true;}
	if(!features.headingSize){features.headingSize="3";}
	if(!features.maxTotalDescriptionSize){features.maxTotalDescriptionSize=0;}
	if(features.weather!=true && features.weather!=false){features.weather=false;}
	if(features.qr!=true && features.qr!=false){features.qr=false;}
	if(features.listItems!=true && features.listItems!=false){features.listItems=false;}
	if(features.colItems!=true && features.colItems!=false){features.colItems=false;}
	if(features.listVan!=true && features.listVan!=false){features.listVan=false;}
	
	var newsChannel=null;
	var itemsIn=[];
	
	for (var k=0; k<feed.length; k++)
	{
		var newsChannel=new RSSChannel(feed[k]);
        	if(!newsChannel){continue;}
	
		var itemsInFromChannel=newsChannel.items;
		if(itemsInFromChannel)
		{
			itemsIn=itemsIn.concat(itemsInFromChannel);
		}
	}
		

	var items=[];
	var now=new Date();
	sorting:
	for(var i=itemsIn.length-1;i>=0;i--)
	{	
		var item=itemsIn[i];
		var pubDate=item.pubDate;
	
		var itemDate=new Date(Date.parse(pubDate));
		var itemEndDate=null;
		if(item['dcterms:valid'])
		{
			itemEndDate=getDCTERMSDate(item['dcterms:valid']);
		}
	
		if(startDate || endDate)
		{
			if(startDate && itemDate.getTime()<startDate.getTime()){continue;}
		
			if(endDate && itemDate.getTime()>endDate.getTime()){continue;}
		}
	
		if(itemEndDate)
		{
			if(elementId.indexOf("news-list") < 0){
				if(now.getTime()>=itemEndDate.getTime()){continue;}
			}
		}
	
		if(features.filterOut)
		{
			for(var j=0;j<features.filterOut.length;j++)
			{
				if(item.guid.indexOf(features.filterOut[j])!=-1)
				{
					continue sorting;
				}
			}
		}
	
		if(items.length==0)
		{
			items.push(item);continue;
		}
	
		for(var j=0;j<items.length;j++)
		{
			var pubDate2=items[j].pubDate;
			var itemDate2=new Date(Date.parse(pubDate2));
		
			if(itemDate.getTime()>=itemDate2.getTime())
			{
			continue;
			}
		
			items.splice(j,0,item);
			continue sorting;
		}
	
	
		items.push(item);
	}

	//items=itemsIn;

	var condense=new CondenseDescription();

	var HTML="";	
	if(features.randomOne)
	{
		var pick=Math.floor(Math.random()*(items.length+1));
		if(pick>=items.length){pick=items.length-1;}
		if(pick<0){pick=0;}
		items=[items[pick]];
	}

	if(!features.max){features.max=items.length;}
	
	if(features.randomAll)
	{
		var randomisedItems=[];
		for(var p=0;p<features.max;p++)
		{
			var pick=Math.floor(Math.random()*(items.length+1));
			if(pick>=items.length){pick=items.length-1;}
			if(pick<0){pick=0;}
			
			var chosen=items[pick];
			items.splice(pick,1);
			randomisedItems.push(chosen);
		}
		
		items=randomisedItems;
	}
	

	var downto=items.length-features.max;

	var total=0;

	for(var i=items.length-1;i>=downto;i--)
	{
		var item=items[i];
		if(!item){continue;}
	
	
		if(startDate || endDate)
		{
		var itemDate=new Date(Date.parse(item.pubDate));
		
		if(startDate && itemDate.getTime()<startDate.getTime()){continue;}
		if(endDate && itemDate.getTime()>endDate.getTime()){continue;}
		}
		total++;
	}

	var max=270;
	if(features.maxTotalDescriptionSize>0 && features.chopDescription)
	{
		if(total>0)
		{
		max=features.maxTotalDescriptionSize/total;
		}
	}

	if(features.weather)
	{
		for(var i=items.length-1;i>=downto;i--)
		{
			var item=items[i];
			if(!item){continue;}
			if(!item.code || !item.condition || !item.temp){continue;}
		
			HTML+="<img src='http://l.yimg.com/a/i/us/we/52/"+item.code+".gif'/><br/>";
			HTML+=item.condition+"<br/>"+item.temp+"<sup>o</sup>C";
		}
	}
	else
	{
		if (features.listItems)
		{HTML+="<ul class=\"media-list media-list-links\">";}
		else
		if(features.colItems){HTML+="<div class=\"row\">";}
		else
		if(features.listVan){HTML+="<ul class=\"list-unbulleted list-unbulleted-spaced\">";}
		else
		{HTML+="<div>";}
		
		for(var i=items.length-1;i>=downto;i--)
		{
			var item=items[i];
			if(!item){continue;}

			if(startDate || endDate)
			{
				var itemDate=new Date(Date.parse(item.pubDate));

				if(startDate && itemDate.getTime()<startDate.getTime()){continue;}
				if(endDate && itemDate.getTime()>endDate.getTime()){continue;}
			}

			var desc=null;
			if(features.showDescription)
			{

				desc=item.description;
				if(!desc){desc="";}
				desc=condense.condense(desc);

				if(desc.length>max && features.chopDescription)
				{	
					if(features.maxTotalDescriptionSize>0)
					{
						var to=0;
						var ellipsis=false;
						for(;;)
						{
							var stop=desc.indexOf('.',to+1);
						
							if(stop>=0 && stop+1<desc.length)
							{
								var nextChar=desc.charAt(stop+1);

								if("0123456789".indexOf(nextChar)!=-1)
								{
								// skip - it's part of a number
								to=stop+1;
								continue;
								}
							}
						
							if(stop<=0)
							{
								stop=desc.indexOf(' ',to+1);
								ellipsis=true;
							}
							if(stop<=0)
							{
								stop=max;
							}

							if(stop>=max)
							{
								to=stop;
								break;
							}

							to=stop;
						}

						desc=desc.substring(0,to+1);
						if(ellipsis)
						{
							desc=desc+" &hellip;";
						}
					}
					else
					{
						var stop=desc.indexOf('. ',20);
					
						if(stop>=0 && stop+1<desc.length)
						{
							var nextChar=desc.charAt(stop+1);

							if("0123456789".indexOf(nextChar)!=-1)
							{
								// skip - it's part of a number
								stop=desc.indexOf('.', stop+1);
							}
						}
					
						if(stop<=0)
						{
							stop=desc.indexOf(' ',125);
						}
						if(stop<=0)
						{
							stop=max;
						}
						
						desc=desc.substring(0,stop+1);
					}
				}
			}
		
			if(features.qr && item.link)
			{
				if(!desc){desc="";}
				var encoded=null;
				if(encodeURIComponent){encoded=encodeURIComponent(item.link);}
				else
				if(encodeURLComponent){encoded=encodeURLComponent(item.link);}
				else
				if(escape){encoded=escape(item.link);}
			
				desc="<img src=\"https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl="+encoded+"\" align=\"right\" style=\"padding: 1em 0 0 1em\"/>"+desc;
			}

			if (features.listItems)
			{
				HTML+="<li ><div class=\"media media-body\"><a href=\""+item.link+"\">"+item.title+"</a></div>";
			}
			else
			if (features.colItems)
			{
				HTML+="<div class=\"col-xs-12 col-sm-6\">";
				HTML+="<p><a class=\"plain-text\" href=\""+item.link+"\">"+item.title+"</a></p>";
				HTML+="<p><a class=\"btn btn-light-blue-on-white text-uppercase\" href=\""+item.link+"\">Read More</a></p>";
				
			}
			else
			if (features.listVan)
			{
				HTML+="<li><p><strong><a href=\""+item.link+"\" class=\"plain-text\">"+item.title+"</a></strong></p>";
			}
			else
			{
				HTML+="<p><a class=\"plain-text\" href=\""+item.link+"\">"+item.title+"</a>";
			}
			
			if(features.showDate)
			{
				var da=item.pubDate.split(' ',4);
				if(da[0])
				{
					da[0]=da[0].replace(',','');
				}
				
				if(da[1] && da[1].length>0 && da[1][0] == '0' && da[1].substring != null)
				{
					da[1]=da[1].substring(1);
				}
				var posted=(da).join(" ");
				HTML+="<div class=\"newsItemPosted\" style=\"color: #606060; margin-bottom: 5px\">"+posted+"</div>";
			}

			if(elementId.indexOf("vacancies") > -1)
			{
				if (features.listVan)
				{
					HTML+="<p><a href=\""+item.link+"\" class=\"btn btn-light-blue-outline btn-thin text-uppercase\">More on this vacancy</a></p></li>";
				}
				else
				{
					HTML+="<p class=\"featured-list-btn\"><a href=\""+item.link+"\" class=\"btn btn-light-blue-outline btn-thin text-uppercase\">More on this vacancy</a></p>";				
				}
			}

			if(desc)
			{
				HTML+="<div class=\"newsItemDescription\" style=\"margin-bottom: 12px; line-height: 1.2\">"+desc+"</div>";
			}
			else
			if(features.showDate)
			{
				HTML+="<div class=\"newsItemDescription\" style=\"margin-bottom: 12px;\"></div>";
			}
			
			
			if (features.listItems)
			{
				HTML+="</li></br>";
			}
			else
			if (features.colItems)
			{
				HTML+="</div>";
			}
			else
			if (features.listVan)
			{
				HTML+="</li>";
			}
			else
			{
				HTML+="</p>";
			}

		}

		if (features.listItems)
		{HTML+="</ul>";}
		else
		if(features.colItems)
		{HTML+="</div>";}
		else
		{HTML+="</div>";}
	}

	if(HTML!="")
	{
		if(features.heading)
		{
			var heading="<h"+features.headingSize+">";
			if(features.headingURL)
			{
				heading+="<a class=\"plain-text\" href=\""+features.headingURL+"\">";
			}
			
			heading+=features.heading;
			
			if(features.headingURL)
			{
				heading+="</a>";
			}
			heading+="</h"+features.headingSize+">";
			HTML=heading+HTML;
		}
	
		if(features.more && features.moreURL)
		{
			var more="<p>";
			more+="<a href=\""+features.moreURL+"\">";
			more+=features.more;
			more+="</a>";
			more+="</p>";
			HTML+=more;
		}
	}

	if (total==0)
	{
		if(features.emptyMessage)
		{
			HTML=HTML+"<div>"+features.emptyMessage+"</div>";
		}
		/*
		if (features.heading)
		{
			HTML=HTML+"<div>Currently no "+features.heading+" available.</div>";
		}
		else
		if(elementId.indexOf("event") > -1)
		{
			HTML=HTML+"<div>Currently no upcoming events available.</div>";
		}
		else
		if(elementId.indexOf("news") > -1)
		{
			HTML=HTML+"<div>Currently no news available.</div>";
		}
		else
		{
			HTML=HTML+"<div>Currently no information available.</div>";
		}
		*/
        }

	$('#'+elementId).html(HTML);

	return total;
}

function getDCTERMSDate(valid)
{
	if(!valid){return null;}
	
	if(valid.indexOf('end=')>=0)
	{
		var parts=valid.split(';');
		
		for(var i=0;i<parts.length;i++)
		{
			var endequals=parts[i].indexOf('end=');
			if(endequals>=0)
			{
				var date=parts[i].substring(4);
				return new Date(date);
			}
		}
	}
	else
	{
		try
		{
			var date=new Date(valid);
			return date;
		}
		catch(e)
		{
		}
	}
	
	return null;
}

