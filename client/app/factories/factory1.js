myApp
  // Data factory: contains main post request for list of objects and storage of clicked on item
  .factory('Data', function($http) {

    var addData = function(userLoc) {
      $http({
        method: 'POST',
        url: '/api/add',
        data: userLoc
      });
    };

    var getData = function(userLoc, callback){
      $http({
        method: 'POST',
        url: '/api/get',
        data: userLoc
      }).then(function success(data) { 
          var collection = data.data.map(function(restaurant) {
            return {
              restaurant: restaurant
            };
          });
          callback(collection);
        },
        function error(response) {
          console.log("ERROR: ", response);
        });
    };
    
    // Storage of clicked item on listView so that restView can pull up data
    var clickedItem = {};
    // Storage of userLocation on listView so that restView can pull up location
    var userLoc = {};

    return {
      addData: addData,
      getData: getData,
      clickedItem: clickedItem,
      userLoc: userLoc
    }

  // Distance factory: calculates the distance of a lat/long from the user's lat/long
  }).factory('distance', function() {
    var calc = function(userLoc, destinLoc) {
      //Expects objects with properties 'lat & long'
      var lat1 = userLoc.lat,
        long1 = userLoc.long,
        lat2 = destinLoc.lat,
        long2 = destinLoc.long;
      var deg2rad = function(deg) {
        return deg * (Math.PI / 180)
      }
      var R = 6371; // Radius of Earth in meters
      var dLat = deg2rad(lat2 - lat1);
      var dLon = deg2rad(long2 - long1);
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = (R * c) * 0.621371;
      return Math.round(d * 10) / 10
    }

    return {
      calc: calc
    }
  // Update factory : updates the database on a reported restaurant wait time with put request
  }).factory('Update', function($http) {

    function updateWait(objToSend, callback) {
      $http({
        method: 'PUT',
        url: '/api/update',
        data: objToSend
      }).then(function successCallback(response) {
        callback(response.data);
      }, function errorCallback(response) {
        console.log('ERROR on Put Request!');
      });
    }

    return {
      updateWait: updateWait
    };

  }).factory('WaitOps', function() {


    var getLatest = function(wait) {
      var latest = wait.length-1;
      return wait[latest].waitColor;
    };

    var getTimestamp = function(wait) {
      var latest = wait.length-1;
      var date = moment(wait[latest].timestamp);
      return date.fromNow();
    };

    var getSlicedTime = function(timestamp) {
      var t = moment(timestamp).format("ddd, MMM Do, h:mm a");
      return t;
    };

    var getWaitColor = function(color) {
      var resultColor = "";
      switch(color) {
        case "0_green":
          resultColor = "#5cb85c";
          break;
        case "1_yellow":
          resultColor = "#f0ad4e";
          break;
        case "2_red":
          resultColor = "#d9534f";
          break;
        case "3_grey":
          resultColor = "#cccccc";
          break;
      }
      return resultColor;
    };

    return {
      getLatest: getLatest,
      getTimestamp: getTimestamp,
      getSlicedTime: getSlicedTime,
      getWaitColor: getWaitColor
    };

  }).factory("Search", function ($http) {

    var fetchData = function (input) {

      return $http({
        method: "POST",
        url: "/api/search",
        data: input
      }).then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.error(error);
      })
    }

    return {
      fetchData: fetchData
    }
  });

