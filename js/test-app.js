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
         var watchCounter=0;  // нужен для предотвращения сброса tomorrow при загрузке (ибо $watch пару раз стреляет)
         $scope.sensDate = 0;
         $scope.pickerDate = 0;
         $scope.tomorrow = new Date((new Date())*1+timeSens.msInDay/2);
         $scope.newTask = function () {
            var current = new Date();
            $scope.tomorrow = new Date((new Date())*1+timeSens.msInDay/2);
            watchCounter=0;
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
            var task = angular.copy($scope.task);
            task.taskStart *= 1; // храним в сторадже в числовом виде

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

         var tcDelay = null; // promise для обнуления в случае быстрого ввода, чтоб часто не дёргать парсер

         $scope.taskChange = function() {  // отслеживание изменения текста таска
            var sensResult = null;
            if (tcDelay) $timeout.cancel(tcDelay);
            tcDelay = $timeout(function() {
               if(sensResult = timeSens.getSensTime($scope.task.taskText)) {
                  console.log('sensResult =',(new Date(sensResult)).toLocaleDateString());
                  $scope.sensDate = sensResult;
                  tcDelay = null;
               }
            }, 400);
         };
         $scope.timeChange = function() {  // отслеживание ручного изменения дедлайна
         };
         $scope.$watch('sensDate*1+pickerDate*1',function(n,o){
            if(($scope.sensDate || $scope.pickerDate) && watchCounter > 2)
            { $scope.tomorrow = $scope.task.taskStart; console.log('$scope.tomorrow =',$scope.tomorrow); }
            $scope.task.taskEnd = Math.max($scope.tomorrow, $scope.sensDate, $scope.pickerDate);
            watchCounter++;
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
//         this.category = null;  // precission, year, month, day
         this.value = null;
         this.valueString = '';  // для отладки в консоли. и кстати - вывод в консоль сносить не буду: ТАМ ИНТЕРЕСНО!!! ;)
         this.source = angular.copy(s);
      }
      Token.prototype.preLex = function() {
         // берёт строку и удаляет всё ненужное
         switch (this.source) {
            case '':
            case ':':
            case '.': return false; // удаляем пустоты, одиночные точки и двоеточия
            default: {
               if(this.source.search(/\d+[a-zа-вд-я]+|[a-zа-я]+\d+/)!=-1) return false;
            }
         }
         return true;
      };
      Token.prototype.relativeDays = [
         'сегодня,сегод\\.,сег\\.,сгд\\.,сг\\.',
         'завтра,звт\\.','послезавтра,послез\\.'
      ];
      Token.prototype.weekDays = [
         'воскресень,воскр\\.,^вск\\.,^вс\\.',
         'понедельник,понед\\.,^пон\\.,пн\\.',
         'вторник,вторн\\.,вт\\.',
         'сред,^ср\\.',
         'четверг,четв\\.,чт\\.',
         'пятниц,пятн\\.,пт\\.',
         'суббот,субб\\.,суб\\.,сб\\.'
      ];
      Token.prototype.monthes = [
         'январ,^янв$,янв\\.',
         'февр,^фев$,фвр\\.',
         '^март$,^мар$,мрт.',
         'апрел,^апр$,^апр\\.',
         '^мая$,мае,^май$',
         '^июн',
         'июл',
         'август,^авг$,авг\\.',
         'сентябр,^сен$,сент\\.',
         'октябр,октяб\\.,^окт$,окт\\.',
         'ноябр,нояб\\.,^ноя$,ноя\\.',
         'декабр,декаб\\.,^дек$,дек\\.'
      ];
      Token.prototype.sensMonth = function() {
         for(var i=this.monthes.length-1; i>=0; i--) {
            var mm = this.monthes[i].split(',');
            for (var j = mm.length - 1; j >= 0; j--) {
               if (this.source.search(mm[j]) !== -1) {
                  this.type = 'ttMonth';
                  this.term = 0;
                  this.value = i;
                  this.valueString = mm[j];
                  return true;
               }
            }
         }
        return false;
      };
      Token.prototype.sensRelativeDay = function() {
         for(var i=this.relativeDays.length-1; i>=0; i--) {
            var dd = this.relativeDays[i].split(',');
            for (var j = dd.length - 1; j >= 0; j--) {
               if(this.source.search(dd[j])!==-1) {
                  this.type = 'ttRDay';
                  this.term = 1;
                  this.value = today.setDate(curD+i);
                  this.valueString = (new Date(this.value)).toLocaleString();
                  return true;
               }
            }
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
         var date=rr[1], month=rr[2], sYear, fYear;
         console.log('sensDigitFullDate(1) =',date,month,rr[3]);
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
      Token.prototype.sensDigitFullTime = function() {
         console.log('sensDigitFullTime !');
         var rx = /(\d{1,2})\:(\d{1,2})/;
         if(this.source.search(rx)==-1) return false;
//     если найдено - разбираем
         var rr = rx.exec(this.source);
         var hour=rr[1], min=rr[2];
         console.log('sensDigitFullTime(1) =',hour,min);
         if((hour<24) && (min<60)) {
            this.value = [hour,min];
            this.valueString = this.value;
            this.type = 'ttDigitFullTime';
            this.term = 0;
            return true;
         }
         return false;
      };
      Token.prototype.sensDigitSingle = function() {
         console.log('sensDigitSingle !');
         var rx = /(\d{4}|\d{1,2})/;
         if(this.source.search(rx)==-1) return false;
//     если найдено - разбираем
         var rr = rx.exec(this.source);
         var sd=rr[1];
         console.log('sensDigitSingle(1) =',sd);
         if((sd.length == 4) // && (curY<=sd) удалил, так как создало проблемы
            ) {
            this.value = sd;
            this.valueString = this.value;
            this.type = 'ttDigitFullYear';
            this.term = 0;
            return true;
         } else if(sd<32) {
            this.value = sd;
            this.valueString = this.value;
            this.type = 'ttDigitDate';
            this.term = 0;
            return true;
         } else {
            this.value = sd;
            this.valueString = this.value;
            this.type = 'ttDigitShortYear';
            this.term = 0;
            return true;
         }
//         return false;
      };
      Token.prototype.sensNumbersGroup = function() {
         if(this.source.search(/\d+/)==-1) return false;  // если цифр нет - выходим
         if (
            this.sensDigitFullDate() ||
            this.sensDigitShortDate() ||
            this.sensDigitFullTime() ||
            this.sensDigitSingle()
            )  {return true;}
//         sensInvalidNumbersGroup();  // похоже лишнее... удалю потом, если не обострится.
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
         token.pos = tNumber++; // запоминаем позицию (для парсера)
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
         var fullTimeIsExist = false;
         var fullTimeValue = null;
         for(var i=tokens.length-1; i>=0; i--) {
            if(tokens[i].type=='ttDigitFullTime') {
               // вставляем везде??  ну типатаво.  пока выставляем флаг вставки,
               // поскольку ещё возможно рождение нового терма из даты-месяца-года
               fullTimeIsExist = true;
               fullTimeValue = tokens[i].value;
            }
            if(tokens[i].type=='ttMonth') {
               if(tokens[i-1].type=='ttDigitDate') {
                  // ищем полный или короткий год, если находим - формируем дату с этим годом
                  var month = tokens[i].value, date = tokens[i-1].value, year;
                  var newToken = new Token('А вот и я!');
                  if ((tokens[i+1] && tokens[i+1].type=='ttDigitFullYear') ||
                      (tokens[i+1] && tokens[i+1].type=='ttDigitShortYear') ||
                      (tokens[i+1] && tokens[i+1].type=='ttDigitDate')) {
                     year = tokens[i+1].value;
                     newToken.value = new Date((1+month)+'.'+date+'.'+
                        (tokens[i+1].type=='ttDigitFullYear'?year:'20'+year));
                     newToken.valueString = (new Date(newToken.value)).toLocaleString();
                     newToken.type = 'ttDigitFullDate';
                     newToken.term = 2;
                  } else {
                     // иначе - с текущим (или переносим на следующий, если проехали)
                     newToken.value = new Date((1+month)+'.'+date+'.'+(((new Date((1+month)+'.'+date+'.'+curY))<today)?curY+1:curY));
                     newToken.valueString = (new Date(newToken.value)).toLocaleString();
                     newToken.type = 'ttDigitFullDate';
                     newToken.term = 2;
                  }
                  console.log('tokens.len =',tokens.length);
                  tokens.push(newToken);
                  console.log('после .push(newToken) tokens.len =',tokens.length);
                  console.log('newToken =',newToken);
               }
            }
         }
         if(fullTimeIsExist) {  // тады второй проход. вставляем это время везде. ээ.. ну почти. :)
            console.log('fullTimeIsExist =',fullTimeIsExist);
            for(i=tokens.length-1; i>=0; i--) {
//               if((typeof tokens[i].value)=='ob') {
               if(tokens[i].value && (tokens[i].value*1)!=1) {
                  console.log('(tokens[i].value*1)!=1 => tokens[i].value =',tokens[i].value);
                  // вставляем
                  var dd=new Date(tokens[i].value);
                  if(dd!='Invalid Date') {

                     console.log('dd!="Invalid Date", dd =',dd);
                     tokens[i].value = dd.setHours(fullTimeValue[0],fullTimeValue[1],0);
                  }
               } else { // удаляем нах, поскольку там попадаются строки, и сортировка потом проблемна
//                  tokens.splice(i,1);
               }
            }
         }
         return tokens;
      }
// factory return:
      return {
         msInDay: msInDay,
         getSensTime: function(inpText) {
            if(!inpText) return false;
            var delims = /[^\.\:\wа-я]/g; // разделители
// БОНУСЫ:
            if(inpText.search('когда-нибудь')!=-1) return (new Date(now.setFullYear(curY+50)));
            if(inpText.search('потом')!=-1) return (new Date(now.setFullYear(curY+1000)));
            if(inpText.search('никогда!')!=-1) return (new Date(now.setFullYear(curY+3)));
// End bonuses.
// поехали парсить.
// готовим строку : переводим в набор лексем и распознаём лексемы
            var tokens =
               inpText.toLowerCase()
                  .replace(/\.+/g,'.')  // серия точек => одна
                  .replace(/\:+/g,':')  // серия доеточий => одно
                  .replace(/\.+ | \.+|\:+ | \:+/g,' ') // заменяем комбинации точек и двоеточий с пробелами на пробелы
                  .split(delims)  // сплитим и удаляем разделители
                  .map(function(s) { return lexer(s) })  // лексим
                  .filter(function(v){return!!v;});  // удаляем пустоты
// отправляем массив парсеру;  // out => массив Date's
            var parseResult = parse(tokens);
            console.log('tokens =',angular.copy(tokens));
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