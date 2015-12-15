if (!String.prototype.trim)
{
	String.prototype.trim = function()
	{
    	return this.replace(/^\s+|\s+$/g,"");
	}
}
/*****************************************
* ical
* Author: Edward Crichton
*****************************************/

function iCalendarChannel(icalURL)
{
	var ahah=new Ahah();

	var response=ahah.get(icalURL,[["Cache-Control","no-cache"],["Pragma", "no-cache"]]);

	var icalDocument=response.responseText;
	
	this.events=[];
	this.headerNames=["DTSTART","DTEND","SUMMARY","DESCRIPTION","TRANSP","UID","LOCATION","CATEGORIES","SEQUENCE","DTSTAMP","CREATED","LAST-MODIFIED","ORGANIZER","STATUS","URL","X-OUCL-EXPIRES"];
	
	if(icalDocument)
	{
		var inCalendar=false;
		var inEvent=false;
		var lines=icalDocument.split('\n');
		
		var event=null;
		this.name="";
		
		reading:
		for(var L=0;L<lines.length;L++)
		{
			var line=lines[L];
			
			if(line.match("^BEGIN")=="BEGIN")
			{
				var what=line.substring(6).trim();
				if(what=='VCALENDAR'){inCalendar=true;}
				else
				if(what=='VEVENT'){inEvent=true;event={};}
				continue;
			}
			
			if(line.match("^END:")=="END:")
			{
				var what=line.substring(4).trim();
				if(what=='VCALENDAR'){inCalendar=false;}
				else
				if(what=='VEVENT'){inEvent=false;this.events.push(event);event=null;}
				continue;
			}
			if(line.match("^X-WR-CALNAME:")=="X-WR-CALNAME:")
			{
				this.name=line.substring(13).trim();
				continue;
			}
			
			if(!inEvent){continue;}
			
			
			
			for(var h=0;h<this.headerNames.length;h++)
			{
				if(line.match("^"+this.headerNames[h]+":")==this.headerNames[h]+":")
				{
					event[this.headerNames[h]]=line.substring(this.headerNames[h].length+1).trim();
					continue reading;
				}
			}
			
			for(var h=0;h<this.headerNames.length;h++)
			{
				if(line.match("^"+this.headerNames[h]+";")==this.headerNames[h]+";")
				{
					if(this.headerNames[h]=="ORGANIZER")
					{
						event[this.headerNames[h]]=line.substring(this.headerNames[h].length+1).trim();
					}
					else
					{
						var colon=line.indexOf(":",this.headerNames[h].length+1);
						if(colon!=-1)
						{
							event[this.headerNames[h]]=line.substring(colon+1).trim();
						}
					}
					continue reading;
				}
			}
			
		}
		
		if(inEvent || inCalendar)
		{
			this.readProperly=false;
		}
		else
		{
			this.readProperly=true;
		}
	}
	
	this.months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	
}

iCalendarChannel.prototype.unescapeICal=function(input)
{
	if(""==input){return input;}
	
	if(!input){return null;}
	
	if(input.indexOf('\\')!=-1)
	{
		var str="";
		for(var i=0;i<input.length;i++)
		{
			var c=input.charAt(i);
			if(c=='\\')
			{
				if(i+1<input.length)
				{
					var d=input.charAt(i+1);
					if(d=='\\'){str+='\\';i++;continue;}
					if(d==','){str+=',';i++;continue;}
					if(d=='n'){str+='\n';i++;continue;}
					if(d==';'){str+=';';i++;continue;}
				}
			}
			str+=c;
		}
		return str;
	}
	else
	{
		return input;
	}
};

function getBSTPeriod()
{
	// is from the last sunday in march to the last sunday in october
	
	var bstStart = new Date;
	bstStart.setUTCMonth(2);
	bstStart.setUTCDate(31);
	bstStart.setUTCHours(1);
	bstStart.setUTCMinutes(0);
	bstStart.setUTCSeconds(0);
	bstStart.setUTCMilliseconds(0);
	
	var day = bstStart.getDay();
	bstStart.setDate(31-day);

	var bstEnd = new Date;
	bstEnd.setUTCMonth(9);
	bstEnd.setUTCDate(31);
	bstEnd.setUTCHours(2);
	bstEnd.setUTCMinutes(0);
	bstEnd.setUTCSeconds(0);
	bstEnd.setUTCMilliseconds(0);
	
	var day = bstEnd.getDay();
	bstEnd.setDate(31-day);
	
	return {start: bstStart, end: bstEnd};
}


iCalendarChannel.prototype.toDateString=function(input)
{
	var dateString=input;
	var timeString=null;
	
	if(input.indexOf('T')!=-1)
	{
		datetime=input.split('T');
		dateString=datetime[0];
		timeString=datetime[1];
	}
	
	
	var year=dateString.substring(0,4);
	var month=dateString.substring(4,6);
	var day=dateString.substring(6,8);
	if(day.charAt(0)=='0'){day=day.substring(1);}
	if(month.charAt(0)=='0'){month=month.substring(1);}
	
	if(timeString==null)
	{
		
		if((parseInt(month)-1)>0)
		{
			if(day != "0")
			{
				return day+" "+this.months[parseInt(month)-1]+" "+year;
			}
			else
			{
				return this.months[parseInt(month)-1]+" "+year;
			}
		}
		else
		{
			return year;
		}
	
		
	}
	
	
	var date=new Date();
	date.setUTCFullYear(parseInt(year));
	date.setUTCMonth(parseInt(month)-1);
	date.setUTCDate(parseInt(day));
	
	date.setUTCHours(0);
	date.setUTCMinutes(0);
	date.setUTCSeconds(0);
	date.setUTCMilliseconds(0);
	
	var hours=timeString.substring(0,2);
	var minutes=timeString.substring(2,4);
	var seconds=timeString.substring(4,6);
	
	if(hours.charAt(0)=='0'){hours=hours.substring(1);}
	if(minutes.charAt(0)=='0'){minutes=minutes.substring(1);}
	if(seconds.charAt(0)=='0' && seconds.length==2){seconds=seconds.substring(1);}
	
	date.setUTCMinutes(parseInt(minutes));
	date.setUTCSeconds(parseInt(seconds));
	
	var BST=getBSTPeriod();
	
	if(date.getTime()>BST.start && date.getTime()<BST.end)
	{
		date.setUTCHours(parseInt(hours-1));
	}
	else
	{
		date.setUTCHours(parseInt(hours));
	}

	var time=(date.toLocaleTimeString().split(':',2)).join(':');;

	return day+" "+this.months[parseInt(month)-1]+" "+year+" "+time;
}

iCalendarChannel.prototype.toTimeString=function(input)
{
	var dateString=input;
	var timeString=null;
	
	if(input.indexOf('T')!=-1)
	{
		datetime=input.split('T');
		dateString=datetime[0];
		timeString=datetime[1];
	}

	var year=dateString.substring(0,4);
	var month=dateString.substring(4,6);
	var day=dateString.substring(6,8);
	if(day.charAt(0)=='0'){day=day.substring(1);}
	if(month.charAt(0)=='0'){month=month.substring(1);}
	
	if(timeString==null)
	{
		return day+" "+this.months[parseInt(month)-1]+" "+year;
	}
	
	var date=new Date();
	date.setUTCFullYear(parseInt(year));
	date.setUTCMonth(parseInt(month)-1);
	date.setUTCDate(parseInt(day));
	
	date.setUTCHours(0);
	date.setUTCMinutes(0);
	date.setUTCSeconds(0);
	date.setUTCMilliseconds(0);
	
	var hours=timeString.substring(0,2);
	var minutes=timeString.substring(2,4);
	var seconds=timeString.substring(4,6);
	
	if(hours.charAt(0)=='0'){hours=hours.substring(1);}
	if(minutes.charAt(0)=='0'){minutes=minutes.substring(1);}
	if(seconds.charAt(0)=='0' && seconds.length==2){seconds=seconds.substring(1);}
	
	date.setUTCMinutes(parseInt(minutes));
	date.setUTCSeconds(parseInt(seconds));
	
	var BST=getBSTPeriod();
	
	if(date.getTime()>BST.start && date.getTime()<BST.end)
	{
		date.setUTCHours(parseInt(hours-1));
	}
	else
	{
		date.setUTCHours(parseInt(hours));
	}
	
	var time=(date.toLocaleTimeString().split(':',2)).join(':');

	return time;
}

iCalendarChannel.prototype.toDate=function(input)
{
	var dateString=input;
	var timeString=null;
	
	if(input.indexOf('T')!=-1)
	{
		datetime=input.split('T');
		dateString=datetime[0];
		timeString=datetime[1];
	}
	
	var year=dateString.substring(0,4);
	var month=dateString.substring(4,6);
	var day=dateString.substring(6,8);
	
	if(day.charAt(0)=='0'){day=day.substring(1);}
	if(month.charAt(0)=='0'){month=month.substring(1);}
	
	var date=new Date();
	date.setUTCFullYear(parseInt(year));
	date.setUTCMonth(parseInt(month)-1);
	date.setUTCDate(parseInt(day));
	
	date.setUTCHours(0);
	date.setUTCMinutes(0);
	date.setUTCSeconds(0);
	date.setUTCMilliseconds(0);
	
	if(timeString==null)
	{
		return date;
	}
	
	var hours=timeString.substring(0,2);
	var minutes=timeString.substring(2,4);
	var seconds=timeString.substring(4,6);
	
	if(hours.charAt(0)=='0'){hours=hours.substring(1);}
	if(minutes.charAt(0)=='0'){minutes=minutes.substring(1);}
	if(seconds.charAt(0)=='0' && seconds.length==2){seconds=seconds.substring(1);}
	
	date.setUTCMinutes(parseInt(minutes));
	date.setUTCSeconds(parseInt(seconds));
	
	var BST=getBSTPeriod();
	
	if(date.getTime()>BST.start && date.getTime()<BST.end)
	{
		date.setUTCHours(parseInt(hours-1));
	}
	else
	{
		date.setUTCHours(parseInt(hours));
	}
	
	return date;
}



function loadICalAsNews(feedsIn,elementId,startDate,endDate, features)
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
			heading: null,
			headingURL: null,
			more:null,
			moreURL:null,
			timeOnly:false,
			tabular: false,
			listItems: false,
			filterFunction: function(event){return true;},
			emptyMessage: null
		};
	}

	if(features.showDescription!=true && features.showDescription!=false){features.showDescription=true;}
	if(features.chopDescription!=true && features.chopDescription!=false){features.chopDescription=true;}
	if(features.randomOne!=true && features.randomOne!=false){features.randomOne=false;}
	if(features.randomAll!=true && features.randomAll!=false){features.randomAll=false;}
	if(features.timeOnly!=true && features.timeOnly!=false){features.timeOnly=false;}
	if(features.tabular!=true && features.tabular!=false){features.tabular=false;}
	if(!features.maxTotalDescriptionSize){features.maxTotalDescriptionSize=0;}
	if(features.filterFunction==null){features.filterFunction=function(event){return true;}}
	if(features.listItems!=true && features.listItems!=false){features.listItems=false;}

	var eventsChannel=null;
	var events=[];
	
	for (var k=0; k<feed.length; k++)
	{
        	eventsChannel=new iCalendarChannel(feed[k]);
        	if(!eventsChannel){continue;}

		sorting:
        	for(var i=eventsChannel.events.length-1;i>=0;i--)
        	{
                	var event=eventsChannel.events[i];

                	var eventDate=eventsChannel.toDate(event.DTSTART);

                	if(startDate || endDate)
                	{
                        	if(startDate && eventDate.getTime()<startDate.getTime()){continue sorting;}
                        	if(endDate && eventDate.getTime()>endDate.getTime()){continue sorting;}
                	}

                	events.push(event);
        	}

	}

	events.sort(
		function(obj1, obj2)
		{
			return eventsChannel.toDate(obj1.DTSTART) - eventsChannel.toDate(obj2.DTSTART);
		}
		);


	// remove any "duplicates"

	for(var i=0;i<events.length;i++)
	{
		var e1=events[i];
		var uid1=e1.UID;
		if(!uid1 || uid1.indexOf('-')<0){continue;}

		var uid1=uid1.split('-');
		uid1=uid1[uid1.length-1];


		var dup=false;
		for(var j=i+1;j<events.length;j++)
		{
			var e2=events[j];
			var uid2=e2.UID;
			if(!uid2 || uid2.indexOf('-')<0){continue;}

			var uid2=uid2.split('-');
			uid2=uid2[uid2.length-1];

			if(uid1==uid2)
			{
				dup=true;
				break;
			}
		}

		// no display of TBC events on home page
		var eSummary = eventsChannel.unescapeICal(e1.SUMMARY);
                if( typeof eSummary === 'undefined' || eSummary === null ){
                        dup=true;
                }else{
                        if (eSummary.length < 4){
                                dup=true;
                        }else{
                                var eTBC = eSummary.substr(eSummary.length - 3);
                                var eTBA = eSummary.substr(0, 3);
                                var eHeading = features.heading;
                                var eDesc = eventsChannel.unescapeICal(e1.DESCRIPTION);
                                
                                if (eTBC === "TBC" || eTBA === "TBA" || eTBC === "TBA" || eTBA === "TBC") {
                                        if (elementId === "events-list-4" || elementId === "events-list-2"){
                                                dup=true;
                                        }
                                }
                        }
                }

		if(dup)
		{
			events.splice(i,1);
			i--;
		}
	}

	if(features.randomOne)
	{
			var pick=Math.floor(Math.random()*(events.length+1));
			events=[events[pick]];
	}

	if(!features.max){features.max=events.length;}
	
	if(features.randomAll)
	{
		var randomisedEvents=[];
		for(var p=0;p<features.max;p++)
		{
			var pick=Math.floor(Math.random()*(events.length+1));
			if(pick>=events.length){pick=events.length-1;}
			if(pick<0){pick=0;}
			
			var chosen=events[pick];
			events.splice(pick,1);
			randomisedEvents.push(chosen);
		}
		
		events=randomisedEvents;
	}
	
	
	var upto=features.max;

	var total=0;

	for(var i=0;i<upto;i++)
	{
		var event=events[i];
		if(!event){continue;}

		if(startDate || endDate)
		{
			var eventDate=eventsChannel.toDate(event.DTSTART);

			if(startDate && eventDate.getTime()<startDate.getTime()){continue;}
			if(endDate && eventDate.getTime()>endDate.getTime()){continue;}
		}
		if(features.filterFunction(event)==false){continue;}
		total++;
	}

	var HTML="";
	var previousWhen="";
	var areAny=false;

	var max=250;

	if(features.maxTotalDescriptionSize>0 && features.chopDescription)
	{
		if(total>0)
		{
			max=features.maxTotalDescriptionSize/total;
		}
	}

	if (features.tabular)
	{
		//tabular will use table. see below.
	}
	else
	if (features.listItems)
	{
		HTML+="<ul class=\"media-list media-list-links\">";
	}
	else
	{
		HTML+="<div>";
	}

	for(var i=0;i<upto;i++)
	{
		var event=events[i];
		if(!event){continue;}

		if(startDate || endDate)
		{
			var eventDate=eventsChannel.toDate(event.DTSTART);

			if(startDate && eventDate.getTime()<startDate.getTime()){continue;}
			if(endDate && eventDate.getTime()>endDate.getTime()){continue;}
		}
		if(features.filterFunction(event)==false){continue;}

		var desc=null;

		if(features.showDescription)
		{
			if(event.DESCRIPTION)
			{
				desc=eventsChannel.unescapeICal(event.DESCRIPTION);
			}
			else
			{
				desc="";
			}

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
					var stop=desc.indexOf('.');
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
						stop=desc.indexOf(' ');
					}
					if(stop<=0)
					{
						stop=max;
					}
					desc=desc.substring(0,stop+1);
				}
			}
		}

		var when=null;

		if(features.timeOnly)
		{
			when=eventsChannel.toTimeString(event.DTSTART);
		}
		else
		{
			when=eventsChannel.toDateString(event.DTSTART);
		}

		if(features.tabular)
		{
			HTML+="<tr>";

			HTML+="<td class=\"tabularItemPosted\">";

			if(when!=previousWhen)
			{
				HTML+=when;
			}
			else
			{
				HTML+="&#160;";
			}
			HTML+="</td>";

			if(desc)
			{
				HTML+="<td class=\"tabularItemDescription\">"+desc+"</td>";
			}
			else
			{
				HTML+="<td class=\"tabularItemTitle\">"+eventsChannel.unescapeICal(event.SUMMARY)+"</td>";
			}

			if(event.LOCATION)
			{
				HTML+="<td class=\"tabularItemLocation\">"+eventsChannel.unescapeICal(event.LOCATION)+"</td>";
			}
			HTML+="</tr>";

		}
		else
		{
			var dStr="";
			var mStr="";
			var yStr="";
			var tStr="";

			var calStr = when.split(" ");
			if (calStr[0]){dStr=calStr[0];}
			if (calStr[1]){mStr=calStr[1];}
			if (calStr[2]){yStr=calStr[2];}
			if (calStr[3]){tStr=calStr[3];}

			if (!features.listItems)
			{
				HTML+="<div class=\"newsItem\"><div class=\"newsItemTitle\"><a href=\""+event.URL+"\">"+eventsChannel.unescapeICal(event.SUMMARY)+"</a></div>";
                		HTML+="<div class=\"newsItemPosted\">"+when;
                	}
			else
			{
				HTML+="<li class=\"media\"><div class=\"media-left\"><a href=\""+event.URL+"\" class=\"date-icon\"><span class=\"day\">"+dStr+"</span><span class=\"month\">"+mStr+"</span></a></div><div class=\"media-body\"><a href=\""+event.URL+"\">"+eventsChannel.unescapeICal(event.SUMMARY)+"</a></div></li>";
                	}

			if(event.LOCATION && !features.listItems)
			{
				HTML+="<span style=\"font-size:small; margin-left:70px;\"> in "+eventsChannel.unescapeICal(event.LOCATION)+" "+when+"</span>";
			}

			HTML+="</div>";

			if(desc)
			{
				HTML+="<div class=\"newsItemDescription\">"+desc+"</div>";
			}
		}

		previousWhen=when;
		areAny=true;
	}

	if (features.tabular)
	{
        	//tabular will use table. see below.
	}
	else
	if (features.listItems)
	{
        	HTML+="</ul>";
	}
	else
	{
        	HTML+="</div>";
	}

	if(areAny == true)
	{
		if(features.heading)
		{
			var heading="<h3>";
			if(features.headingURL)
			{
				heading+="<a href=\""+features.headingURL+"\">";
			}
			heading+=features.heading;
			if(features.headingURL)
			{
				heading+="</a>";
			}
			heading+="</h3>";
			HTML=heading+HTML;
		}

		if(features.tabular)
		{
			HTML="<table>"+HTML+"<table>";
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

	if (total==0 || areAny == false)
	{
		if(features.emptyMessage)
		{
			HTML=HTML+"<div>"+features.emptyMessage+"</div>";
			$('#'+elementId).html(HTML);
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
	else
	{
		$('#'+elementId).html(HTML);
	}

	return total;
}
