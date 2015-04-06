/**
 * Created by _BOB_ on 01.04.2015.
 */

angular.module('my33app',
[
   'ngAnimate',
   'ui.bootstrap',
//   'ui.utils',
   'ngStorage'
])
   /****************** Контроллер табов (с инициализацией хранилища) ***************/
   .controller('tabsCtrl', ['$scope', '$localStorage',
      function($scope, $localStorage){
         $scope.$storage = $localStorage.$default({
            tabs: [{active:true},{active:false}],
            previewList: [],
            sBarShow: false,
            todoList: []
         });
      }
   ])

   /*****************  Задание 1  ********************/
   .controller('test_1_Ctrl', ['$scope', '$element', '$timeout', '$localStorage',
      function($scope, $element, $timeout, $localStorage) {
         $scope.storage = $localStorage;
         $scope.ddHandlerOn = false;  // флаг dragStart, для предотвращения повторного навешивания обработчика
         $scope.sourceShow = true;
         $scope.noAnimate = false; // ng-class для отключения анимации ng-show

         $scope.sbLighter = 0;  // флаг посветки сайдбара при перетаскивании

         $scope.winHeight = $( window ).height() - 42;
         $scope.winWidth = $( window ).width();
         var collapsedToSmall = function() {
            return ($scope.winWidth < 400) || ($scope.winHeight < 400);
         };
         $scope.small = false;
         $timeout(function() { $scope.small = collapsedToSmall(); $scope.$apply(); }, 500);
// Обработчик резайза
         $scope.clientSize = function (){
            $scope.winHeight = $( window ).height() - 42;
            $scope.winWidth = $( window ).width();
            $scope.small = collapsedToSmall();
            $scope.$apply();
         };
         $(window).resize($scope.clientSize);

// Утиль для работы со списком превью
         $scope.addPreview = function() {
            $scope.storage.previewList.push({ hidden: false });
         };
         $scope.clearList = function() {
            $scope.storage.previewList = [];
         };
         $scope.delView = function(n){
            $scope.storage.previewList[n].hidden = true;
            $scope.$apply();
            $timeout(function() { $scope.storage.previewList.splice(n,1) }, 800);
         };
      }
   ])

   .controller('ddCtrl', ['$scope', '$element','$window','$timeout',
      function($scope, $element, $window, $timeout) {
         $scope.cloneImg = $('#cloneImg');
         $scope.sourceImg = $('#sourceImg');
         $scope.targetPlace = $('#targetPlace');
         $scope.dragOn = false;
         var
            pp = $scope.$parent,
            dragStyles = 'transition:none;opacity:0.96;box-shadow:2px 2px 1px 0 hsla(0,0%,50%,0.6);cursor:move;',
            staticStyles = 'transition:all ease 0.6s;opacity:1;box-shadow:none;cursor:default;';

         function dragStart(event) {
            if (event.which !== 1 || $scope.$parent.small || !$scope.$parent.storage.sBarShow) return;
            init();
            $scope.startX = event.clientX;
            $scope.startY = event.clientY;
            $scope.dZoom = 0.4 / $scope.offsetX;
            $scope.cloneStyles = dragStyles;
            $scope.dragOn = true;
            return false;
         }

         function init() {
            $scope.cloneX = getOffset($scope.cloneImg, 'offsetLeft');
            $scope.cloneY = getOffset($scope.cloneImg, 'offsetTop');

            $scope.targetX = getOffset($scope.targetPlace, 'offsetLeft') +
               (pp.storage.previewList.length+1) % 4 * 50;
            $scope.targetY = getOffset($scope.targetPlace, 'offsetTop') +
               Math.floor((pp.storage.previewList.length) / 4) * 50;

            $scope.sourceX = getOffset($scope.sourceImg, 'offsetLeft');
            $scope.sourceY = getOffset($scope.sourceImg, 'offsetTop');

// Здесь можно сделать корректировку для файрфокса (отличается смещение на 2 пикс)
            $scope.offsetX = $scope.sourceX - pp.winWidth + 204;
            $scope.offsetY = $scope.sourceY - $scope.targetY + 2;

            $scope.dX = 0;
            $scope.dY = 0;
            $scope.scale = 1;
            $scope.dZoom = 0;

            // оригинал исчезает
            pp.noAnimate = true;
            pp.sourceShow = false;
            pp.$apply();

            $(window).on('mousemove', dragMove);
            $(window).on('mouseup', dragEnd);

         } // end init()

         function dragMove(event) {
               if (!$scope.dragOn) return;
               $scope.dX = event.clientX - $scope.startX;
               $scope.dY = event.clientY - $scope.startY;
               $scope.scale = ($scope.dX > 0) ? 1.0 + $scope.dZoom * $scope.dX : 1;
               pp.sbLighter =  (pp.winWidth - event.clientX) < 200 ? 50 : 0;
               pp.$apply();
               return false;
            }

            function dragEnd(event) {
               if (!$scope.dragOn) return;
               $(window).off('mousemove', dragMove);
               $(window).off('mouseup', dragEnd);
               if ($scope.$parent.winWidth - event.clientX > 200) {
                  dragCancel()
               } else {
                  dragComplete()
               }
            }
            function dragCancel() {
               $scope.dX = 3;
               $scope.dY = 3;
               $scope.scale = 1;

               $scope.cloneStyles = staticStyles;
               pp.sbLighter = 0;
               $timeout(function(){
                 $scope.dragOn = false;
                  pp.$apply();
               }, 250);
               $timeout(function(){
                  pp.sourceShow = true;
                  pp.$apply();
                  pp.noAnimate = false;
               }, 550);

               pp.$apply();
            }
            function dragComplete() {
               pp.noAnimate = false;
               $scope.dX = - $scope.offsetX -74 +
                  pp.storage.previewList.length%4*50;
               $scope.dY =  - $scope.offsetY -32;
               $scope.scale = 0.2;
               $scope.cloneStyles = staticStyles;
               pp.sbLighter = 0;
               $scope.$parent.$apply();
               $scope.dragOn = false;
               $timeout(function(){
                  pp.addPreview();
                  pp.sourceShow = true;
               }, 500);
            }

         function getOffset(element, field){
            var offs = 0, el = element[0];
//            console.log(element);
            do {
               offs += el[field];
               el = el.offsetParent;
            } while (el);
//            console.log(field, offs);
            return offs;
         }

         if(!$scope.$parent.ddHandlerOn) {
            $scope.sourceImg.on('mousedown', dragStart);
            $scope.$parent.ddHandlerOn = true;
         }
      }
   ])


   /************************* Задание 2  *******************************/

   .controller('test_2_Ctrl', ['$scope', '$localStorage', 'timeSens',
      function($scope, $localStorage, timeSens) {
         $scope.storage = $localStorage;
         $scope.newTask = function () {
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
         $scope.unSensMessage = '';

         $scope.addTask = function () {

//            var endDate = timeSens.getSensTime($scope.task.taskText);
//            if(!endDate) {
//               unSensMessage = 'Дата не распознана,\nвведите корректную дату завершения';
//               // временно:
//               alert(unSensMessage);
//               return;
//            }

            var task = angular.copy($scope.task);
            $scope.storage.todoList.unshift(task);
            $scope.task = $scope.newTask();
         };
         $scope.deleteTask = function (n) {
            $scope.storage.todoList.splice(n, 1);
         };
         $scope.taskStatus = function (n) {
            var current = new Date();
            if ($scope.storage.todoList[n].taskDone) return 'done';
            return (angular.toJson($scope.storage.todoList[n].taskEnd) < angular.toJson(current)) ? 'dead' : null;
         };
      }
   ])

   .factory('timeSens', function() {
      var msInDay = 1000*60*60*24;
      function sensWeekDay(inpText) {
         var wd = [
            'понедельник','вторник','среду','четверг','пятницу','субботу','воскресенье'
         ];

      }
      function sensMonth(inpText) {
         var mn = [
            'января','февраля','марта','япреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'
         ];
      }
      function sensRelativeDay(inpText) {
         var rd = [
            'сегодня','завтра','послезавтра','япреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'
         ];
      }

      function sensTime() {
         return null;
      }

      return {
         getSensTime: function(inpText) {
            return '';
         }
      };

   })



; //********** END module  my33app  **************************/