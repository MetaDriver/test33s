/**
 * Created by _BOB_ on 01.04.2015.
 */
'use strict'

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
            $scope.cloneX = getWindowOffset($scope.cloneImg, 'offsetLeft');
            $scope.cloneY = getWindowOffset($scope.cloneImg, 'offsetTop');

            $scope.targetX = getWindowOffset($scope.targetPlace, 'offsetLeft') +
               (pp.storage.previewList.length+1) % 4 * 50;
            $scope.targetY = getWindowOffset($scope.targetPlace, 'offsetTop') +
               Math.floor((pp.storage.previewList.length) / 4) * 50;

            $scope.sourceX = getWindowOffset($scope.sourceImg, 'offsetLeft');
            $scope.sourceY = getWindowOffset($scope.sourceImg, 'offsetTop');

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
                  pp.$apply();
               }, 250);
               $timeout(function(){
                  pp.sourceShow = true;
                  pp.$apply();
                  pp.noAnimate = false;
                  $scope.dragOn = false;
               }, 550);

               pp.$apply();
            }
            function dragComplete() {
               pp.noAnimate = false;
               $scope.dX = - $scope.offsetX -74 +
                  pp.storage.previewList.length%4*50;
               $scope.dY =  - $scope.offsetY -74;
               $scope.scale = 0.2;
               $scope.cloneStyles = staticStyles;
               pp.sbLighter = 0;
               pp.$apply();
               $timeout(function(){
                  pp.addPreview();
//                  pp.sourceShow = true;
               }, 500);
               $timeout(function(){
//                     pp.addPreview();
                  pp.sourceShow = true;
                  $scope.dragOn = false;
               }, 800);
            }

         function getWindowOffset(element, field){
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

   .controller('test_2_Ctrl', ['$scope', '$localStorage', 'timeSens', '$filter', '$timeout', '$locale',
      function($scope, $localStorage, timeSens, $filter, $timeout, $locale) {
         var ss = $scope.storage = $localStorage;
         $scope.newTask = function () {
            var current = new Date();
            return {
               taskText: '',
               taskStart: current,
               taskEnd: null, // $filter('date')(new Date(current+timeSens.msInDay),'dd.MM.yyyy'),
               taskDone: 0
            };
         };
         $scope.task = angular.copy($scope.newTask());
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
            task.taskStart *= 1; // храним в числовом виде

          // обрабатывает перестановку месяца и даты, когда оба они меньше или равны 12
//
//            var dd,MM,te = task.taskEnd;
//            if(((dd = te.getDate()) < 13) && ((MM = te.getMonth()) < 12) && MM)
//            task.taskEnd = (new Date(te.setDate(MM+1))).setMonth(dd-1);

          // постим
            ss.todoList.push(task);
          // сортируем
            ss.todoList = $filter('orderBy')(ss.todoList,['taskDone','taskEnd','-taskStart','text']);
          // обновляем форму
            $scope.task = $scope.newTask();
         };


         $scope.deleteTask = function (n) {
            $scope.storage.todoList.splice(n, 1);
         };
         $scope.taskStatus = function (n) {
            if (ss.todoList[n].taskDone) return 'done';
            var current = (new Date()); // создаём переводим в число
            var tEdn = ss.todoList[n].taskEnd;
            current-=current%timeSens.msInDay; // округляем дату
            return tEdn < current ? 'dead' : null;  // dead, если последний день или просрочено
         };

//         $locale.id = 'ru-ru';
         $locale.DATETIME_FORMATS = {
            MONTH:
               'Январь,Февраль,Март,Апрель,Май,Июнь,Июль,Август,Сентябрь,Октябрь,Ноябрь,Декабрь'
                  .split(','),
                  SHORTMONTH:  'Янв,Фев,Мар,Апр,Мая,Июн,Июл,Авг,Сен,Окт,Ноя,Дек'.split(','),
               DAY: 'Воскресенье,Понедельник,Вторник,Среда,Четверг,Пятница,Суббота'.split(','),
               SHORTDAY: 'Вс,Пн,Вт,Ср,Чт,Пт,Сб'.split(','),
               AMPMS: ['до полудня','после полудня'],
               medium: 'MMM d, y h:mm:ss a',
               'short': 'M/d/yy h:mm a',
               fullDate: 'EEEE, MMMM d, y',
               longDate: 'MMMM d, y',
               mediumDate: 'MMM d, y',
               shortDate: 'M/d/yy',
               mediumTime: 'h:mm:ss a',
               shortTime: 'h:mm a',
               ERANAMES: [
               "до Нашей Эры",
               "Нашей Эры"
            ],
               ERAS: [
               "BC",
               "AD"
            ]
         };

         /************************* datePicker **************************/

         $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
         };

         $scope.dateOptions = {
            formatMonth:'MMMM',
            formatYear: 'yyyy',
            startingDay: 1,
            showWeeks: "false"
         };

         $scope.format = 'dd.MM.yyyy HH:mm';

/********************************* Парсинг ***********************************/

         var tcDelay = null; // promise для обнуления в случае быстрого ввода, чтоб часто не парсить

         $scope.taskChange = function() {  // отслеживание изменения текста таска
            return;  // пока отключаем, чтоб закоммитить работоспособное приложение.
            console.log('taskChange !');
            var sensResult = null;
            if (tcDelay) $timeout.cancel(tcDelay);
            tcDelay = $timeout(function() {
               if(sensResult = timeSens.getSensTime($scope.task.taskText)) {
                  $scope.task.taskEnd = sensResult;
                  tcDelay = null;
               }
            }, 400);
         };
         $scope.timeChange = function() {  // отслеживание ручного изменения дедлайна
         };
      }
])
/************** распознавалка **************************/
   .factory('timeSens', function() {

      var msInHour = 1000*60*60;
      var msInDay = msInHour*24;
      var msInWeek = msInDay*7;
      function Token(s) {
         this.term = null;
         this.type = null;
         this.value = null;
         this.source = angular.copy(s);
      }
      Token.prototype.preLex = function() {
         // берёт строку и удаляет всё ненужное
         switch (this.source) {
            case ':':
            case '.': return false; // удаляем одиночные точки и двоеточия
            default: {
               // удаляем все строки содержащие комбинации примыкающих букв и цифр

//               if(this.source.search(/\d\w|\w\d/)!=-1) return false;
//               if(this.source.search(/\d\w|\w\d/)!=-1) return false;
//               if(this.source.search(/\d\w/)!=-1) return false;
               // удаляем точки и двоеточия в начале строке
//               while(this.source.search(/^\.+\d|^\:+\d|^\.+\w|^\:+\w/) != -1)
//                  {this.source = this.source.slice(1);}
//               // удаляем точки и двоеточия на конце
//               while(this.source.search(/\w\.+$|\w\:+$|\d\.$|\d\:/) == this.source.length-1)
//                  {this.source = this.source.slice(-1)};
            }
         }
         return true;
      };
      Token.prototype.weekDays = [
         'воскресенье,воскр',
         'понедельник,понед,пон',
         'вторник,вт,',
         'среду,ср',
         'четверг,четв,',
         'пятницу,пт,пятн',
         'субботу,суб,сб'
      ];
      Token.prototype.month = [
         'января','февраля','марта','япреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'
      ];
      Token.prototype.relativeDays = [
         'сегодня','завтра','послезавтра'
      ];
      Token.prototype.sensMonth = function(s) {
//         var
      };
      Token.prototype.sensRelativeDay = function(s) {
//         var rd
      };
      Token.prototype.sensTime = function() {
         return null;
      };

      function lexer(sa) {
         var token = new Token(sa);
         if(!token.preLex()) return null;

         return token;
      }

      function parse(tokens) {
         var now = new Date();
         var curY = now.getFullYear(); // XXXX
         var curM = now.getMonth(); // 0 - 11
         var curD = now.getDate();  // 1 - 31
         var curWD = now.getDay();  // 0 - 6
         var curH = now.getHours(); // 0 - 23
         var curm = now.getMinutes(); // 0 - 59
//         tokens = tokens;
// парсим
         return null;
      }

      return {
         msInDay: msInDay,
         getSensTime: function(inpText) {
            var delims = /[^\.\:\wа-я]/g; // разделители
// готовим строку : переводим в набор лексем и распознаём лексемы
            var tokens =
               inpText.toLowerCase()
                  .replace(/\. | \.|\: | \: /g,' ') // заменяем комбинации точек и двоеточий с пробелами на пробелы
                  .split(delims)  // сплитим и удаляем разделители
                  .map(function(s) { return lexer(s) })  // лексим
                  .filter(function(v){return!!v;});  // удаляем пустоты
            console.log('tokens =',tokens);
// отправляем массив парсеру;  // out => массив Date's
            var parseResult = parse(tokens);
// если массив не нулевой - возвращаем наибольшую дату, иначе null
            return (parseResult && parseResult.length) ? parseResult.sort().pop() : null;
         }
      };

   })



; //********** END module  my33app  **************************/