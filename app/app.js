var app = angular.module('myApp', ['ui.router', 'ngCookies', 'ngResource']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('users', {
            url: '/',
            templateUrl: 'templates/users.html',
            controller: UserController
        })
        .state('posts', {
            url: '/posts',
            templateUrl: 'templates/posts.html',
            controller: PostController
        })
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: LoginController
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
            getCurrentUser:
            {
                url: constants.baseURL + 'service/current-user',
                method: 'GET'
            }
        }
    );
}]);

app.factory('Posts', ['$resource', '$cookies', 'constants', function ($resource, $cookies, constants) {
    return $resource(constants.baseURL + 'service/posts/:id', {},
        {
            getMyPosts:
            {
                url: constants.baseURL + 'service/my-posts',
                method: 'GET',
                isArray: true
            }
        }
    );
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
            },
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
        Users.query({
                access_token: $cookies.get('access_token')
            },
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
        Posts.get({
                id: id,
                access_token: $cookies.get('access_token')
            },
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
        Posts.query({
                access_token: $cookies.get('access_token')
            },
            function(posts) {
                $scope.posts = posts;
            },
            function() {
                $location.url('login');
                $rootScope.user = {};
            }
        );
    };

    $scope.getMyPosts = function () {
        Posts.getMyPosts({
                access_token: $cookies.get('access_token')
            },
            function(posts) {
                $scope.posts = posts;
            },
            function() {
                $location.url('login');
                $rootScope.user = {};
            }
        );
    };

    if ($location.url().indexOf("my") > -1)
        $scope.getMyPosts();
    else
        $scope.getAllPosts();

    $scope.$on('$destroy', function() {
        // при переходе на другой путь объект контроллера уничтожается
        // alert("controller post was destroyed");
    });
};

var LoginController = function ($scope, $http, $cookies, $location, $rootScope, constants, Login, Users) {
    $scope.username = 'nikita';
    $scope.passsword ='';
    $scope.wrong = false;

    $scope.getAccessToken = function() {
        Login.getToken({
                username: $scope.username,
                password: $scope.password
            },
            function (response) {
                $cookies.put('access_token', response.access_token);
                $rootScope.user = Users.getCurrentUser({access_token: response.access_token});
                $location.url('/');
                $scope.wrong = false;
            },
            function (response) {
                $scope.wrong = true;
            }
        );
    };
};


// Конфиг роутинга для библиотеки ngRoute
//app.config(['$routeProvider', function ($routeProvider) {
//    $routeProvider.when('/', {
//        controller: UserController,
//        controllerAs: 'users',
//        templateUrl: 'templates/users.html'
//    });
//
//    $routeProvider.when('/posts', {
//        controller: PostController,
//        controllerAs: 'posts',
//        templateUrl: 'templates/posts.html'
//    });
//
//    $routeProvider.when('/login', {
//        controller: LoginController,
//        controllerAs: 'login',
//        templateUrl: 'templates/login.html'
//    });
//
//    $routeProvider.when('/my-posts', {
//        controller: PostController,
//        controllerAs: 'posts',
//        templateUrl: 'templates/posts.html'
//    });
//}]);
