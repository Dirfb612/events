/*
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
      return $q(function (resolve, reject) {
         
         request.execute(function (resp) {
            
            console.log('--- GCalFactory.getCalendars  GCalFactory ---');
            console.log(resp.result);
            
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
   
   
});*/

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
