#Тестовое задание для проекта 33slona#  

Работающее приложение: http://metadriver.ru/test33s/

###Особенности:###

1. Оба задание объеденины в одном приложении

2. Состояние приложения сохраняется при перезагрузке страницы.  При двух открытых окнах браузера, изменения синхронизируются атоматически. 

3. Из стороннего софта использовано:
   - angular v1.3.0
   - angular-ui (ui-bootstrap-tpls-0.11.0.min.js) : https://github.com/angular-ui/bootstrap
   - ngStorage (ngStorage.min.js) : https://github.com/gsklee/ngStorage
   - jQuerry (jquery-2.1.1.min.js)

4. На кроссбраузерность не ориентировано (в техзадании кроссбраузерность не оговаривается), отлаживал только под хромиум-браузерами.
   В файрфоксе есть небольшие глюки, в сафари и IE не проверял.

###Комментарии к парсеру:###
// eaaa! уфф.... ну наконец-то я его уже добил... не прошло и полгода. на трибунах уже начали засыпать.... :)
Впрочем, я отвлёкся.  Итак к делу.  Имеются следующие особенности:
#####----#####
Если во введёном тексте удаётся распознать несколько дат - в качестве результата берётся самая поздняя.
Ещё тонкости вставки дат : перед новой задачкой (или при перезагрузке страницы) создаётся "дата/время по умолчанию" 
( = сейчас + 12 часов; откуда берётся?... - взято самое лучшее из того что нашлось на потолке :) ..не самый худший, кстати, вариант. Ну..на мой вкус.), 
т.е. если ввести текст без дат и не устанавливать дату "пикером" - в задание попадёт именно оно.  
Если дата введена снаружи - default сбрасывается к текущему времени. Это предотвращает множество коллизий и вообще говоря довольно логично.
Если введено несколько дат (неважно как. например одна дата-пикером, вторая-стопицотая вручную) - берётся максимальная из них.
 И кстати, <b>Внимение! Именно она и отображается в окошке даты - самая поздняя из всех введённых дат</b>
(а не обязательно дата, выбранная датапикером).
Пока логичнее и беспроблемнее ничего не придумал. 
######Парсер распознаёт :######
##### - относительные ссылки во времени "сегодня-завтра-послезавтра"    ( сделано )#####
##### - дни недели    ( сделано )####
    // если день совпадает с сегодняшним (напр. "в среду" и сегодня среда) -
    // интерпретирует как "среда через неделю",  остальные - ближайшие
##### - полные даты в числовом виде : xx.xx.xxxx и xx.xx.xx  ( сделано )#####
    // при этом в двузначном формате года, все годы интерпретируются как "20xx"
    // в отличии от JS-распознавалки, которая годы большие 49 интерпретирует как 19xx
##### - неполные даты типа xx.xx  ( сделано )#####
    // - интерпретируются относительно ближайшего будущего,
    // т.е. переносятся на следующий год, если в этом году просрочено
##### - пары "дата + месяц" если дата в числовом представлении ( готово! энд гейм )#####
    // как можно уже догадаться - это было финальным аккордом. При этом:  
    // если год в числовом представлении присутствует (xxxx или xx) - он должен следовать 
    // сразу после месяца.  Иначе не распознается как имеющий отношение к этой дате.
    // если год отсутствует - дата интерпретируется как ближайшая в будущем.
##### - часы:минуты в числовом представлении - xx:xx ( сделано )#####
    // добавляются к распознанной дате, независимо от местоположения в тексте  
###### ListEnd. Это всё. ( за мелким исключением... о чём немного позже ) ######
---------------------------------------------------------------------------------------------------

Вообще, задним числом, видно как можно было бы парсер сделать гораздо проще (хотя и несколько тупее ;) ),
но это видно только сейчас, когда в задачке уже многое прояснилось-устаканилось и стали гораздо лучше
 видны степени свободы и ограничения в постановке. Ну да... ..особенно когда уже есть готовые блоки, которые можно легко припахать.
 А вот когда их ещё не было... "*...и мысль металась по углам.. там/сям...*" (с)... тады ой..! Ну да и ладно. Что сделано - то сделано.
  Есть приличное утешение - "*зато этот парсер куда круче простенького..!*".   
Как-то так...  :)  Вот к примеру :
#####Парсер распознаёт довольно большое число всевозможных сокращений.#####
Зацените:
```js
         Token.prototype.relativeDays = [
            'сегодня,сегод\\.,сег\\.,сгд\\.,сг\\.',
            'завтра,звт\\.',
            'послезавтра,послез\\.'
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
```
#####----#####
Надеюсь, на трибунах ждать завершения было не очень скучно, в конце-концов можно ведь и не скучать, а к примеру посочувствовать тупому... 
~~..ну или там поржать...~~ или на худой конец заняться более продуктивной деятельностью... (..типа написать парсер.. ..к примеру..;))
Если всё же зевота была неуёмной, попробую слегка порадовать. "Пасхальными яйцами", разумеется.  Пасха же грядёт..??..  Ну так и вот!..  Итак :
###=== (; Бонусные фишки ;) ===###
Если во входном потоке обнаружено хотя бы одна из нижеследующих подстрок - парсинг прерывается и принудительно выставляются следующие дедлайны: 
##### "потом" #####
 => Текущее время + 1000 лет.. должно хватить. :)
##### "когда-нибудь" #####
 => Текущее время + 50 лет... ну мне так показалось нормальненько... на всякий случай.. ;)
##### "никогда\!" (именно так, эмоционально\!) #####
 => Текущее время + 3 года.  За три года многое может произойти.  Вдруг удастся передумать..? ..мало ли...   
#####----#####
Благодарю за терпение.
#####Всем хорошего настроения\!#####
#####До связи (надеюсь).#####
Владимир Гомонов, aka MetaDriver
