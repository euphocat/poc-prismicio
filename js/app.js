(function() {

  angular.module('poc', ['ngRoute', 'ngCookies'])
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
        })
        .when('/preview', {
          template: '<div></div>',
          controller: 'PreviewController'
        });
      $locationProvider.html5Mode(false);
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
    .controller('PreviewController', function ($location, prismicService) {
      prismicService.preview($location.search()['token']).then(function (redirectUrl) {
        $location.path(redirectUrl);
      })
    })
    

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

      this.accessToken = 'MC5XRW1TQmlVQUFLY3Y1Smo3.77-977-977-977-977-9QWvvv73vv73vv71l77-977-9Lu-_vUZRbUrvv73vv73vv70277-977-977-977-9M1YdAO-_vQ';

      function Service ($q, $cookies, $location) {
        var apiPromise = Prismic.api(self.apiUrl, {accessToken: self.accessToken}); 

        var linkResolver = function (doc) {
          // Pretty URLs for known types
          return "/article/" + doc.uid;
        }

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
          },

          preview: (token) => {
            var deferred = $q.defer();

            apiPromise
              .then(api => api.previewSession(token, linkResolver, '/'))
              .then(redirectUrl => {
                $cookies.put(Prismic.previewCookie, token, { maxAge: 60 * 30 * 1000, path: '/', httpOnly: false });
                return redirectUrl;
              })
              .then(response => deferred.resolve(response));

            return deferred.promise;
          }
        }

      }
    })

})();