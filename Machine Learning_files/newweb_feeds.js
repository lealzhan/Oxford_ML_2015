$(document).ready(
function()
{

	function loadNews()
	{
        	var today=new Date();
        	today.setHours(0);
        	var nowOn=new Date();
        	var tomorrow=new Date();
        	tomorrow.setHours(23);
        	tomorrow.setDate(today.getDate()+1);

        	var thisWeek=new Date();
        	thisWeek.setHours(0);
        	thisWeek.setDate(today.getDate()+7);

        	var thisFortnight=new Date();
        	thisFortnight.setHours(0);
        	thisFortnight.setDate(today.getDate()+14);

        	var lastTwoMonths=new Date();
        	lastTwoMonths.setDate(today.getDate()-(28*2));

        	var lastSixMonths=new Date();
        	lastSixMonths.setDate(today.getDate()-(28*6));

        	var lastMonth=new Date();
        	lastMonth.setDate(today.getDate()-(28));

        	var lastThreeWeeks=new Date();
        	lastThreeWeeks.setDate(today.getDate()-(21));

        	if($('#vacancies-faculty-random').length > 0) {window.setTimeout(function(){loadRSSAsNews("/feeds/News-Vacancies-Faculty.xml?","vacancies-faculty-random",null,null,{heading:"Faculty",headingURL: "/news/vacancies-faculty.html", showDescription: false, randomOne:true, emptyMessage: "There are no faculty vacancies at this time."});},1);};
        	if($('#vacancies-research-random').length > 0) {window.setTimeout(function(){loadRSSAsNews("/feeds/News-Vacancies-Research.xml?","vacancies-research-random",null,null,{heading:"Research", headingURL: "/news/vacancies-research.html", showDescription: false, randomOne:true, emptyMessage: "There are no research vacancies at this time."});},1);}
        	if($('#vacancies-support-random').length > 0) {window.setTimeout(function(){loadRSSAsNews("/feeds/News-Vacancies-Support.xml?","vacancies-support-random",null,null,{heading:"Support Staff", headingURL: "/news/vacancies-support.html", showDescription: false, randomOne:true, emptyMessage: "There are no support vacancies at this time."});},1);}
		if($('#vacancies-studentship-random').length > 0) {window.setTimeout(function(){loadRSSAsNews("/feeds/News-Studentships.xml?","vacancies-studentship-random",null,null,{heading:"Studentships", headingURL: "/news/studentships.html", showDescription: false,randomOne:true, emptyMessage: "There are no studentships at this time."});},1);}
		if($('#vacancies-all-random-2').length > 0) {window.setTimeout(function(){loadRSSAsNews(["/feeds/News-Vacancies-Faculty.xml?","/feeds/News-Vacancies-Research.xml?","/feeds/News-Vacancies-Support.xml?"],"vacancies-all-random-2",null,null,{showDescription: false, max: 2, randomAll:true, listVan: true, emptyMessage: "There are no vacancies at this time."});},1);}
		if($('#vacancies-all-faculty').length > 0) {window.setTimeout(function(){loadRSSAsNews("/feeds/News-Vacancies-Faculty.xml?","vacancies-all-faculty",null,null,{showDescription: false, listVan: true, emptyMessage: "There are no faculty vacancies advertised at this time."});},1);};
		if($('#vacancies-all-research').length > 0) {window.setTimeout(function(){loadRSSAsNews("/feeds/News-Vacancies-Research.xml?","vacancies-all-research",null,null,{showDescription: false, listVan: true, emptyMessage: "There are no research vacancies advertised at this time."});},1);};
		if($('#vacancies-all-support').length > 0) {window.setTimeout(function(){loadRSSAsNews("/feeds/News-Vacancies-Support.xml?","vacancies-all-support",null,null,{showDescription: false, listVan: true, emptyMessage: "There are no support vacancies advertised at this time."});},1);};
		if($('#vacancies-all-studentship').length > 0) {window.setTimeout(function(){loadRSSAsNews("/feeds/News-Studentships.xml?","vacancies-all-studentship",null,null,{showDescription: false, listVan: true, emptyMessage: "There are no studentships advertised at this time."});},1);};

		if($('#news-list-4').length > 0) {window.setTimeout(function(){loadRSSAsNews("/feeds/News-All.xml?","news-list-4",null,null,{showDate: false, showDescription: false, max: 4, listItems: true, filterOut: ["Vacancies","Vacancies-Research","Vacancies-Support","Vacancies-Faculty","Studentships"]} );},1);}
		if($('#events-list-4').length > 0) {window.setTimeout(function(){loadICalAsNews(["/feeds/SeminarSeries-All.ics?","/feeds/Events-All.ics?"],"events-list-4",nowOn,null,{showDate: false, showDescription: false, max: 4, listItems: true} );},1);}
		if($('#news-list-2').length > 0) {window.setTimeout(function(){loadRSSAsNews("/feeds/News-All.xml?","news-list-2",null,null,{showDate: false, showDescription: false, max: 2, listItems: true, filterOut: ["Vacancies","Vacancies-Research","Vacancies-Support","Vacancies-Faculty","Studentships"]} );},1);}
                if($('#events-list-2').length > 0) {window.setTimeout(function(){loadICalAsNews(["/feeds/SeminarSeries-All.ics?","/feeds/Events-All.ics?"],"events-list-2",nowOn,null,{showDate: false, showDescription: false, max: 2, listItems: true} );},1);}
		if($('#projects-col-2').length > 0) {window.setTimeout(function(){loadRSSAsNews("/dynamicfeed/randomFeedItem2.jsp?url=http://www.cs.ox.ac.uk/feeds/Projects-All.xml","projects-col-2",null,null,{showDate: false, showDescription: false,colItems: true});},1);}
		
		if($('#all-news').length > 0) {window.setTimeout(function(){loadRSSAsNews("/feeds/News-All.xml?","all-news",null,null,{showDate: true, showDescription: true, listItems: true, filterOut: ["Vacancies","Vacancies-Research","Vacancies-Support","Vacancies-Faculty","Studentships"]} );},1);}
		if($('#all-events').length > 0) {window.setTimeout(function(){loadICalAsNews(["/feeds/SeminarSeries-All.ics?","/feeds/Events-All.ics?"],"all-events",nowOn,null,{heading:"Upcoming events and seminars",showDate: true, showDescription: false,listItems: true} );},1);}
		if($('#all-seminars').length > 0) {window.setTimeout(function(){loadICalAsNews(["/feeds/SeminarSeries-All.ics?"],"all-seminars",nowOn,null,{heading:"Upcoming seminars",showDate: true, showDescription: false,listItems: true} );},1);}
		if($('#industry').length > 0) {window.setTimeout(function(){loadICalAsNews(["/feeds/SeminarSeries-All.ics?"],"industry",null,null,{heading:"Tech Talks on Tuesdays",showDate: true, showDescription: false,listItems: true,filterFunction:function(event){if(event.CATEGORIES!='industry'){return false;}else{return true;}}});},1);}
		if($('#strachey').length > 0) {window.setTimeout(function(){loadICalAsNews(["/feeds/SeminarSeries-All.ics?"],"strachey",null,null,{heading:"Strachey lectures",showDate: true, showDescription: false,listItems: true,filterFunction:function(event){if(event.CATEGORIES!='strachey'){return false;}else{return true;}}});},1);}
		
		if($('#lectures').length > 0) {window.setTimeout(function(){loadICalAsNews(["/feeds/Timetable-Lecture.ics?"],"lectures",today,tomorrow,{heading:"Departmental lectures (not open to public)" });},1);}
		if($('#practicals').length > 0) {window.setTimeout(function(){loadICalAsNews(["/feeds/Timetable-Practical.ics?"],"practicals",today,tomorrow,{heading:"Departmental practicals (not open to public)" });},1);}
		
	
 	 	//window.setTimeout( function(){$('.equal-height > *').matchHeight();},1);

		//window.setTimeout( function(){$.fn.matchHeight._update();},1);
		
		window.setTimeout( function(){$('.equal-height').matchHeight();},1);
	}

	window.setTimeout(loadNews,1);

	window.setInterval(loadNews,720000);
	
	
	if($('#calendarArea').length > 0) { window.setTimeout(function(){ loadCalendars(); },1); }
	
	if($('#research-activities').length > 0) { window.setTimeout(function(){ chooseRandomRow($('#research-activities')); },1); }
	if($('#research-projects').length > 0) { window.setTimeout(function(){ chooseRandomRow($('#research-projects')); },1); }
	if($('#research-publications').length > 0) { window.setTimeout(function(){ chooseRandomRow($('#research-publications')); },1); }

});

function chooseRandomRow(inPanel)
{
	if($(inPanel).length == 0){return;}
	
	var rows=$(inPanel).find('.row');
	
	var pick=Math.floor(Math.random()*(rows.length));
	if(pick>rows.length-1){pick=rows.length-1;}
	if(pick<0){pick=-pick % rows.length;}

	rows.each(function(){$(this).hide()});
	$(rows.get(pick)).show();
	
	$(inPanel).parents(".equal-height").css("height","");
	
	window.setTimeout( function(){$('.equal-height').matchHeight();},1);
}


function loadCalendars()
{
	

	var standardColors=[
	"#DC3912","#FF9900","#0099C6","#DD4477","#66AA00",
	"#B82E2E","#316395","#994499","#22AA99","#6633CC","#E67300","#8B0707",
	"#651067","#329262","#5574A6","#3B3EAC","#B77322","#16D620","#B91383","#F4359E",
	"#9C5935","#A9C413","#2A778D","#668D1C","#BEA413","#0C5922","#743411"];
	
	var feeds=
	[
		{
			url:"/feeds/Events-All.ics?",
			feedName:"Events",
			show: true
		},
		{
			url:"/feeds/SeminarSeries-All.ics?",
			feedName:"Seminars",
			show: true
		},
		{
			url:null,
			feedName:"Term dates",
			show: true
		},
		{
			url:"/feeds/Timetable-Lecture.ics?",
			feedName:"Lectures",
			color: "#109618"
		}
		,
		{
			url:"/feeds/Timetable-Practical.ics?",
			feedName:"Practicals",
			color: "#3366CC"
		}
		,
		{
			url:"/feeds/Timetable-Class.ics?",
			feedName:"Classes",
			color: "#aaaa11"
		}
		,
		{
			url:"/softeng/courses/courseCalendar.ics",
			feedName:"Professional programmes",
			color: "#990099"
		}
	
	];
	
	
	
	
	var calendarEvents=[];
	
	var keyHtml=$("<div></div>");
	keyHtml.append($("<p></p>"));
	keyHtml.append($("<h3>Key</h3>"));
	
	var colourCounter=0;
	for(var f=0;f<feeds.length;f++)
	{
		(
		function()
		{
			var events=[];
			var eventsChannel=null;
			
			if(feeds[f].url)
			{
				eventsChannel=new iCalendarChannel(feeds[f].url);
				
				sorting:
        			for(var i=eventsChannel.events.length-1;i>=0;i--)
        			{
                			var event=eventsChannel.events[i];

                			events.push(event);
        			}

				events.sort(
				function(obj1, obj2)
				{
					return eventsChannel.toDate(obj1.DTSTART) - eventsChannel.toDate(obj2.DTSTART);
				}
				);
			}
			

			var color=feeds[f].color;

			if(!color)
			{
				color=standardColors[colourCounter % standardColors.length];
				colourCounter++;
			}


			var keyRow=$("<div></div>");

			var keyItem=$("<div></div>");
			
			var keySquare=null;
			
			if(feeds[f].show)
			{
				keySquare=$("<div id='feed_"+f+"' class='showing-feed' style='display: inline-block; height: 1.43em; width: 1.40em; background-color: "+color+"; color: white; padding: 0 0.20em 0 0.20em; cursor: pointer'><i class='fa fa-check'></i></div>");
			}
			else
			{
				keySquare=$("<div id='feed_"+f+"' class='' style='display: inline-block; height: 1.43em; width: 1.40em; background-color: "+color+"; color: white; padding: 0 0.20em 0 0.20em; cursor: pointer'><i class='fa fa-times'></i></div>");
			}
			
			keyItem.append(keySquare);
			keyItem.append("<span> "+feeds[f].feedName+" </span>");

			keyRow.append(keyItem);
			keyHtml.append(keyRow);


			var eventSource=
			{
				color: color,
				textColor: "#FFFFFF",
				events: [],
				id: feeds[f].url
			};

			for(var i=0;i<events.length;i++)
			{
				(function()
				{
					var j=i;

					eventSource.events.push(
					{

						title: eventsChannel.unescapeICal(events[j].SUMMARY),
						dtstart: events[j].DTSTART,
						dtstartdate: eventsChannel.toDate(events[j].DTSTART),
						start : eventsChannel.toDate(events[j].DTSTART)/*.toTermString("%yyyy-%MM-%dd")*/,
						end : eventsChannel.toDate(events[j].DTEND)/*.toTermString("%yyyy-%MM-%dd")*/,
						url : events[j].URL,
						allDay: (events[j].DTSTART.indexOf('T') < 0?true:false),
						id: feeds[f].url
					}
					);
				}
				)();
			}
			
			if(feeds[f].feedName=="Term dates")
			{
				// Add the term weeks
				var terms=["MT","HT","TT"];
				
				var thisYear=(new Date()).getFullYear();
				
				for(var year=thisYear-1;year<=thisYear+1;year++)
				{
					for(var term in terms)
					{
						for(var week=-1;week<11;week++)
						{
							var startOfWeek=Date.getDateForTermWeekDay(year, terms[term] ,week ,1);

							eventSource.events.push(
							{
								title : startOfWeek.toTermString("%tt%yy week %tw"),
								start : startOfWeek.toTermString("%yyyy-%MM-%dd"),
								end : startOfWeek.DATE_ADD(1,"DAY").toTermString("%yyyy-%MM-%dd"),
								allDay: true,
								id: "Term dates"
								
							}
							);

						}
					}
				}
			}
			
			
			if(feeds[f].show)
			{
				calendarEvents.push(eventSource);
			}
		
		
			$(keySquare).off("click").on("click", function()
			{
				if($(this).hasClass("showing-feed"))
				{
					$("#calendarArea").fullCalendar('removeEventSource',eventSource);
					$(this).removeClass("showing-feed");
					$(this).find("i").removeClass("fa-check").addClass("fa-times");
				}
				else
				{
					$("#calendarArea").fullCalendar('addEventSource',eventSource);
					$(this).addClass("showing-feed");
					$(this).find("i").removeClass("fa-times").addClass("fa-check");
				}
			}
			);
			
		}
		)();
		
	}

	$("#calendarArea").fullCalendar({eventSources: calendarEvents, header: {left: 'title', center:'month,agendaWeek,agendaDay',right:'today prev,next'}, dayClick: function(date, jsEvent, view){  $("#calendarArea").fullCalendar('changeView', 'agendaDay'); $("#calendarArea").fullCalendar('gotoDate', date);   }    });
	
	
	$("#calendarAreaKey").empty();
	$("#calendarAreaKey").append(keyHtml);
	
	
}


