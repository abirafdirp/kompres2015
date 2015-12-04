var kompresControllers = angular.module('kompresControllers', []);

kompresControllers.controller('NavCtrl', ['$scope', '$route', '$mdDialog', 'ArticleSearch', 'TravelDestinationSearch', '$mdSidenav',
  function($scope, $route, $mdDialog, ArticleSearch, TravelDestinationSearch, $mdSidenav) {
    $scope.$route = $route;
    $scope.logout_clicked = false;
    $scope.traveldestination_icon = 'terrain';
    $scope.article_icon = 'my_library_books';
    $scope.map_icon = 'directions';
    $scope.info_icon = 'info';
    $scope.transportation_icon = 'directions_bus';
    $scope.ArticleSearch = ArticleSearch;
    $scope.TravelDestinationSearch = TravelDestinationSearch;

    $scope.toggleMenu = function() {
      $mdSidenav('left').toggle();
    };

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

    $scope.showImage = function(image) {
      $mdDialog.show({
        locals: {image:image},
        template:
        '<md-dialog aria-label="galeri" class="resize-container">' +
        '     <img ng-src="{$ image $}" class="resize">' +
        '</md-dialog>',
        parent: angular.element(document.body),
        clickOutsideToClose:true,
        controller: function DialogController($scope, $mdDialog, image) {
          $scope.image = image;
          $scope.closeDialog = function() {
            $mdDialog.hide();
          }
        }
      });
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

kompresControllers.controller('TransportationListCtrl', ['$scope', 'Transportations', '$routeParams', '$resource',
  function($scope, Transportations, $routeParams, $resource) {
    $scope.params = $routeParams;
    $scope.transportation_search = '';
    $scope.search = $scope.params.search;
    $scope.transportations = Transportations.list.query(function(response){
      angular.forEach(response.results, function(transportation){
        transportation['districts_resolved'] = [];
        angular.forEach(transportation.districts, function(district){
          $resource(district).get(function(response){
            transportation.districts_resolved.push(response);
          });
        });
      });
    });
  }
]);

kompresControllers.controller('TransportationInDestCtrl', ['$scope', 'Transportations', '$routeParams', '$resource',
  function($scope, Transportations, $routeParams, $resource) {
    $scope.params = $routeParams;
    $scope.transportation_search = '';
    $scope.search = $scope.params.search;
    $scope.transportations = Transportations.in_district.query({district:$scope.$parent.district.name});
  }
]);

kompresControllers.controller('TransportationRepeatCtrl', ['$scope', '$resource', '$exceptionHandler',
  function($scope, $resource, $exceptionHandler) {
    var init = function() {
      if (typeof $scope.transportation === "undefined") {
        $exceptionHandler("The TransportationRepeatController must be initialized with a transportation in scope");
      }
      $scope.districts_resolved = [];
    };

    init();
  }
]);


kompresControllers.controller('TravelDestinationListCtrl', ['$scope', '$route', '$routeParams', '$resource', '$rootScope', 'TravelDestinations', 'Districts',
  'Provinces', 'Regions', 'Marker', 'djangoAuth',
  function($scope, $route, $routeParams, $resource, $rootScope, TravelDestinations, Districts, Provinces, Regions, Marker, djangoAuth) {
    $scope.$route = $route;
    $scope.params = $routeParams;
    $scope.show_loading = true;
    $scope.travel_destination_name = $scope.params.travel_destination_name;
    $scope.search = $scope.params.search;
    $scope.categories = [];

    $scope.$on('djangoAuth.profile_updated', function() {
      djangoAuth.profile().then(function(data){
        $scope.user = data;
        $resource($scope.user.district+'?format=json').get(function(data) {
          $scope.user.district = data;
          angular.forEach($scope.travel_destinations.results, function(item){
            item['distance'] = $rootScope.distance($scope.user.district.latitude, $scope.user.district.longitude, item.district_resolved.latitude, item.district_resolved.longitude);
          });
        });
      });
    });

    $scope.districts = Districts.list.query();
    $scope.provinces = Provinces.query();
    $scope.regions = Regions.query();

    $scope.category_icon = 'keyboard_arrow_right';
    $scope.all_category_icon = 'keyboard_arrow_right';

    $scope.travel_destinations = TravelDestinations.list.query();
    $scope.travel_destinations.$promise.then(function(){
      $scope.user = djangoAuth.profile().then(function(data){
            $scope.user = data;
            $resource($scope.user.district+'?format=json').get(function(data){
              $scope.user.district = data;
              angular.forEach($scope.travel_destinations.results, function(item){
                if ($rootScope.arrayContains($scope.categories, item.type) == false){
                  $scope.categories.push(String(item.type));
                }
                item['district_resolved'] = $resource(item.district).get(function(){
                  item['distance'] = $rootScope.distance($scope.user.district.latitude, $scope.user.district.longitude, item.district_resolved.latitude, item.district_resolved.longitude);
                  item['province'] = $resource(item.district_resolved.province).get(function(){
                    item['region'] = $resource(item.province.region).get();
                  });
                });
              });
            });
          },angular.forEach($scope.travel_destinations.results, function(item){
            if ($rootScope.arrayContains($scope.categories, item.type) == false){
              $scope.categories.push(String(item.type));
            }
            item['district_resolved'] = $resource(item.district).get(function(){
              //item['distance'] = $rootScope.distance($scope.user.district.latitude, $scope.user.district.longitude, item.district_resolved.latitude, item.district_resolved.longitude);
              item['province'] = $resource(item.district_resolved.province).get(function(){
                item['region'] = $resource(item.province.region).get();
              });
            });
          })
      );
      $scope.show_loading = false;
    });

  }
]);

kompresControllers.controller('TravelDestinationDetailCtrl', ['$scope', '$route', '$routeParams', 'TravelDestinations', '$resource', '$interval', '$mdDialog',
  'TravelDestinationSearch', '$location', 'Transportations',
  function($scope, $route, $routeParams, TravelDestinations, $resource, $interval, $mdDialog, TravelDestinationSearch, $location, Transportations) {
    $scope.$route = $route;
    $scope.params = $routeParams;
    $scope.travel_destination_name = $scope.params.travel_destination_name.replace(/-/g,' ');
    $scope.TravelDestinationSearch = TravelDestinationSearch;
    $scope.show_loading = true;

    $scope.current_url = $location.absUrl();

    $scope.travel_destination = TravelDestinations.detail.query({travel_destination_name:$scope.travel_destination_name});
    $scope.travel_destination.$promise.then(function() {
      var url = $scope.travel_destination.results[0].district+'?format=json';
      $scope.district = $resource(url).get(function(){
        $scope.transportations = Transportations.in_district.query({district:$scope.district.name});
        $scope.province = $resource($scope.district.province).get(function(){
          $scope.region = $resource($scope.province.region).get(function(){
            //showloading
          });
        });
      });

      $scope.images_length = $scope.travel_destination.results[0].images.length;
      $scope.main_images = [];
      $scope.gallery_images = [];
      angular.forEach($scope.travel_destination.results[0].images, function (image, index){
        $resource(image+'?format=json').get(function(image){
          if (image.type == 'main'){
            $scope.main_images.push(image);
          }
          if (image.type == 'gallery'){
            $scope.gallery_images.push(image);
          }
        });
        if (index == $scope.images_length - 1){
          $interval(function(){
            $scope.nextSlide();
          },5400,12);
        }
      });

      $scope.travel_destination_contents = [];
      angular.forEach($scope.travel_destination.results[0].contents, function(content, index){
        $scope.travel_destination_contents.push($resource(content+'?format=json').get());
        if (index == $scope.travel_destination.results.length - 1){
          $scope.show_loading = false;
        }
      });
    });

    $scope.currentIndex = 0;

    $scope.isCurrentSlideIndex = function (index) {
      return $scope.currentIndex === index;
    };

    $scope.nextSlide = function () {
      $scope.currentIndex = ($scope.currentIndex < $scope.main_images.length - 1) ? ++$scope.currentIndex : 0;
    };
  }
]);

kompresControllers.controller('TravelDestinationRepeatCtrl', ['$scope', '$resource', '$exceptionHandler', 'djangoAuth', '$rootScope',
  function($scope, $resource, $exceptionHandler, djangoAuth, $rootScope) {
    var init = function() {
      if (typeof $scope.travel_destination === "undefined") {
        $exceptionHandler("The TravelDestinationRepeatController must be initialized with a travel_destination in scope");
      }
      $scope.TravelDestinationInRepeat = $scope.travel_destination;
      if($scope.travel_destination.short_description.length > 180){
        $scope.travel_destination_short_description = $scope.travel_destination.short_description.substring(0,180) + ' ...';
      }
      else{
        $scope.travel_destination_short_description = $scope.travel_destination.short_description;
      }
      $scope.district = $resource($scope.travel_destination.district).get();
      $scope.thumbnail = $resource($scope.travel_destination.thumbnail).get();
    };

    init();
  }
]);

kompresControllers.controller('ArticleListCtrl', ['$scope', '$route', '$routeParams', '$resource', '$timeout', '$filter', 'Articles', 'PostCategory',
  'ColorRandomizer', '$rootScope',
  function($scope, $route, $routeParams, $resource, $timeout, $filter, Articles, PostCategory, ColorRandomizer, $rootScope) {
    $scope.$route = $route;
    $scope.params = $routeParams;
    $scope.show_loading = true;
    $scope.categories = PostCategory.getCategories();
    $scope.categories_colors = PostCategory.getColors();
    $scope.search = $scope.params.search;
    $scope.color = 'md-warn';

    $scope.category_icon = 'keyboard_arrow_right';
    $scope.all_category_icon = 'keyboard_arrow_right';

    $scope.articles = Articles.list.query();
    $scope.articles.$promise.then(function() {
      angular.forEach($scope.articles.results, function(item){
        item.date = $filter('date')(item.date, 'd  MMMM  yyyy');
        PostCategory.addCategory(item.category);
      });
      $scope.show_loading = false;
    });
  }
]);

kompresControllers.controller('ArticleDetailCtrl', ['$scope', '$route', '$routeParams', '$resource', 'Articles',
  function($scope, $route, $routeParams, $resource, Articles) {
    $scope.$route = $route;
    $scope.params = $routeParams;
    $scope.show_loading = true;
    $scope.article_name = $scope.params.article_name.replace(/-/g,' ');
    $scope.article = Articles.detail.query({article_name:$scope.article_name});
    $scope.article.$promise.then(function() {
      $scope.main_image = $resource($scope.article.results[0].main_image+'?format=json').get(function() {
        $scope.show_loading = false;
      });
    });
  }
]);

kompresControllers.controller('ArticleRepeatCtrl', ['$scope', '$resource', '$exceptionHandler', 'PostCategory',
  function($scope, $resource, $exceptionHandler,  PostCategory) {
    var init = function() {
      if (typeof $scope.article === "undefined") {
        $exceptionHandler("The ArticleRepeatController must be initialized with a article in scope");
      }
      $scope.articleInRepeat = $scope.article;
      $scope.show_loading = true;
      if($scope.article.short_description.length > 500){
        $scope.article_short_description = $scope.article.short_description.substring(0,500) + ' ...';
      }
      else{
        $scope.article_short_description = $scope.article.short_description;
      }
      $scope.thumbnail = $resource($scope.article.thumbnail).get(function() {
        $scope.show_loading = false;
      });
    };
    init();
  }
]);

kompresControllers.controller('ReportCtrl', ['$scope', '$mdDialog',
  function($scope, $mdDialog) {
    $scope.showReport = function(travel_destination) {
      $mdDialog.show({
        locals: {travel_destination_local: travel_destination},
        controller: DialogController,
        templateUrl: '/partials/report/',
        parent: angular.element(document.body),
        clickOutsideToClose:true,
      });
      function DialogController($scope, $mdDialog, Districts, Reports, TravelDestinations, $rootScope, Upload, travel_destination_local) {
        $scope.uploadCount = 0;
        $scope.travel_destination_local = travel_destination_local;
        $scope.upload = function (file, report) {
          Upload.upload({
            url: '/api/reportimages/',
            data: {'image': file, 'name': file.name, 'tag': 'report', 'report': report}
          }).then(function (resp) {
            $scope.uploadCount = $scope.uploadCount + 1;
            if ($scope.uploadCount == $scope.files.length){
              $scope.uploadCount = 0;
              $scope.complete = true;
              $scope.show_loading = false;
            }
            //console.log('Success ' + resp.config.data.image.name + 'uploaded. Response: ' + resp.data);
          }, function (resp) {
            //console.log('Error status: ' + resp.status);
          }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.image.name);
          });
        };
        $scope.uploadFiles = function (files, report) {
          if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
              $scope.upload(files[i], report);
            }
          }
        };
        $scope.uploadImages = function() {
          $scope.uploadFiles($scope.files, $scope.report);
        };


        $scope.authenticated = false;
        $scope.districts = Districts.list.query();
        $scope.travel_destination_names = [];
        $scope.complete = false;
        $scope.show_loading = false;
        $scope.travel_destinations = TravelDestinations.list.query(function(){
          angular.forEach($scope.travel_destinations.results, function(item){
            $scope.travel_destination_names.push(item.name.toLowerCase());
            item['name_lowercased']= item.name.toLowerCase();
          })
        });
        $scope.travel_destination_search = '';
        $scope.categories = ['keamanan', 'kebersihan', 'kenyamanan', 'lainnya'];
        $scope.closeDialog = function() {
          $mdDialog.hide();
        };
        $scope.searchSelectedChange = function(destination){
          $scope.newReport.travel_destination = '/api/traveldestinations/' + destination.id + '/';
        };
        $scope.searchTextChange = function(destination_name){
          if (destination_name){
            destination_name = destination_name.toLowerCase();
          }
          if($rootScope.arrayContains($scope.travel_destination_names, destination_name)){
            angular.forEach($scope.travel_destinations.results, function(item){
              if (item.name_lowercased == destination_name){
                $scope.newReport.travel_destination = '/api/traveldestinations/' + item.id + '/';
              }
            });
          }
          else{
            $scope.newReport.travel_destination = '';
          }
        };
        $scope.errors = [];
        $scope.newReport = new Reports();
        $scope.newReport.travel_destination = '/api/traveldestinations/' + travel_destination_local.id +'/';
        $scope.save = function() {
          $scope.show_loading = true;
          $scope.newReport.$save().then(function(result) {
                $scope.report = '/api/reports/' + result.id + '/';
                if ($scope.files){
                  $scope.uploadImages();
                }
                $scope.complete = true;
                $scope.show_loading = false;
              },
              function(data){
                $scope.errors = data.data;
                $scope.show_loading = false;
              })
        };
      }
    };
  }
]);

kompresControllers.controller('ReportListCtrl', ['$scope', 'Reports', 'djangoAuth', 'Users', '$resource',
  function($scope, Reports, djangoAuth, Users, $resource) {
    djangoAuth.profile().then(function(data){
      $scope.user = Users.detail.query({'username': data.username});
      $scope.user.$promise.then(function(){
        $scope.user = $scope.user.results[0];
        $scope.reports_resolved = [];
        angular.forEach($scope.user.reports, function(report){
          $resource(report + '?format=json').get(function(data){
            $scope.reports_resolved.push(data);
          });
        });
      });
    });
  }
]);

kompresControllers.controller('ReportListRepeatCtrl', ['$scope', '$resource', '$exceptionHandler',
  function($scope, $resource, $exceptionHandler) {
    var init = function() {
      if (typeof $scope.report === "undefined") {
        $exceptionHandler("The ReportListRepeatController must be initialized with a report in scope");
      }
      $scope.travel_destination = $resource($scope.report.travel_destination).get();
      if ($scope.report.images.length > 0){
        $scope.image = $resource($scope.report.images[0]).get();
      }
    };

    init();
  }
]);

kompresControllers.controller('VisitsCtrl', ['$scope', 'Visits',
  function($scope, Visits) {
    $scope.visits = Visits.query();
  }
]);

kompresControllers.controller('HomeCtrl', ['$scope', 'Visits', 'TravelDestinations', 'Articles', 'Page', '$resource', 'ColorRandomizer',
  function($scope, Visits, TravelDestinations, Articles, Page, $resource, ColorRandomizer) {
    $scope.travel_destination_counter = 0;
    $scope.icon = 'keyboard_arrow_right'

    Page.query(function(data){
      $scope.page = data.results[0];
      $scope.page.featured_travel_destinations = [];
      angular.forEach($scope.page.featureds, function(travel_destination){
        $resource(travel_destination).get(function(data){
          $resource(data.travel_destination).get(function(data){
            data.color = ColorRandomizer.getColor();
            $scope.page.featured_travel_destinations.push(data);
            $scope.travel_destination_counter += 1;
            if ($scope.travel_destination_counter == $scope.page.featureds.length){
              $scope.resolved = true;
            }
          });
        });
      });
    });
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

kompresControllers.controller('FacebookTokenCtrl', ['$scope', '$auth', 'djangoAuth', '$rootScope',
  function($scope, $auth, djangoAuth, $rootScope) {
    $scope.authenticate = function(){
      $auth.authenticate('facebook').then(function(response){
        djangoAuth.authenticated = true;
        $rootScope.$broadcast("djangoAuth.logged_in", response);
      });
    };
    $scope.logout = function () {
      $auth.removeToken();
      djangoAuth.authenticated = true;
      $rootScope.$broadcast("djangoAuth.logged_out");
    };
  }
]);

kompresControllers.controller('ReportImagesCtrl', ['$scope', 'ReportImages',
  function($scope, ReportImages) {
    $scope.report_images = ReportImages.query();
  }
]);

kompresApp.controller('ModelViewerCtrl', ['$scope', 'TravelDestinations', '$routeParams',
  function ($scope, TravelDestinations, $routeParams) {
    $scope.params = $routeParams;
    $scope.travel_destination_name = $scope.params.travel_destination_name.replace(/-/g,'%20');
    $scope.assimpModelUrl = 'partials/modelviewer/' + $scope.travel_destination_name + '/';
  }]);

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

kompresControllers.controller('TravelDestinationImagesCtrl', ['$scope', 'TravelDestinationImages',
  function($scope, TravelDestinationImages) {
    $scope.travel_destination_images = TravelDestinationImages.query();
  }
]);

kompresControllers.controller('PageCtrl', ['$scope', 'Page',
  function($scope, Page) {
    $scope.page = Page.query();
  }
]);

kompresControllers.controller('SearchCtrl', ['$scope', 'ArticleSearch', '$timeout', 'TravelDestinationSearch', '$routeParams',
  function($scope, ArticleSearch, $timeout, TravelDestinationSearch, $routeParams) {
    $scope.ArticleSearch = ArticleSearch;
    $scope.TravelDestinationSearch = TravelDestinationSearch;
    $scope.search_opened = false;
    $scope.search_icon = 'search';

    $scope.params = $routeParams;

    if ($scope.params.kategori){
      TravelDestinationSearch.setCategorySearch($scope.params.kategori);
    }


    $scope.toggleSearch = function (){
      $scope.search_opened = !$scope.search_opened;
      if ($scope.search_opened){
        $scope.search_icon = 'close';
      }
      else {
        $scope.search_icon = 'search';
      }
    };
  }
]);

kompresControllers.controller('MapCtrl', ['$scope', 'TravelDestinations', '$routeParams', '$resource', '$route',
  'travel_destinations', 'Marker', 'uiGmapGoogleMapApi', '$rootScope',
  function($scope, TravelDestinations, $routeParams, $resource, $route, travel_destinations, Marker, uiGmapGoogleMapApi, $rootScope) {
    $scope.map = {
      "center": {
        "latitude": -4.6111678,
        "longitude": 118.6796369
      },
      "zoom": 5
    };

    $scope.show_loading = true;
    uiGmapGoogleMapApi.then(function() {
      $scope.show_loading = false;
      $scope.travel_destination_names = [];
      angular.forEach($scope.travel_destinations.results, function (item) {
        $scope.travel_destination_names.push(item.name.toLowerCase());
        item['name_lowercased'] = item.name.toLowerCase();
      });
    });

    $scope.search = '';

    $scope.params = $routeParams;
    $scope.ltd = $scope.params.ltd;
    $scope.lng = $scope.params.lng;
    if (($scope.ltd) && ($scope.lng)){
      $scope.map.center.latitude = $scope.ltd;
      $scope.map.center.longitude = $scope.lng;
      $scope.map.zoom = 14;
    }

    $scope.searchSelectedChange = function(destination){
      $scope.map.center.latitude = destination.latitude;
      $scope.map.center.longitude = destination.longitude;
      $scope.map.zoom = 14;
    };

    $scope.searchTextChange = function(search){
      if (search) {
        search = search.toLowerCase();
      }
      if ($rootScope.arrayContains($scope.travel_destination_names, search)){
        angular.forEach($scope.travel_destinations.results, function(item){
          if (item.name_lowercased == search){
            $scope.map.center.latitude = item.latitude;
            $scope.map.center.longitude = item.longitude;
            $scope.map.zoom = 14;
          }
        });
      }
      else{
        search = '';
      }
    };

    $scope.markers = Marker.getMarkers();
    $scope.travel_destinations = travel_destinations;

  }
]);

