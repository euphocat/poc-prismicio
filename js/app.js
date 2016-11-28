(function() {

  angular.module('poc', ['ngRoute'])
    .config(function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'home.html',
          controller: 'HomeController',
          controllerAs: 'ctrl'
        })
        .when('/article/:id', {
          templateUrl: 'article.html'
        });
      $locationProvider.html5Mode(true);
    });

  angular.module('poc')
    .controller('HomeController', ['prismicService', '$scope', function (prismicService, $scope) {
        var vm = this;
        prismicService.getArticles().then(articles => {
          vm.articles = articles.map(article => ({
            body: article.getStructuredText('article.body').getFirstParagraph().text,
            title: article.getText('article.title'),
            image: article.getImage('article.picture').url
          }));
        });   
    }]);

  angular.module('poc')
    .provider('prismicService', function() {
      var self = this;

      this.apiUrl = 'https://blogpoc.prismic.io/api'
      
    
      this.$get = Service;

      function Service ($q) {
        var apiPromise = Prismic.api(self.apiUrl); 

        return {
          getArticles: () => 
            {
              var deferred = $q.defer();

              apiPromise
                .then(api => api.query(Prismic.Predicates.at('document.type', 'article')))
                .then(response => deferred.resolve(response.results));

              return deferred.promise;
            }
        }

      }
    })

})();