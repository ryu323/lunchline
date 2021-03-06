// Controller for the main home list view
myApp.controller('listCtrl', function(distance, Data, $scope, Search, WaitOps) {
   $scope.data = [];
   $scope.userLocation = {};
   $scope.searchResult = {};
   $scope.searchData = {};

  // Function called when a wait time is reported.  Saves to session storage for refresh/back cases
  // and updates database.
  $scope.transferEvent = function(obj) {
    Data.clickedItem = obj;
    sessionStorage["tempStorage"] = JSON.stringify(obj);
  }

   // Order variable used for the sorting order
  $scope.order = function(predicate) {
    $scope.predicate = predicate;
    $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
  };

  $scope.orderByWait = function() {
    $scope.predicate = "restaurant.wait[restaurant.wait.length-1].waitColor[0]";
    $scope.reverse = !$scope.reverse;
    $scope.data.sort(function(itemA, itemB) {
      var al = itemA.restaurant.wait.length - 1;
      var bl = itemB.restaurant.wait.length - 1;
      var a = parseInt(itemA.restaurant.wait[al].waitColor[0])
      var b = parseInt(itemB.restaurant.wait[bl].waitColor[0])
      return b - a;
    });
  };

  // Main function on page load
  // Gets users geolocation, gets data from database, filters data for view
  $scope.pullFromDatabase = function() {
    var geoOptions = {
      maximumAge: 60000,
      timeout: 30000
    };
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log("received geolocation");
      $scope.userLocation = {
        lat: position.coords.latitude,
        long: position.coords.longitude
      };
      sessionStorage["tempStorage2"] = JSON.stringify($scope.userLocation);
      Data.userLoc = $scope.userLocation;
      
      Data.getData($scope.userLocation, function(fetchedData) {
        for(var i = 0; i < fetchedData.length; i++){
          var item = fetchedData[i];
          var now = new Date();
          var currentDay = now.getDay();
          var currentHour = parseInt("" + now.getHours() + now.getMinutes());
          var openNow = false;
          try {
            var restaurantHours = item.restaurant.hours.periods;
            for(var j = 0; j < restaurantHours.length; j++){
              if(restaurantHours[j].open.day === currentDay){
                var open = parseInt(restaurantHours[j].open.time);
                var close = parseInt(restaurantHours[j].close.time);
                if(currentHour >= open && currentHour <= close){
                  openNow = true;
                }
              }
            };
          } catch(err){ openNow = true; };
          var coords = {
            long: item.restaurant.loc[0],
            lat: item.restaurant.loc[1]
          };
          item.restaurant.dist = distance.calc($scope.userLocation, coords);
          item.restaurant.open = openNow;
        }
        $scope.data = fetchedData;
        $scope.contentLoading = false;
      });
    }, function(error){console.log(error);}, geoOptions);
  };

  $scope.getLatestWait = function(wait) {
    return WaitOps.getLatest(wait);
  };

  $scope.getTime = function(wait) {
    return WaitOps.getTimestamp(wait);
  };

  // Calls Google API and adds nearby places not yet in database
  $scope.addToDatabase = function() {
    // Makes sure user location is available before calling
    if(Object.keys($scope.userLocation).length > 0){
      Data.addData($scope.userLocation);
    } else {
      setTimeout($scope.addToDatabase, 1000);
    }
  };

  $scope.$root.getSearch = function () {
     $scope.data = [];
     Search.fetchData($scope.$root.searchData)
     .then(function(result) { 
        $scope.searchResult.restaurant = result;
        var destination = {
           lat: $scope.searchResult.restaurant.loc[1],
           long: $scope.searchResult.restaurant.loc[0]
        };
        $scope.searchResult.restaurant.dist = distance.calc($scope.userLocation, destination);
        $scope.searchResult.restaurant.open = $scope.searchResult.restaurant.hours.open_now;
        $scope.data[0] = $scope.searchResult;
        $scope.$root.searchData.searchInput = "";
        Data.clickedItem = $scope.data[0].restaurant;
     })
     .catch(function (error) {
        console.error(error);
        alert("Data not available for this location");
     })
  }

  // Call main post request to load data from database
  $scope.pullFromDatabase();

  // Request to ping Google maps to search for new locations
  // On a delay to wait for geolocation data from pullFromDatabase
  setTimeout($scope.addToDatabase, 100);

  // Sets default order to be ascending
  $scope.reverse = true;
  $scope.order('restaurant.dist');
  $scope.contentLoading = true;
});

