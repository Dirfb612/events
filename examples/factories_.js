//
// Fetches calendars and events from Google Calendar
//
app.factory('GCalFactory', function ($q, $log) {

   
   return {
      getCalendars: getCalendars,
      getEvents: getEvents
   };

   // fetches the calendar list from Google
   function getCalendars() {

      var calendarId = {calendarId: 'm8lu1jllnie840ei5lhlihr1tc@group.calendar.google.com'};
      //var request = gapi.client.calendar.calendarList.list();
      var request = gapi.client.calendar.calendarList.get(calendarId);

      //var request = gapi.client.calendar.calendarList.list();

      return $q(function (resolve, reject) {

         request.execute(function (resp) {

            console.log('--- GCalFactory.getCalendars  GCalFactory ---');
            console.log(resp);

            resolve(resp.result);

         });

      });
      
      //return deferred.promise;
   }
   
   // fetches events from a particular calendar
   // start and end dates (optional) must be RFC 3339 format
   
   function getEvents(calendarId, start, end) {
      
      console.log('--- calendarId ---');
      console.log(calendarId);

      return $q(function (resolve, reject) {

         if (gapi_helper.status.calendarLoaded) {

            var request = gapi.client.calendar.events.list({
               calendarId: calendarId,
               timeMin: start,
               timeMax: end,
               maxResults: 10000, // max results causes problems: http://goo.gl/FqwIFh
               singleEvents: true
            });

            request.execute(function (resp) {

               console.log('--- GCalFactory.getEvents response GCalFactory ---');
               console.log(resp);
               resolve(resp.items || []);

            });

         } else {

            reject([]);

         }

      });

      
   }
   

});


//
// Delivers FullCalendar event sources for Google Calendars
//
app.factory("EventSourceFactory", function ($q, $log, GCalFactory) {
   var self = {};
   
   self.getEvents = getEvents;
   self.fetchEvents = fetchEvents;
   self.getEventSources = getEventSources;


   // converts a calendar object from Google's API to a fullcalendar event source
   function google2fcEventSource(google) {

      return {

         events: events,
         
         textColor: google.foregroundColor,
         color: google.backgroundColor,
         google: google // keep a reference to the original
         
      };

      function events(start, end, timezone, callback) {

         getEvents(google.id, start, end, timezone, callback);

      }

   }
   
   // converts an event from Google's API to a fullcalendar event object
   function google2fcEvent(google) {
      
      var fc = {
         
         title: google.summary,
         start: google.start.date || google.start.dateTime,
         end: google.end.date || google.end.dateTime,
         allDay: google.start.date ? true : false,
         google: google // keep a reference to the original
      };
      
      return fc;
      
   }
   
   var eventCache = {};
   
   // if cached data is older than this, don't display it; wait for server data
   self.displayableTime = 1000 * 60 * 5; // 5 minutes
   // if cached data is younger than this, don't bother hitting the server at all
   self.noUpdateTime = 1000 * 30; // 30 seconds
   // (if age falls inbetween, display cached, then query server in the bg to update cache)
   
   // fetches events from Google
   function fetchEvents(calendarId, start, end, timezone) {
      
      start = moment(start).format();
      end = moment(end).format();
      
      return GCalFactory.getEvents(calendarId, start, end).then(function (result) {
   
         console.log('--- result getEvents GCalFactory ---');
         console.log('--- result ****---');
         console.log(result);
         
         return result.map(google2fcEvent);
         
      });
   }
   
   // gets events, possibly from the cache if it's not stale
   function getEvents(calendarId, start, end, timezone, callback) {
      
      var key = calendarId + '|' + start + '|' + end;
      var cached = eventCache[key];
      var displayCached = false,
         updateCache = true;
      
      if (cached) {
         
         console.log('--- cached ---');
         console.log(cached);
         
         var age = new Date().getTime() - cached.date.getTime();
         
         displayCached = age <= self.displayableTime;
         updateCache = age > self.noUpdateTime;
         
      }
      // cached data is ok to display? then display it
      if (displayCached) {
         
         callback(cached.data);
         
      }
      // do we need to update the cache with fresh data from Google?
      if (updateCache) {
         
         fetchEvents(calendarId, start, end, timezone).then(function (data) {
            
            eventCache[key] = {
               date: new Date(),
               data: data
            };
            
            // display the fresh data if we didn't display the cached data
            if (!displayCached) callback(data);
            
         });
      }
   }
   
   // gets event sources for all calendars in the user's Google account
    function getEventSources() {
      
      return GCalFactory.getCalendars().then(function (result) {

         /*console.log('--- result.map(google2fcEventSource) ---');
         console.log(result.map(google2fcEventSource));
*/
         //return result.map(google2fcEventSource);
         
         return google2fcEventSource(result);
         
      }, function (error) {
         
         console.log('--- EventSourceFactory.getEventSources error ---');
         console.log(error);
         
         return error;
         
      });
      
   }
   
   return self;
   
});