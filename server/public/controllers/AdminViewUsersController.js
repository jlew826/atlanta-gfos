angular.module('app').controller('AdminViewUsersCtrl', function($http, $rootScope, $scope, $state, $stateParams) {
    $scope.obj = {};
    $scope.visitorList = null;
    $scope.ownerList = null;
    $scope.ownerList = null;
    $scope.userList = null;
    $scope.userType = $stateParams.account_type;
    $scope.selectedUser = null;

    $scope.otherProperties = null;
    $scope.query = '';
    $scope.order = 'name';
    $scope.asc = false;

    $scope.obj = {};
    $scope.filterVisitorOptions = ['username', 'email', 'logged_visits'];
    $scope.filterOwnerOptions = ['username', 'email', 'num_properties'];
    $scope.filterQuery = '';

    function loadUsers() {
        $http({ method: 'GET', url: '/api/visitors/'}).then(function success(res) {
            $scope.visitorList = res.data;
            if ($stateParams.account_type === 'Visitor') {
                $scope.userList = $scope.visitorList;
            }
        }, function error() {});

        $http({ method: 'GET', url: '/api/owners/'}).then(function success(res) {
            $scope.ownerList = res.data;
            if ($stateParams.account_type === 'Owner') {
                $scope.userList = $scope.ownerList;
            }
        }, function error() {});
    }

    $scope.selectedUser = null;
    loadUsers();

    function buildURI(attr, query) {
        var ret = '';
        if (!attr) {
            return ret;
        }

        ret += '?filter=' + attr + ':' + query;
        return ret;
    }

    $scope.filterBy = function(attr, query) {
        let ep = ($scope.userType === 'Visitor') ? 'visitors' : 'owners';
        $http({ method: 'GET', url: '/api/' + ep + '/' + buildURI(attr, query) }).then(function success(res) {
            $scope.userList = res.data;
        }, function error() {

        });
    }

    $scope.changeOrder = function(attr) {
        if (attr === $scope.order) {
            $scope.asc = !$scope.asc;
        } else {
            $scope.asc = true;
            $scope.order = attr;
        }
    }

    $scope.deleteVisitorHistory = function(visitor) {
        $http({ method: 'DELETE', url: '/api/visitors/' + visitor.username + '/visits'}).then(function success(res) {
            console.log('Deleted visitor history of ' + visitor.username);
            $scope.selectedUser = null;
            $scope.logDeleteSuccess = true;
            $scope.logDeleteError = false;

            loadUsers();
        }, function error() {
            $scope.logDeleteSuccess = false;
            $scope.logDeleteError = true;
        });
    }

    $scope.deleteUser = function(user) {
        $http({ method: 'DELETE', url: '/api/users/' + user.username}).then(function success(res) {
            console.log('Deleted account of ' + user.username);
            $scope.selectedUser = null;
            $scope.userDeleteSuccess = true;
            $scope.userDeleteError = false;

            loadUsers();
        }, function error() {
            $scope.userDeleteSuccess = false;
            $scope.userDeleteError = true;
        });
    }

    $scope.deleteOwnerAccount = function(owner) {

    }

    $scope.selectUserFromRow = function(user) {
        $scope.selectedUser = user;
    }

    $scope.logOut = function() {
        $rootScope.currentUser = null;
        $state.go('login');
    }
});
