'use strict';

var app = angular.module('onlineVault', ['ui.router', 'ngPasswordStrength']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: ['docs', function(docs) {
                        return docs.getAll();
                    }]
                }
            })
            //.state('docs', {
            //    url: '/docs/{id}',
            //    templateUrl: '/docs.html',
            //    controller: 'DocsCtrl',
            //    resolve: {
            //        post: ['$stateParams', 'docs', function ($stateParams, docs) {
            //            return docs.get($stateParams.id);
            //        }]
            //    }
            //})
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            })
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            })
        ;

        $urlRouterProvider.otherwise('home');
    }
]);

app.factory('auth', ['$http', '$window', function ($http, $window) {
    var auth = {};

    auth.saveToken = function (token) {
        $window.localStorage['online-vault-token'] = token;
    }

    auth.getToken = function () {
        return $window.localStorage['online-vault-token'];
    }

    auth.isLoggedIn = function () {
        var token = auth.getToken();

        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    auth.currentUser = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    auth.validatePassword = function(userInput) {
        return $http.get('/validate/' + userInput + "_" + auth.currentUser())
            .success(function (data) {
                return data;
        });
    };

    auth.register = function (user) {
        return $http.post('/register', user).success(function (data) {
            auth.saveToken(data.token);
        })
    };

    auth.logIn = function (user) {
        return $http.post('/login', user).success(function (data) {
            auth.saveToken(data.token);
        })
    };

    auth.logOut = function () {
        $window.localStorage.removeItem('online-vault-token');
    }

    return auth;
}]);

app.factory('docs', ['$http', 'auth', function ($http, auth) {
    var o = {
        docs: []
    };

    o.get = function (id) {
        return $http.get('/docs/' + id)
            .then(function (res) {
                return res.data;
            });
    };

    o.getAll = function () {
        return $http.get('/docs').success(function (data) {
            angular.copy(data, o.docs);
        });
    };

    o.create = function (doc) {
        return $http.post('/docs', doc, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).success(function (data) {
            o.docs.push(data);
        });
    };

    return o;
}]);

app.controller('MainCtrl', [
    '$scope',
    'docs',
    'auth',
    function ($scope, docs, auth) {

        var tempDocIds = [];

        $scope.passwordVisible = false;
        $scope.docs = docs.docs;
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.getCurrentUser = auth.currentUser;
        $scope.tempDocIds = tempDocIds;

        $scope.addDoc = function () {
            if ($scope.documentType == 'document') {
                if (!$scope.title || $scope.title === '') {
                    return;
                }

                if (!$scope.content || $scope.content === '') {
                    return;
                }

                docs.create({
                    documentType: $scope.documentType,
                    title: $scope.title,
                    content: $scope.content
                });
                $scope.title = '';
                $scope.content = '';
            } else if ($scope.documentType == 'credentials') {
                if (!$scope.websiteName || $scope.websiteName === '') {
                    return;
                }

                if (!$scope.username || $scope.username === '') {
                    return;
                }

                if (!$scope.password || $scope.password == '') {

                }

                docs.create({
                    documentType: $scope.documentType,
                    websiteName: $scope.websiteName,
                    websiteUrl: $scope.websiteUrl,
                    username: $scope.username,
                    password: $scope.password
                });
                $scope.websiteName = '';
                $scope.websiteUrl = '';
                $scope.username = '';
                $scope.password = '';
            }
        };

        $scope.generatePassword = function () {
            var length = 20;
            var chars = "";
            var pass = "";

            if ($scope.characters.az == true) {
                chars = chars.concat("abcdefghijklmnopqrstuvwxyz");
            }

            if ($scope.characters.AZ == true) {
                chars = chars.concat("ABCDEFGHIJKLMNOPRSTUVWXYZ");
            }

            if ($scope.characters.numbers == true) {
                chars = chars.concat("0123456789");
            }

            if ($scope.characters.specials == true) {
                chars = chars.concat("!$%@#");
            }

            for (var x = 0; x < length; x++) {
                var i = Math.floor(Math.random() * chars.length);
                pass += chars.charAt(i);
            }

            $scope.password = pass;      

        };

        $scope.showHidePassword = function(){
            $scope.passwordVisible = !$scope.passwordVisible;
        }

        $scope.showHideDocument = function(passwordInput, docId) {
            auth.validatePassword(passwordInput)
                .then(function (res) {
                    if (res.data === true) {
                        if (tempDocIds[docId]) {
                            var currentStatus = tempDocIds[docId];
                            tempDocIds[docId] = !currentStatus;
                        } else {
                            tempDocIds[docId] = true;
                        }
                    } else {

                    }
                }
            );
        }

    }
]);

app.controller('DocsCtrl', [
    '$scope',
    '$stateParams',
    'docs',
    'auth',
    function ($scope, docs, doc, auth) {
        $scope.doc = doc;
        $scope.isLoggedIn = auth.isLoggedIn;
    }
]);

app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function ($scope, $state, auth) {
        $scope.user = {};

        $scope.register = function () {
            auth.register($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('home');
            });
        };

        $scope.logIn = function () {
            auth.logIn($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('home');
            });
        };
    }
]);

app.controller('NavCtrl', [
    '$scope',
    'auth',
    function ($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }
]);