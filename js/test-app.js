/**
 * Created by _BOB_ on 01.04.2015.
 */

angular.module('my33app',
[
   'ngAnimate',
   'ui.bootstrap',
//   'ngDraggable',
   'ngStorage'
])
   .controller('tabsCtrl', ['$scope', '$localStorage',
      function($scope, $localStorage){
         $scope.$storage = $localStorage.$default({
            tabs: [{active:true},{active:false}],
            previewList: [],
            sBarShow: false,
            todoList: []
         });
//         $scope.selectTab = function(n) {
//            $scope.$storage.tabs[n].active = true;
//         }
}])
   .controller('test_1_Ctrl', ['$scope', '$element', '$timeout', '$localStorage',
      function($scope, $element, $timeout, $localStorage) {
         $scope.storage = $localStorage;
         $scope.ddHandlerOn = false;
//         $scope.sBarShowComplete = false;
         $scope.sourceShow = true;
         $scope.srcTrans = '';

         $scope.sbLighter = 0;
         $scope.winHeight = $( window ).height() - 42;
         $scope.winWidth = $( window ).width();
         var collapsedToSmall = function() {
            return ($scope.winWidth < 400) || ($scope.winHeight < 400);
         };
         $scope.small = false;
         $timeout(function() { $scope.small = collapsedToSmall(); $scope.$apply(); }, 500);
         console.log('$scope.winHeight = ', $scope.winHeight);
         console.log('$scope.winWidth = ', $scope.winWidth);
         console.log('$scope.small = ', $scope.small);
         console.log('$scope.storage.sBarShow = ', $scope.storage.sBarShow);

         $scope.clientSize = function (){
            $scope.winHeight = $( window ).height() - 42;
            $scope.winWidth = $( window ).width();
            $scope.small = collapsedToSmall();
            $scope.$apply();
         };
//         $scope.clientSize();
         $(window).resize($scope.clientSize);


         $scope.addPreview = function() {
            $scope.storage.previewList.push({ hidden: false });
         };

         $scope.clearList = function() {
            $scope.storage.previewList = [];
         }
//         function fillList(n) {  for(var i = 0; i<n; i++) $scope.addPreview(); }

         $scope.delView = function(n){
            $scope.storage.previewList[n].hidden = true;
            $timeout(function() { $scope.storage.previewList.splice(n,1) }, 800);
         };
//         fillList(4);

         $scope.sideBarShow = function() {
            $scope.storage.sBarShow = true;
            // запускаем
//            $scope.$apply();
//            $timeout(function(){
//               $scope.sBarShowComplete = true;
////               $scope.$apply();
//            },900);
         };
      }
   ])

   .controller('ddCtrl', ['$scope', '$element','$window','$timeout',
      function($scope, $element, $window, $timeout) {
         $scope.sourceImg = $('#sourceImg');

//         $timeout(init(), 500);

         $scope.dragOn = false;

         function dragStart(event) {
            if (event.which !== 1 || $scope.$parent.small || !$scope.$parent.storage.sBarShow) return;

            init();

            $scope.startX = event.clientX;
            $scope.startY = event.clientY;

//            $scope.offsPointX = $scope.sourceX+100 - event.clientX;
//            $scope.offsPointY = $scope.sourceY+100 - event.clientY;

            $scope.zoomPX = 1; // - $scope.offsPointX  / $scope.offsetX;   временно отключаю зум
            $scope.zoomPY = 1; // - $scope.offsPointY  / $scope.offsetY;   потом включить!

//            $scope.targetX = $scope.$parent.winWidth - $scope.startX -
//               195 + $scope.$parent.previewList.length % 4 * 50;
//            $scope.targetY = 120 + Math.floor($scope.$parent.previewList.length / 4) * 50 - $scope.startY;

            $scope.dZoom = 0.6 / $scope.offsetX;

            $scope.dragOn = true;
//            console.log('$scope.sBarShow = ', $scope.sBarShow);
//            console.log('$scope.offsetX = ', $scope.offsetX);
//            console.log('$scope.offsetY = ', $scope.offsetY);
//            console.log('$scope.dX = ', $scope.dX);
//            console.log('$scope.dY = ', $scope.dY);
//            console.log('$element = ', $element);
            return false;
         }
//         $element.on('mousedown', dragStart);
         if(!$scope.$parent.ddHandlerOn) {
            $scope.sourceImg.on('mousedown', dragStart);
            $scope.$parent.ddHandlerOn = true;
         }

         function init() {
            $scope.targetX = getOffset($element, 'offsetLeft');
//            $scope.targetX+=-100+$scope.previewList%4*50;
            $scope.targetY = getOffset($element, 'offsetTop');
            $scope.sourceX = getOffset($scope.sourceImg, 'offsetLeft');
            $scope.sourceY = getOffset($scope.sourceImg, 'offsetTop');

            $scope.trueOffsetX = $scope.sourceX - $scope.targetX + 2; // + (77+$scope.$parent.storage.previewList.length%4*50)
            $scope.offsetX = $scope.sourceX - $scope.$parent.winWidth + 204;
//            $scope.offsetY = $scope.sourceY - $scope.targetY + 2;
            $scope.offsetY = $scope.sourceY - $scope.targetY + 2 -
               (($scope.$parent.storage.previewList.length % 4) > 0) * 50;
//            (77+$scope.$parent.storage.previewList.length%4*50)



            $scope.dX = 0;
            $scope.dY = 0;
            $scope.scale = 1;
            $scope.dZoom = 0;
            var
               dragStyles = 'transition:none;opacity:0.85;box-shadow:4px 4px 1px 0 hsla(0,0%,50%,0.6);cursor:move;',
               staticStyles = 'transition:all ease 0.6s;opacity:1;box-shadow:none;cursor:default;';
            $scope.cloneStyles =   staticStyles;

            // оригинал исчезает
//            $scope.$parent.srcTrans = 'transition:none';
            $scope.$parent.sourceShow = false;
            $scope.$parent.$apply();

            function dragMove(event) {
               if (!$scope.dragOn) return;
               $scope.dX = event.clientX - $scope.startX;
               $scope.dY = event.clientY - $scope.startY;

               $scope.scale = ($scope.dX > 0) ? 1.0 + $scope.dZoom * $scope.dX : 1;
//               $scope.poX = ($scope.dX > 0) ? $scope.zoomPX * $scope.dX : 0;
//               $scope.poY = ($scope.dX > 0) ? $scope.zoomPY * $scope.dX : 0;
               $scope.poX =  0;
               $scope.poY =  0;

//               $scope.scale = ($scope.dX > 0) ? 1.0 + $scope.dZoom * $scope.dX : 1;

               $scope.$parent.sbLighter =
                  ($scope.$parent.winWidth - event.clientX) < 200 ? 50 : 0;
//
//               console.log('$scope.$parent.sbLighter = ', $scope.$parent.sbLighter);
//               console.log('$scope.$parent.winWidth = ', $scope.$parent.winWidth);
//               console.log('event.clientX = ', event.clientX);

               $scope.cloneStyles = dragStyles;

               $scope.$parent.sourceShow = false;

               $scope.$parent.$apply();
               return false;
            }

            function dragEnd(event) {
               if (!$scope.dragOn) return;
               $scope.dragOn = false;
               $(window).off('mousemove', dragMove);
               $(window).off('mouseup', dragEnd);
               if ($scope.$parent.winWidth - event.clientX > 200) {
                  dragCancel()
               } else {
                  dragComplete()
               }
            }
            function dragCancel() {
               $scope.dX = 0;
               $scope.dY = 0;
               $scope.scale = 1;

               $scope.cloneStyles = staticStyles;
               $scope.$parent.sbLighter = 0;
//               $scope.sourceShow = true;
               $scope.$parent.sourceShow = true;

//               $scope.sBarShowComplete = false;
//               $scope.sourceImg.css({transform: 'matrix3d({{scale}},0,0,0, 0,{{scale}},0,0, 0,0,1,0, {{offsetX + dX - poX}},{{offsetY + dY - poY}},0,1)'});
               $scope.$parent.$apply();
//               $scope.sourceImg.css();
            }
            function dragComplete() {
               $scope.dX = - $scope.offsetX-77+$scope.$parent.storage.previewList.length%4*50;
               $scope.dY =  - $scope.offsetY -127;
               $scope.scale = 0.2;

               $scope.cloneStyles = staticStyles;
               $timeout(function(){

                  $scope.$parent.sbLighter = 0;
                  $scope.$parent.sourceShow = true;
//                  $scope.sBarShowComplete = false;


                  $scope.$parent.$apply();
               }, 100);

               $scope.$parent.addPreview();
//                  init();
               $scope.$parent.$apply();
            }

//         $element.on('mousemove', dragMove);
//         $(window).on('mousedrag', dragMove);


            $(window).on('mousemove', dragMove);
            $(window).on('mouseup', dragEnd);
         } // end init()


//         $timeout(init,500);
         function getOffset(element, field){
            var offs = 0, el = element[0];
            console.log(element);
            do {
               offs += el[field];
               el = el.offsetParent;
            } while (el);

            console.log(field, offs);
            return offs;
         }
      }
   ])

   .controller('test_2_Ctrl', ['$scope', '$localStorage',
      function($scope, $localStorage) {
         $scope.storage = $localStorage;
         $scope.newTask = function() {
            var current = new Date();
            return {
               taskText: '',
               taskStart: current,
               taskEnd: current,
               taskDone: false
            };
         };
         $scope.task = angular.copy($scope.newTask());
         $scope.reverseList = false;
//         $scope.todoList = [];
         $scope.addTask = function() {
            var task = angular.copy($scope.task);
            $scope.storage.todoList.unshift(task);
            $scope.task = $scope.newTask();

//            console.log(angular.toJson($scope.storage.todoList[0].taskEnd));
//            console.log(angular.toJson((new Date())));
//            console.log($scope.taskStatus(0));
         };
         $scope.deleteTask = function(n) {
            $scope.storage.todoList.splice(n,1);
         };
         $scope.taskStatus = function(n) {
            var current = new Date();
            if($scope.storage.todoList[n].taskDone) return 'done';
            return (angular.toJson($scope.storage.todoList[n].taskEnd) < angular.toJson(current)) ? 'dead' : null;
         };
//         console.log(angular.toJson($scope.storage.todoList[0].taskEnd));
//         console.log(angular.toJson((new Date())));
//         console.log($scope.taskStatus(0));
      }
   ])
//   .factory('storage',function($localStorage) {
//      return {};
//   })
;