(function() {
  angular.module('poc', ['ngRoute'])
    .config(function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'home.html'
        })
        .when('/article/:id', {
          templateUrl: 'article.html'
        });
      $locationProvider.html5Mode(true);
    });
})();