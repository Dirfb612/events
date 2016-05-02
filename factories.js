//
// Fetches calendars and events from Google Calendar
//
app.factory('GCalFactory', function($q, $log) {
  var self = {};

  // fetches the calendar list from Google
  self.getCalendars = function() {
    var deferred = $q.defer();
    var request = gapi.client.calendar.calendarList.list();
    request.execute(function(resp) {
      $log.debug("GCalFactory.getCalendars response %O", resp);
      deferred.resolve(resp.items);
    });
    return deferred.promise;
  };

  // fetches events from a particular calendar
  // start and end dates (optional) must be RFC 3339 format 
  self.getEvents = function(calendarId, start, end) {
    var deferred = $q.defer();
    if (gapi_helper.status.calendarLoaded) {
      var request = gapi.client.calendar.events.list({
        calendarId: calendarId,
        timeMin: start,
        timeMax: end,
        maxResults: 10000, // max results causes problems: http://goo.gl/FqwIFh
        singleEvents: true
      });
      request.execute(function(resp) {
        $log.debug("GCalFactory.getEvents response %O", resp);
        deferred.resolve(resp.items || []);
      });
    } else {
      deferred.reject([]);
    }
    return deferred.promise;
  };

  return self;
});


//
// Delivers FullCalendar event sources for Google Calendars
//
app.factory("EventSourceFactory", function($q, $log, GCalFactory) {
  var self = {};

  // converts a calendar object from Google's API to a fullcalendar event source
  function google2fcEventSource(google) {
    return {
      events: function(start, end, timezone, callback) {
        self.getEvents(google.id, start, end, timezone, callback);
      },
      textColor: google.foregroundColor,
      color: google.backgroundColor,
      google: google // keep a reference to the original
    };
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
  self.fetchEvents = function(calendarId, start, end, timezone) {
    start = moment(start).format();
    end = moment(end).format();
    return GCalFactory.getEvents(calendarId, start, end).then(function(result) {
      return result.map(google2fcEvent);
    });
  };

  // gets events, possibly from the cache if it's not stale
  self.getEvents = function(calendarId, start, end, timezone, callback) {
    var key = calendarId + '|' + start + '|' + end;
    var cached = eventCache[key];
    var displayCached = false,
      updateCache = true;
    if (cached) {
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
      self.fetchEvents(calendarId, start, end, timezone).then(function(data) {
        eventCache[key] = {
          date: new Date(),
          data: data
        };
        // display the fresh data if we didn't display the cached data
        if (!displayCached) callback(data);
      });
    }
  };

  // gets event sources for all calendars in the user's Google account
  self.getEventSources = function() {
    return GCalFactory.getCalendars().then(function(result) {
      return result.map(google2fcEventSource);
    }, function(error) {
      $log("EventSourceFactory.getEventSources error %O", error);
      return error;
    });
  };

  return self;

});