app.controller("CalendarController", function($scope, $location, EventSourceFactory) {
  $scope.eventSources = [];
  $scope.authNeeded = false;

  // load calendars from google and pass them as event sources to fullcalendar
  $scope.loadSources = function() {
    EventSourceFactory.getEventSources().then(function(result) {

      console.log('--- event sources controller---');
      console.log(result);
    //  $scope.$log.debug("event sources %O", result);
      $scope.eventSources = result;
  
  console.log('--- result ---');
  console.log(result);

      $scope.calendar.fullCalendar('addEventSource', result);

/*      angular.forEach(result, function(source) {
        $scope.calendar.fullCalendar('addEventSource', source);
        
        console.log('--- source ---');
        console.log(source);
      });*/

    });
  };

  // request Google authorization from the user
  $scope.requestAuth = function() {
    gapi_helper.requestAuth();
  };
  
  // configure gapi-helper
  // (you'll have to change these values for your own app)
  gapi_helper.configure({
    clientId: '1020443454327-r6ev6jep74mtqb1pp9aentg75v1l5j4n.apps.googleusercontent.com',
    apiKey: 'AIzaSyDvbmZLQjDm_qrkvpUl1kTTMhDnpokNmrI',
    scopes: 'https://www.googleapis.com/auth/calendar',
    services: {
      calendar: 'v3'
    }
  });

  // set authNeeded to appropriate value on auth events
  gapi_helper.when('authorized', function() {
    $scope.$apply(function() {
      $scope.authNeeded = false;
    });
  });
  gapi_helper.when('authFailed', function() {
    $scope.$apply(function() {
      $scope.authNeeded = true;
    });
  });

  // load the event sources when the calendar api is loaded
  gapi_helper.when('calendarLoaded', $scope.loadSources);

});