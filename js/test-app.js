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
         $scope.sensDate = 0;
         $scope.pickerDate = 0;
         $scope.tomorrow = new Date((new Date())*1+timeSens.msInDay/2);
//         $scope.evalDate = null;
         $scope.newTask = function () {
            var current = new Date();
            return {
               taskText: '',
               taskStart: current,
               taskEnd: $scope.tomorrow,
//               taskEnd: null, //
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
            task.taskStart *= 1; // храним в сторадже в числовом виде

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
//            return;  // пока отключаем, чтоб закоммитить работоспособное приложение.
//            console.log('taskChange !');
            var sensResult = null;
            if (tcDelay) $timeout.cancel(tcDelay);
            tcDelay = $timeout(function() {
               if(sensResult = timeSens.getSensTime($scope.task.taskText)) {
                  console.log('sensResult =',(new Date(sensResult)).toLocaleDateString());
                  $scope.sensDate = sensResult;
                  tcDelay = null;
//                  $scope.apply();
               }
            }, 400);
         };
         $scope.timeChange = function() {  // отслеживание ручного изменения дедлайна
//            $scope.task.taskEnd = $scope.sensDate > $scope.pickerDate ? $scope.sensDate :
//               $scope.pickerDate || 0;
         };
         $scope.$watch('sensDate+pickerDate',function(n,o){
            $scope.task.taskEnd = Math.max($scope.tomorrow, $scope.sensDate, $scope.pickerDate);
         });
      }
])
/************** распознавалка **************************/
   .factory('timeSens', function() {

      var msInHour = 1000*60*60;
      var msInDay = msInHour*24;
      var msInWeek = msInDay*7;
      var now = new Date();
      var today = new Date(now-now%msInDay-msInHour*3);
   //   today-=msInHour*3;
      now.setHours(now.getHours()-3);
      var curY = now.getFullYear(); // XXXX
      var curM = now.getMonth(); // 0 - 11
      var curD = now.getDate();  // 1 - 31
      var curWD = now.getDay();  // 0 - 6
      var curH = now.getHours(); // 0 - 23
      var curm = now.getMinutes(); // 0 - 59

      function Token(s) {
         this.pos=-1; // позиция в потоке
         this.term = null;
         this.type = null;
         this.category = null;  // precission, year, month, day
         this.value = null;
         this.valueString = '';  // для отладки в консоли
         this.source = angular.copy(s);
      }
      Token.prototype.preLex = function() {
         // берёт строку и удаляет всё ненужное
         switch (this.source) {
            case '':
            case ':':
            case '.': return false; // удаляем пустоты, одиночные точки и двоеточия
            default: {
               // удаляем все строки содержащие комбинации примыкающих букв и цифр
               if(this.source.search(/\d+[a-zа-я]+|[a-zа-я]+\d+/)!=-1) return false;
////               удаляем точки и двоеточия в начале строки
//               while(this.source.search(/^\.+[\wа-я]|^\:+[\wа-я]/) != -1)
//                  {this.source = this.source.slice(1);}
//               // удаляем точки и двоеточия на конце
//               while(this.source.search(/[\wа-я]\.+$|[\wа-я]\:+$/) == this.source.length-1)
//                  {this.source = this.source.slice(-1);}
            }
         }
         return true;
      };
      Token.prototype.relativeDays = [
         'сегодня','завтра','послезавтра'
      ];
      Token.prototype.weekDays = [
         'воскресенье,воскр.,вск.,вс.',
         'понедельник,понед.,пон.,пн.',
         'вторник,вторн.,вт.',
         'среду,ср.',
         'четверг,четв.,чт.',
         'пятницу,пятн.,пт.',
         'субботу,субб.,суб.,сб.'
      ];
      Token.prototype.month = [
         'января',
         'февраля',
         'марта',
         'япреля',
         'мая',
         'июня',
         'июля',
         'августа',
         'сентября',
         'октября',
         'ноября',
         'декабря'
      ];
      Token.prototype.sensMonth = function() {
        return false;
      };
      Token.prototype.sensRelativeDay = function() {
         for(var i=this.relativeDays.length-1; i>=0; i--)
            if(this.source.search(this.relativeDays[i])!==-1) {
               this.type = 'ttRDay';
               this.term = 1;
               this.value = today.setDate(curD+i);
               this.valueString = (new Date(this.value)).toLocaleString();
               return true;
            }
         return false;
      };
      Token.prototype.sensDay = function() {
         for(var i=this.weekDays.length-1; i>=0; i--) {
            var dd = this.weekDays[i].split(',');
            for (var j = dd.length - 1; j >= 0; j--) {
               if (this.source.search(dd[j]) !== -1) {
                  this.type = 'ttDay';
                  this.term = 1;
//                  var d = i;
                  this.value = new Date(today);
                  this.value.setDate(curD + (i + 6 - curWD) % 7 + 1);
                  this.valueString = (new Date(this.value)).toLocaleString();
                  return true;
               }
            }
         }
         return false;
      };
      Token.prototype.sensDigitFullDate = function() {
         console.log('sensDigitFullDate !');
         var rx = /(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})/;
         if(this.source.search(rx)==-1) return false;
//     если найдено - разбираем
         var rr = rx.exec(this.source);
         var date=rr[1], month=rr[2], sYear=0, fYear=0;
         console.log('sensDigitFullDate(1) =',date,month);
         if((0<(date))&&(date<32) &&
            (0<(month))&&(month<13) &&
            (
               ((sYear=rr[3]).length == 2)  ||
               (curY<=(fYear=rr[3]))
           )) {
            this.value = new Date( month+'.'+date+'.'+(fYear?fYear:'20'+sYear));
            this.valueString = (new Date(this.value)).toLocaleString();
            this.type = 'ttDigitFullDate';
            this.term = 1;
            return true;
         }
         return false;
      };
      Token.prototype.sensDigitShortDate = function() {
         console.log('sensDigitShortDate !');
         var rx = /(\d{1,2})\.(\d{1,2})/;
         if(this.source.search(rx)==-1) return false;
//     если найдено - разбираем
         var rr = rx.exec(this.source);
         var date=rr[1], month=rr[2];
         console.log('sensDigitShortDate(1) =',date,month);
         if((0<(date))&&(date<32) &&
            (0<(month))&&(month<13)) {
            this.value = new Date( month+'.'+date+'.'+
               (((new Date(month+'.'+date+'.'+curY))<today)?curY+1:curY));
            this.valueString = (new Date(this.value)).toLocaleString();
            this.type = 'ttDigitShortDate';
            this.term = 1;
            return true;
         }
         return false;
      };
      Token.prototype.sensNumbersGroup = function() {
         if(this.source.search(/\d+/)==-1) return false;  // если цифр нет - выходим
         if (
            this.sensDigitFullDate() ||
            this.sensDigitShortDate() || false
//            sensDigitMonth() ||
//            sensDigitFullTime() ||
//            sensDigitSingle()
            )  {return true;}
//         sensInvalidNumbersGroup();
         return false;
      };

      Token.prototype.sensDate = function() {
         return false;
      };
      Token.prototype.sensTime = function() {
         return false;
      };
      // Разборка с лексемами
      var tNumber = 0; // счётчик лексем
      function lexer(sa) {
         var token = new Token(sa);
         if(!token.preLex()) return null; // удаляем невалидные на этот момент строки
         token.pos = tNumber++;

         if(
            token.sensNumbersGroup() ||
            token.sensRelativeDay() ||
            token.sensDay() ||
            token.sensMonth() ||
            token.sensDate() || false
            )
         return token;

         else {}

         return null;
      }

      function parse(tokens) {
         var year = false;
         var month = false;
         var week = false;
         var date = false;
         var day = false;
//         tokens = tokens;
// парсим
         return tokens;
//         return null;
      }

      return {
         msInDay: msInDay,
         getSensTime: function(inpText) {
            if(!inpText) return false;
            var delims = /[^\.\:\wа-я]/g; // разделители
// готовим строку : переводим в набор лексем и распознаём лексемы
            var tokens =
               inpText.toLowerCase()
                  .replace(/\.+/g,'.')  // серия точек => одна
                  .replace(/\:+/g,':')  // серия доеточий => одно
                  .replace(/\.+ | \.+|\:+ | \:+/g,' ') // заменяем комбинации точек и двоеточий с пробелами на пробелы
                  .split(delims)  // сплитим и удаляем разделители
                  .map(function(s) { return lexer(s) })  // лексим
                  .filter(function(v){return!!v;});  // удаляем пустоты
            console.log('tokens =',angular.copy(tokens));
// отправляем массив парсеру;  // out => массив Date's
            var parseResult = parse(tokens);
// если массив не нулевой - возвращаем наибольшую дату, иначе null
            return (parseResult && parseResult.length) ?
               parseResult.sort(function(a,b){return a.value<b.value?-1:1}).pop().value : null;
         }
      };

   })
/************************** русификация локали (для датапикера) **********************************/
   .run(function($locale){
      $locale.id = 'ru-ru';
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
   })

; //********** END module  my33app  **************************/