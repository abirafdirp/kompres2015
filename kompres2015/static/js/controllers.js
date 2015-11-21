var kompresControllers = angular.module('kompresControllers', []);

kompresControllers.controller('NavCtrl', ['$scope', '$route', '$mdDialog',
  function($scope, $route, $mdDialog) {
    $scope.$route = $route;
    $scope.logout_clicked = false;
    $scope.traveldestination_icon = 'terrain';
    $scope.article_icon = 'my_library_books';
    $scope.map_icon = 'directions';
    $scope.info_icon = 'info';

    $scope.reset_logout_clicked = function() {
      $scope.logout_clicked = false;
    };
    $scope.showLogin = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: '/partials/login/',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
      });
      function DialogController($scope, $mdDialog, $timeout) {
        $scope.authenticated = false;
        $scope.closeDialogDelayed = function() {
          $timeout(function(){
            $mdDialog.hide();}, 350);
        };
        $scope.closeDialog = function() {
            $mdDialog.hide();
        };
        $scope.$on('djangoAuth.logged_in', function() {
          $scope.authenticated = true;
        });
        $scope.$on('djangoAuth.logged_out', function() {
          $scope.authenticated = false;
        });
      }
    };
    $scope.showRegister = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: '/partials/register/',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
      });
      function DialogController($scope, $mdDialog, $timeout) {
        $scope.closeDialogDelayed = function() {
          $timeout(function(){
            $mdDialog.hide();}, 350);
        };
        $scope.closeDialog = function() {
            $mdDialog.hide();
        };
        $scope.$on('djangoAuth.logged_in', function() {
          $scope.authenticated = true;
        });
        $scope.$on('djangoAuth.logged_out', function() {
          $scope.authenticated = false;
        });
      }
    };
    $scope.showProfile = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: '/partials/userprofile/',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
      });
      function DialogController($scope, $mdDialog, $timeout) {
        $scope.closeDialogDelayed = function() {
          $timeout(function(){
            $mdDialog.hide();}, 350);
        };
        $scope.closeDialog = function() {
            $mdDialog.hide();
        };
        $scope.authenticated = true;
        $scope.$on('djangoAuth.logged_in', function() {
          $scope.authenticated = true;
        });
        $scope.$on('djangoAuth.logged_out', function() {
          $scope.authenticated = false;
        });
      }
    };
  }
]);

kompresControllers.controller('LoginNavCtrl', ['$scope',
  function($scope) {
    $scope.tab = 'Masuk';
    $scope.setTab = function(name){
      $scope.tab = name;
    };
  }
]);

kompresControllers.controller('HomePageCtrl', ['$scope', 'HomePage',
  function($scope, HomePage) {
    $scope.homepage = HomePage.query();
  }
]);

kompresControllers.controller('RegionsCtrl', ['$scope', 'Regions',
  function($scope, Regions) {
    $scope.regions = Regions.query();
  }
]);

kompresControllers.controller('ProvincesCtrl', ['$scope', 'Provinces',
  function($scope, Provinces) {
    $scope.provinces = Provinces.query();
  }
]);

kompresControllers.controller('DistrictsCtrl', ['$scope', 'Districts',
  function($scope, Districts) {
    $scope.provinces = Districts.query();
  }
]);

kompresControllers.controller('TravelDestinationsCtrl', ['$scope', '$route', '$routeParams', 'TravelDestinations',
  function($scope, $route, $routeParams, TravelDestinations) {
    $scope.$route = $route;
    $scope.params = $routeParams;
    $scope.travel_destination_name = $scope.params.travel_destination_name;

    if (!$scope.travel_destination_name){
      $scope.travel_destinations = TravelDestinations.list.query();
    }
    else {
      $scope.travel_destination = TravelDestinations.detail.query({travel_destination_name:$scope.travel_destination_name})
    }
  }
]);

kompresControllers.controller('ArticleListCtrl', ['$scope', '$route', '$routeParams', '$resource', '$timeout', 'Articles', 'PostCategory',
  function($scope, $route, $routeParams, $resource, $timeout, Articles, PostCategory) {
    $scope.$route = $route;
    $scope.params = $routeParams;
    $scope.show_loading = true;
    $scope.categories = PostCategory.getCategories();
    $scope.search = $scope.params.search;
    $scope.color = 'md-warn';

    $scope.category_icon = 'keyboard_arrow_right';
    $scope.all_category_icon = 'keyboard_arrow_right';

    $scope.setColor = function (index){
      if (index == 0){
        return 'material-blue';
      }
      else if(index == 1) {
        return 'material-indigo';
      }
      else if(index == 2){
        return 'material-blue-grey'
      }
      else {
        return 'material-deep-purple';
      }
    };

    $scope.articles = Articles.list.query();
    $scope.articles.$promise.then(function() {
      $timeout(function(){
        console.log($scope.show_loading = false);
      });
    })
  }
]);

kompresControllers.controller('ArticleDetailCtrl', ['$scope', '$route', '$routeParams', '$resource', 'Articles',
  function($scope, $route, $routeParams, $resource, Articles) {
    $scope.$route = $route;
    $scope.params = $routeParams;
    $scope.article_name = $scope.params.article_name.replace(/-/g,' ');
    $scope.article = Articles.detail.query({article_name:$scope.article_name});
    $scope.article.$promise.then(function() {
      var url = $scope.article.results[0].main_image+'?format=json';
      $scope.main_image = $resource(url).get();
    });
  }
]);

kompresControllers.controller('ArticleRepeatCtrl', ['$scope', '$resource', '$exceptionHandler', 'PostCategory',
  function($scope, $resource, $exceptionHandler, PostCategory) {
    var init = function() {
      if (typeof $scope.article === "undefined") {
        $exceptionHandler("The ArticleRepeatController must be initialized with a article in scope");
      }
      $scope.articleInRepeat = $scope.article;
      if($scope.article.short_description.length > 90){
        $scope.article_short_description = $scope.article.short_description.substring(0,90) + ' ...';
      }
      else{
        $scope.article_short_description = $scope.article.short_description;
      }
      PostCategory.addCategory($scope.article.category);
      $scope.main_image = $resource($scope.articleInRepeat.main_image).get();
    };

    init();
  }
]);

kompresControllers.controller('VisitsCtrl', ['$scope', 'Visits',
  function($scope, Visits) {
    $scope.visits = Visits.query();
  }
]);

kompresControllers.controller('ReportsCtrl', ['$scope', 'Reports',
  function($scope, Reports) {
    $scope.reports = Reports.query();
  }
]);

kompresControllers.controller('UsersCtrl', ['$scope', 'Users',
  function($scope, Users) {
    $scope.users = Users.query();
  }
]);

kompresControllers.controller('ReportImagesCtrl', ['$scope', 'ReportImages',
  function($scope, ReportImages) {
    $scope.report_images = ReportImages.query();
  }
]);

kompresControllers.controller('ImagesCtrl', ['$scope', 'Images',
  function($scope, Images) {
    $scope.images = Images.query();
  }
]);

kompresControllers.controller('ArticleMainImages', ['$scope', 'ArticleMainImages',
  function($scope, ArticleMainImages) {
    $scope.article_main_images = ArticleMainImages.query();
  }
]);

kompresControllers.controller('TravelDestinationMainImagesCtrl', ['$scope', 'TravelDestinationMainImages',
  function($scope, TravelDestinationMainImages) {
    $scope.travel_destination_main_images = TravelDestinationMainImages.query();
  }
]);

kompresControllers.controller('TravelDestinationWhatToDoImagesCtrl', ['$scope', 'TravelDestinationWhatToDoImages',
  function($scope, TravelDestinationWhatToDoImages) {
    $scope.travel_destination_what_to_do_images = TravelDestinationWhatToDoImages.query();
  }
]);

kompresControllers.controller('TravelDestinationWhatToDoImagesCtrl', ['$scope', 'TravelDestinationWhatToDoImages',
  function($scope, TravelDestinationWhatToDoImages) {
    $scope.travel_destination_what_to_do_images = TravelDestinationWhatToDoImages.query();
  }
]);

kompresControllers.controller('PageCtrl', ['$scope', 'Page',
  function($scope, Page) {
    $scope.page = Page.query();
  }
]);