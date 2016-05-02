app = angular.module('CalendarApp', ['ui.calendar']);

app.run(function($rootScope, $log){
  $rootScope.$log = $log;
});
