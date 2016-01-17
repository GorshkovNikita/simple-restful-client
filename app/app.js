var app = angular.module('myApp', ['ngRoute', 'ngCookies', 'ngResource']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        controller: UserController,
        controllerAs: 'users',
        templateUrl: 'templates/users.html'
    });

    $routeProvider.when('/posts', {
        controller: PostController,
        controllerAs: 'posts',
        templateUrl: 'templates/posts.html'
    });

    $routeProvider.when('/login', {
        controller: LoginController,
        controllerAs: 'login',
        templateUrl: 'templates/login.html'
    });
}]);

app.constant('constants', {
    baseURL: 'http://localhost:8080/',
    client_id: 'my-trusted-client',
    client_secret: 'trust'
});

app.factory('Users', ['$resource', '$cookies', 'constants', function ($resource, $cookies, constants) {
    return $resource(constants.baseURL + 'service/users/:id', {},
        {
        getCurrentUser: {
            url: constants.baseURL + 'service/current-user',
            method: 'GET'
        }
    });
}]);

app.factory('Posts', ['$resource', '$cookies', 'constants', function ($resource, $cookies, constants) {
    return $resource(constants.baseURL + 'service/posts/:id');
}]);

app.factory('Login', ['$resource', 'constants', function($resource, constants) {
    return $resource(constants.baseURL + 'oauth/token', {}, {
            getToken: {
                method: 'POST',
                params: {
                    grant_type: 'password',
                    client_id: constants.client_id,
                    client_secret: constants.client_secret,
                    username: '@username',
                    password: '@password'
                }
            }
        });
}]);

var UserController = function ($scope, $http, $location, $cookies, $rootScope, Users) {
    $scope.getUser = function (id) {
        $scope.user = Users.get({
                id: id,
                access_token: $cookies.get('access_token')
            }).$promise.then(
                function(user) {
                    $scope.user = user;
                },
                function() {
                    $location.url('login');
                    $rootScope.user = {};
                }
            );
    };

    $scope.getAllUsers = function () {
        Users.query({ access_token: $cookies.get('access_token') }).$promise.then(
            function(users) {
                $scope.users = users;
            },
            function() {
                $location.url('login');
                $rootScope.user = {};
            }
        );
    };

    $scope.getAllUsers();

    $scope.$on('$destroy', function() {
        // при переходе на другой путь объект контроллера уничтожается
        // alert("controller user was destroyed");
    });
};

var PostController = function ($scope, $http, $location, $cookies, $rootScope, Posts) {
    $scope.getPost = function (id) {
        Posts.get({ id: id, access_token: $cookies.get('access_token') }).$promise.then(
            function(post) {
                $scope.post = post;
            },
            function() {
                $location.url('login');
                $rootScope.user = {};
            }
        );
    };

    $scope.getAllPosts = function () {
        Posts.query({access_token: $cookies.get('access_token') }).$promise.then(
            function(posts) {
                $scope.posts = posts;
            },
            function() {
                $location.url('login');
                $rootScope.user = {};
            }
        );
    };

    $scope.getAllPosts();

    $scope.$on('$destroy', function iVeBeenDismissed() {
        // при переходе на другой путь объект контроллера уничтожается
        // alert("controller post was destroyed");
    });
};

var LoginController = function ($scope, $http, $cookies, $location, $rootScope, constants, Login, Users) {
    $scope.username = 'nikita';
    $scope.passsword ='';
    $scope.wrong = false;
    $scope.msg = 'Неверный логин или пароль';

    $scope.getAccessToken = function() {
        Login.getToken({
                username: $scope.username,
                password: $scope.password
            },
            function (response) {
                //alert(response.access_token);
                $cookies.put('access_token', response.access_token);
                $rootScope.user = Users.getCurrentUser({access_token: response.access_token});
                $scope.wrong = false;
            },
            function (response) {
                $scope.wrong = true;
                //alert('Ошибка' + response.status + ' ' + $scope.msg);
            }
        );
    };
};