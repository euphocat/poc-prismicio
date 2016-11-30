(function() {

  angular.module('poc', ['ngRoute'])
    .config(function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'home.html',
          controller: 'HomeController',
          controllerAs: 'ctrl'
        })
        .when('/article/:uid', {
          templateUrl: 'article.html',
          controller:'DetailController',
          controllerAs: 'ctrl'
        });
      $locationProvider.html5Mode(true);
    });

  angular.module('poc')
    .controller('HomeController', ['prismicService', function (prismicService) {
        var vm = this;
        prismicService.getArticles().then(articles => {
          vm.articles = articles.map(article => ({
            body: article.getStructuredText('article.body').getFirstParagraph().text,
            title: article.getText('article.title'),
            image: article.getImage('article.picture').url,
            uid: article.uid
          }));
        });   
    }]);

  angular.module('poc')
    .controller('DetailController', ['prismicService','$routeParams', '$sce', function (prismicService, $routeParams, $sce) {
        var vm = this;
        prismicService.getArticle($routeParams.uid).then(article => {
          vm.article = {
            body: $sce.trustAsHtml(article.getStructuredText('article.body').asHtml()),
            title: article.getText('article.title'),
            image: article.getImage('article.picture').url,
            uid: article.uid
          };
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
            },
          getArticle: (uid) => {
            var deferred = $q.defer();

              apiPromise
                .then(api => api.getByUID("article", uid))
                .then(response => {
                  return deferred.resolve(response)});

              return deferred.promise;
          }
        }

      }
    })

})();