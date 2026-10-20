(function () {
  'use strict';

  var DICT = {
    ru: {
      meta: {
        title: 'Аурелия',
        tagline: 'От черновой студии до пентхауса'
      },
      currency: {
        money: 'Деньги',
        crystals: 'Кристаллы',
        income: 'Доход',
        perSec: '/с',
        boost: '×2'
      },
      quest: {
        kicker: 'Квест',
        done: 'Дом готов',
        completeTitle: 'Пентхаус собран',
        completeDesc: 'Все заказы закрыты. Квартира сияет.',
        progress: '{current} / {target}'
      },
      orders: {
        kicker: 'Заказы',
        client: 'Клиент · {room}',
        wait: 'Ждёт «{name}», ур. {level}',
        pay: '+{income} к доходу',
        done: 'Коллекция собрана',
        all: 'Пентхаус укомплектован',
        estimate: 'Смета',
        rate: 'Сейчас {value}',
        live: 'Капает каждую секунду',
        vip: 'VIP-заказчик',
        vipHint: 'Нажмите дрон, чтобы принять'
      },
      clients: {
        kirill: { name: 'Кирилл', role: 'IT-стример' },
        sofia: { name: 'София', role: 'фуд-блогер' },
        viktor: { name: 'Виктор', role: 'инвестор' },
        alina: { name: 'Алина', role: 'галеристка' },
        mark: { name: 'Марк', role: 'архитектор' },
        lera: { name: 'Лера', role: 'флорист' }
      },
      design: {
        orders: 'VIP-заказы',
        prestige: 'Престиж +{pct}%',
        need: 'Нужен предмет Ур. {a} + Ур. {b}',
        submit: 'Сдать проект!',
        reward: '+{money} 💰, +{crystals} 💎, +{pct}% к престижу',
        waiting: 'Соберите предметы на поле',
        ask: 'Нужны: {a} и {b}',
        stock: 'На поле {have} из {need}',
        locked: 'Соберите на поле',
        payShort: '+{money} 💰',
        left: '{name} не дождался и ушёл. Пришёл новый клиент',
        whyKirill0: 'В пятницу стрим из новой студии — фон должен выглядеть дорого.',
        whyKirill1: 'Зрители смеются над пустым углом за спиной. Спасите эфир!',
        whyKirill2: 'Спонсор приедет смотреть студию. Мне нужно впечатлить.',
        whySofia0: 'Снимаю рецепт недели — без уюта кадр не наберёт лайков.',
        whySofia1: 'Ко мне едут подписчики на ужин. Хочу, чтобы ахнули.',
        whySofia2: 'Бренд посуды заказал съёмку у меня дома. Срочно!',
        whyViktor0: 'Сдаю квартиру посуточно — с этим аренда вырастет вдвое.',
        whyViktor1: 'Покупатель приходит завтра. Мне нужен вау-эффект.',
        whyViktor2: 'Переезжаю и хочу с первого дня жить красиво.',
        whyAlina0: 'Открываю выставку на дому. Пространство должно звучать.',
        whyAlina1: 'Приезжает куратор из Милана — не хочу краснеть.',
        whyAlina2: 'Ищу идеальный фон для новой картины.',
        whyMark0: 'Сдаю проект заказчику — не хватает двух акцентов.',
        whyMark1: 'В субботу фотограф журнала. Нужен финальный штрих.',
        whyMark2: 'Проверяю свою планировку вживую. Привезите — и я увижу.',
        whyLera0: 'Открываю мастерскую букетов. Нужны свет и простор.',
        whyLera1: 'У мамы юбилей, я украшаю её гостиную.',
        whyLera2: 'Цветам нужен уютный дом, а у меня голые стены.',
        whyPhoneKirill0: 'Нужен дорогой фон стрима.',
        whyPhoneKirill1: 'Пустой угол портит эфир.',
        whyPhoneKirill2: 'Спонсор смотрит студию.',
        whyPhoneSofia0: 'Без уюта нет лайков.',
        whyPhoneSofia1: 'Подписчики едут на ужин.',
        whyPhoneSofia2: 'Бренд снимает у меня.',
        whyPhoneViktor0: 'Аренда вырастет вдвое.',
        whyPhoneViktor1: 'Завтра нужен вау-эффект.',
        whyPhoneViktor2: 'Хочу жить красиво сразу.',
        whyPhoneAlina0: 'Выставка должна звучать.',
        whyPhoneAlina1: 'Куратор из Милана ждёт.',
        whyPhoneAlina2: 'Ищу фон для картины.',
        whyPhoneMark0: 'Не хватает двух акцентов.',
        whyPhoneMark1: 'Съёмка журнала в субботу.',
        whyPhoneMark2: 'Проверяю план вживую.',
        whyPhoneLera0: 'Нужны свет и простор.',
        whyPhoneLera1: 'Гостиная к юбилею мамы.',
        whyPhoneLera2: 'Цветам нужен уютный дом.',
        wishKirill: 'Кирилл ставит «{a}» в кадр. Без «{b}» эфир пустой.',
        wishSofia: 'София снимает обзор: «{a}» рядом с «{b}».',
        wishViktor: 'Виктор оценивает квартиру по «{a}» и «{b}».',
        wishAlina: 'Алина вешает «{a}» в экспозицию вместе с «{b}».',
        wishMark: 'Марк чертит стену вокруг «{a}» и «{b}».',
        wishLera: 'Лера ставит «{a}» к свету, а «{b}» к окну.',
        floor: 'Пол и стены',
        window: 'Панорамное окно',
        soft: 'Мягкая зона',
        light: 'Освещение',
        tech: 'Техника и декор',
        scandi: 'Скандинавский уют',
        loft: 'Индустриальный лофт',
        lux: 'Золотой нео-люкс',
        styleTitle: '{zone}',
        styleLead: 'Выберите стиль. Комната перерисуется сразу.',
        stylePrice: 'Прокачать за {price}',
        styleMax: 'Сменить стиль за {price}',
        inspire: 'Вдохновение',
        fever: '🔥 ДИЗАЙН-ФОРСАЖ!',
        feverLeft: '{sec} с',
        saleTitle: '📦 Срочная распродажа стройматериалов',
        saleCopy: 'Скидка 50% на прокачку!',
        surgeTitle: '⚡ Короткое замыкание на объекте',
        surgeCopy: 'Быстро нажмите щиток 10 раз: {have}/10. В сундуке редкий предмет!',
        eventLeft: '{sec} с',
        rareChest: 'Сундук: {name}',
        rareGold: 'Поле полно. Сундук стал монетами: +{amount}',
        zoneDone: 'Зона обновлена: {style}',
        delivered: '{name}: «Восторг! Проект принят»',
        visitKirill: 'Кирилл включает камеру. Фон готов.',
        visitSofia: 'София ставит кадр и ахает.',
        visitViktor: 'Виктор фотографирует объявление.',
        visitAlina: 'Алина вешает свет на картину.',
        visitMark: 'Марк обходит комнату и кивает.',
        visitLera: 'Лера ставит букет на столик.',
        staged: 'В комнате теперь {item}.',
        noticed: '{name}: «{item}» уже здесь.',
        rehearse: 'Репетиция! 12 секунд поставка бесплатная.',
        rehearseWait: 'Клиент переводит дух.',
        chain1: 'Серия. Комната оживает.',
        chain2: 'Гости ахнули разом.',
        chain3: 'Это уже обложка журнала.',
        scene0: 'Сцена: поставьте предмет',
        scene1: 'Сцена: соедините пару',
        scene2: 'Сцена: сдайте заказ',
        scene3: 'Сцена: нажмите клиента',
        sceneDone: 'Кадр снят.',
        courierBtn: 'Коробки',
        courier: 'Курьер привёз пару для съёмки.',
        dealTitle: 'Пара горит',
        dealCopy: '«{item}» можно соединить или продать.',
        dealSell: 'Продать',
        dealKeep: 'Оставить',
        dealSold: 'Лишний «{item}» продан за {money}.',
        dealKept: 'Оставим для серии.',
        purr: 'Мррр'
      },
      nav: {
        upgrades: 'Прокачка',
        shop: 'Магазин',
        boosters: 'Бустеры',
        sound: 'Звук',
        soundOn: 'Выключить звук',
        soundOff: 'Включить звук',
        lang: 'Переключить язык',
        close: 'Закрыть панель'
      },
      grid: {
        title: 'Мастерская',
        count: '{filled} / {total}',
        cell: 'Ячейка {n}',
        rank: 'Ур. {n}'
      },
      album: {
        title: 'Альбом интерьера',
        progress: '{open} / {total}',
        locked: 'Закрыто',
        hint: 'Новые предметы открываются вместе с квестами.'
      },
      sheet: {
        upgrades: 'Прокачка квартиры',
        shop: 'Магазин и альбом',
        boosters: 'Бустеры'
      },
      upgrades: {
        level: 'Ур. {level}/{max}',
        buy: 'Купить · {price}',
        maxed: 'Максимум',
        now: 'Сейчас: {value}',
        crystalEvery: 'каждые {seconds} с',
        crystalNow: '×{amount}',
        line: {
          flat: '+{value}{perSec} за каждый уровень',
          percent: '+{percent}% к доходу за каждый уровень',
          crystalRate: 'Каждый уровень сокращает паузу между кристаллами',
          crystalAmount: 'Каждый уровень добавляет кристалл к находке'
        }
      },
      shop: {
        packs: 'Сейф и витрина',
        payMoney: 'Купить за {price}',
        payCrystals: 'Купить за {price} крист.',
        verb: 'Купить'
      },
      boost: {
        optional: 'Реклама необязательна. Квартиру можно собрать и без неё.',
        gems: {
          title: 'Кристальный ролик',
          desc: 'Короткое видео в обмен на горсть кристаллов.',
          button: 'Смотреть рекламу: +{amount} кристаллов'
        },
        rush: {
          title: 'Золотой час',
          desc: 'Доход удваивается на несколько минут. Таймер стоит на паузе вместе с игрой.',
          button: 'Смотреть рекламу: доход ×2 на {minutes} мин',
          active: 'Ещё {time}'
        },
        purse: {
          title: 'Конверт зрителя',
          desc: 'Монеты разом за полторы минуты текущего дохода.',
          button: 'Смотреть рекламу: монеты за {seconds} с дохода'
        },
        break: {
          title: 'Кофе-брейк',
          desc: 'Полноэкранная пауза без награды. Игра и звук остановятся на время ролика.',
          button: 'Поставить рекламную паузу'
        }
      },
      ad: {
        fullscreenTitle: 'Рекламная пауза',
        fullscreenText: 'Межстраничный ролик. Награды нет.',
        rewardedTitle: 'Реклама за награду',
        rewardedText: 'Ролик идёт, игра остановлена. Награда ждёт в конце.',
        countdown: '{sec}',
        paused: 'Звук выключен, таймеры стоят',
        mockNote: 'Локальная проверка монетизации',
        rewardReady: 'Награда зачислена'
      },
      toast: {
        rewardCrystals: '+{amount} кристаллов',
        rewardMoney: '+{amount} монет',
        rush: 'Доход удвоен',
        break: 'Пауза закончилась',
        brokeMoney: 'Не хватает монет',
        brokeCrystals: 'Не хватает кристаллов',
        adLocked: 'Ролик уже открыт',
        adFailed: 'Реклама сейчас недоступна',
        quest: 'Квест закрыт: {title}',
        bought: 'Куплено: {name}',
        wait: 'Секунду, игра ещё просыпается'
      },
      contract: {
        discover: 'Откройте «{item}» — дальше {room}',
        deliver: 'Пентхаус: сдайте заказы {have}/{need}',
        opened: 'Открыта «{room}»',
        kept: 'Контракт закрыт. На столе уже следующий',
        step: '«{item}» в коллекции. Квартира растёт'
      },
      rooms: {
        0: {
          name: 'Черновая студия',
          blurb: 'Серый бетон, трещины и первые метки на полу.',
          beat: 'Серый бетон и первые метки.'
        },
        1: {
          name: 'Белая коробка',
          blurb: 'Краска легла ровно. Валик оставил первый широкий след.',
          beat: 'Краска легла ровным слоем.'
        },
        2: {
          name: 'Живой угол',
          blurb: 'Торшер и монстера. Студия начинает дышать.',
          beat: 'Торшер и монстера. Уже живёт.'
        },
        3: {
          name: 'Гостиная',
          blurb: 'Велюр, столик и место, куда хочется сесть.',
          beat: 'Велюр и место, куда сесть.'
        },
        4: {
          name: 'Дизайнерский лофт',
          blurb: 'Два экрана днём, кинотеатр вечером.',
          beat: 'Днём экраны, вечером кино.'
        },
        5: {
          name: 'Парадные комнаты',
          blurb: 'Камин, рояль и свет, который стоит дорого.',
          beat: 'Камин, рояль и дорогой свет.'
        },
        6: {
          name: 'Небесный пентхаус',
          blurb: 'Ночной город, джакузи и золотой ключ от крыши.',
          beat: 'Ночь, джакузи и ключ крыши.'
        }
      },
      items: {
        1: {
          name: 'Рулетка и карандаш',
          short: 'Рулетка',
          desc: 'Первые метки на бетоне. С них начинается чертёж.'
        },
        2: {
          name: 'Валик с краской',
          short: 'Валик',
          desc: 'Широкий след свежей краски. Стены перестают быть серыми.'
        },
        3: {
          name: 'Светодиодный торшер',
          short: 'Торшер',
          desc: 'Ровный свет, который не слепит и не гудит.'
        },
        4: {
          name: 'Кашпо с монстерой',
          short: 'Монстера',
          desc: 'Дизайнерская керамика и листья с дырками большого города.'
        },
        5: {
          name: 'Кресло-мешок',
          short: 'Мешок',
          desc: 'Мягкая яма, в которую можно упасть после смены.'
        },
        6: {
          name: 'Лофт-столик',
          short: 'Столик',
          desc: 'Чёрный металл, толстое дерево, место для чашки и плана.'
        },
        7: {
          name: 'Велюровый диван',
          short: 'Диван',
          desc: 'Глубокий ворс и посадка, ради которой остаются гости.'
        },
        8: {
          name: 'IT-станция',
          short: 'Станция',
          desc: 'Два монитора и тихая клавиатура. Работа не спорит с уютом.'
        },
        9: {
          name: 'Кинотеатр QLED',
          short: 'Кино',
          desc: 'Экран во всю стену. Вечер начинается с одной кнопки.'
        },
        10: {
          name: 'Мраморный остров',
          short: 'Остров',
          desc: 'Холодный камень, тёплая кухня, два стула и фрукты.'
        },
        11: {
          name: 'Панорамный биокамин',
          short: 'Камин',
          desc: 'Живое пламя без дыма, на всю ширину гостиной.'
        },
        12: {
          name: 'Рояль',
          short: 'Рояль',
          desc: 'Чёрный лак, открытая крышка и вечер, который звучит дорого.'
        },
        13: {
          name: 'Джакузи на террасе',
          short: 'Джакузи',
          desc: 'Тёплая вода над ночным городом.'
        },
        14: {
          name: 'Умный пентхаус',
          short: 'Пентхаус',
          desc: 'Свет, климат и шторы слушаются одного жеста.'
        },
        15: {
          name: 'Золотой ключ Архитектора',
          short: 'Ключ',
          desc: 'Империя собрана. Ключ от крыши теперь ваш.'
        }
      },
      play: {
        spawn: 'Поставка',
        energy: '{current}/{max}',
        claim: 'Забрать {money}',
        claimGems: 'Забрать {money} и {crystals} крист.',
        questMerge: 'Соедините предметы: {target}',
        questDiscover: 'Откройте предмет {target} уровня',
        questEarn: 'Накопите {target} монет',
        offlineTitle: 'С возвращением!',
        offlineBody: 'Пока вас не было, ваши квартиры принесли +{amount} монет.',
        offlineClaim: 'Забрать',
        offlineDouble: 'Удвоить за рекламу 🎬',
        boardFull: 'На поле нет места',
        noEnergy: 'Нет зарядов поставки',
        discovered: 'Новый предмет: {name}',
        maxItem: 'Это уже вершина коллекции'
      },
      monetize: {
        combo: 'COMBO x{n}!',
        newLevel: 'НОВЫЙ УРОВЕНЬ!',
        codex: 'Коллекция',
        codexTitle: 'Энциклопедия',
        codexReward: '+{amount} кристаллов',
        codexKept: 'Уже в мастерской',
        codexClose: 'Закрыть',
        x2: '🔥 Доход x2 на 2 минуты 🎬',
        x2active: '🔥 x2 ещё {time} 🎬',
        energyOffer: '⚡ Полный заряд + 3 редких предмета за видео 🎬',
        later: 'Не сейчас',
        drone: '🚁 Золотой дрон · VIP-заказчик 🎬',
        auto: '🤖 Авто-мерж на 60 секунд за видео 🎬',
        autoActive: '🤖 Авто-мерж {time} 🎬',
        stageWarning: 'Переход на новый объект через {sec} сек...',
        chestItem: 'Сундук: {name}',
        chestGold: '+{amount} 💰'
      },
      branch: {
        level: 'Ур. {level}/{max}',
        buy: 'Купить · {price}',
        buyGems: 'Купить · {price} крист.',
        verb: 'Купить',
        maxed: 'Максимум',
        base: {
          name: 'Уровень поставки',
          desc: 'Новые предметы приезжают сразу более высокого уровня.'
        },
        supply: {
          name: 'Скорость поставок',
          desc: 'Заряды мастерской восстанавливаются быстрее.'
        },
        luck: {
          name: 'Щедрая поставка',
          desc: 'Шанс получить сразу два или три одинаковых предмета.'
        },
        rent: {
          name: 'Арендная ставка',
          desc: 'Каждый уровень поднимает доход всех предметов на 25%.'
        },
        magnet: {
          name: 'Магнит слияния',
          desc: 'Пары на поле соединяются сами через равные промежутки.'
        },
        baseNow: 'Поставка: уровень {level}',
        supplyNow: 'Заряд каждые {seconds} с',
        luckNow: 'x2 {double}% · x3 {triple}%',
        rentNow: 'Доход ×{mult}',
        magnetNow: 'Пара каждые {seconds} с',
        magnetOff: 'Магнит ещё спит'
      },
      quests: {
        firstCoins: {
          title: 'Первая смета',
          desc: 'Заработайте {target} монет. Студия начинает окупаться.'
        },
        firstTool: {
          title: 'Первый инструмент',
          desc: 'Купите улучшение. Нужно уровней: {target}.'
        },
        steady: {
          title: 'Ровный доход',
          desc: 'Доведите доход до {target} в секунду.'
        },
        float: {
          title: 'Подушка на краску',
          desc: 'Накопите {target} монет на отделку.'
        },
        crew: {
          title: 'Своя бригада',
          desc: 'Сумма уровней прокачки: {target}.'
        },
        sparkle: {
          title: 'Первый блеск',
          desc: 'Соберите {target} кристаллов.'
        },
        tempo: {
          title: 'Темп ремонта',
          desc: 'Поднимите доход до {target} в секунду.'
        },
        cushion: {
          title: 'Мягкий капитал',
          desc: 'Заработайте {target} монет.'
        },
        atelier: {
          title: 'Часы ателье',
          desc: 'Доведите сумму уровней до {target}.'
        },
        jewels: {
          title: 'Шкатулка',
          desc: 'Держите на счету {target} кристаллов.'
        },
        rhythm: {
          title: 'Ровный дом',
          desc: 'Доход {target} в секунду. Квартира звучит спокойно.'
        },
        fortune: {
          title: 'Большая смета',
          desc: 'Накопите {target} монет.'
        },
        mansion: {
          title: 'Полный этаж',
          desc: 'Сумма уровней улучшений: {target}.'
        },
        skyline: {
          title: 'Линия крыш',
          desc: 'Доведите доход до {target} в секунду.'
        },
        aurelia: {
          title: 'Имя на двери',
          desc: 'Финальный капитал: {target} монет. Пентхаус ваш.'
        }
      },
      upgrade: {
        rent: {
          name: 'Квартплата',
          desc: 'Аккуратный подъезд, и жильцы платят без напоминаний.'
        },
        tips: {
          name: 'Чаевые',
          desc: 'Гости оставляют монеты за тёплый свет в прихожей.'
        },
        crew: {
          name: 'Бригада',
          desc: 'Двое мастеров успевают там, где вы топтались неделю.'
        },
        parquet: {
          name: 'Паркет',
          desc: 'Ёлочка на полу поднимает цену каждого часа аренды.'
        },
        light: {
          name: 'Свет дизайнера',
          desc: 'Правильная лампа делает ту же комнату дороже.'
        },
        concierge: {
          name: 'Консьерж',
          desc: 'Кто-то встречает гостей, пока доход течёт сам.'
        },
        showcase: {
          name: 'Витрина',
          desc: 'Окно на улицу работает как тихая реклама дома.'
        },
        marble: {
          name: 'Мрамор',
          desc: 'Холодный камень, тёплая наценка.'
        },
        crystalEye: {
          name: 'Глаз кварца',
          desc: 'В отделке всё чаще поблёскивает кристалл.'
        },
        vault: {
          name: 'Сейф в холле',
          desc: 'Лишние монеты перестают теряться между коробками.'
        },
        atelier: {
          name: 'Ателье',
          desc: 'Эскизы на стене учат комнату стоить дороже.'
        },
        fountain: {
          name: 'Фонтанчик',
          desc: 'Тихая вода в лобби притягивает ещё один кристалл.'
        },
        contract: {
          name: 'Контракт',
          desc: 'Длинная аренда закрепляет проценты, а не обещания.'
        },
        penthouse: {
          name: 'Пентхаус',
          desc: 'Верхний этаж платит так, будто город ваш.'
        },
        developer: {
          name: 'Девелопер',
          desc: 'Вы больше не чините студию. Вы задаёте цену району.'
        }
      },
      pack: {
        pouch: {
          name: 'Конверт с монетами',
          desc: 'Тонкая пачка на краску и первую лампу.'
        },
        safe: {
          name: 'Домашний сейф',
          desc: 'Запас, которого хватает на серьёзную отделку.'
        },
        satchel: {
          name: 'Сумка прораба',
          desc: 'Тяжёлая сумка. Внутри только монеты и опилки.'
        },
        chip: {
          name: 'Горсть кристаллов',
          desc: 'Несколько острых камней за честный мешок монет.'
        },
        casket: {
          name: 'Ларец',
          desc: 'Бархат, защёлка и россыпь, которой хватит на витрину.'
        },
        strongbox: {
          name: 'Банковская ячейка',
          desc: 'Кристаллы, которые не звенят, пока не откроешь дверцу.'
        }
      }
    },
    en: {
      meta: {
        title: 'Aurelia',
        tagline: 'From a bare studio to a penthouse'
      },
      currency: {
        money: 'Money',
        crystals: 'Crystals',
        income: 'Income',
        perSec: '/s',
        boost: '×2'
      },
      quest: {
        kicker: 'Quest',
        done: 'Home complete',
        completeTitle: 'Penthouse finished',
        completeDesc: 'Every brief is closed. The flat is shining.',
        progress: '{current} / {target}'
      },
      orders: {
        kicker: 'Orders',
        client: 'Client · {room}',
        wait: 'Wants “{name}”, lv {level}',
        pay: '+{income} income',
        done: 'Collection complete',
        all: 'Penthouse is furnished',
        estimate: 'Estimate',
        rate: 'Now {value}',
        live: 'Pays every second',
        vip: 'VIP client',
        vipHint: 'Tap the drone to accept'
      },
      clients: {
        kirill: { name: 'Kirill', role: 'IT streamer' },
        sofia: { name: 'Sofia', role: 'food blogger' },
        viktor: { name: 'Viktor', role: 'investor' },
        alina: { name: 'Alina', role: 'gallerist' },
        mark: { name: 'Mark', role: 'architect' },
        lera: { name: 'Lera', role: 'florist' }
      },
      design: {
        orders: 'VIP orders',
        prestige: 'Prestige +{pct}%',
        need: 'Needs item Lv {a} + Lv {b}',
        submit: 'Deliver the project!',
        reward: '+{money} 💰, +{crystals} 💎, +{pct}% prestige',
        waiting: 'Merge these pieces onto the board',
        ask: 'Needs: {a} and {b}',
        stock: 'On the board {have} of {need}',
        locked: 'Get these on the board',
        payShort: '+{money} 💰',
        left: '{name} got tired of waiting. A new client arrived',
        whyKirill0: 'Friday I stream from the new studio — the backdrop must look expensive.',
        whyKirill1: 'Viewers laugh at the empty corner behind me. Save my stream!',
        whyKirill2: 'A sponsor is coming to see the studio. I need to impress.',
        whySofia0: 'Filming the recipe of the week — no cozy shot, no likes.',
        whySofia1: 'Followers are coming over for dinner. I want them to gasp.',
        whySofia2: 'A tableware brand booked a shoot at my place. Hurry!',
        whyViktor0: 'I rent the flat by the night — this doubles the rate.',
        whyViktor1: 'A buyer comes tomorrow. I need the wow effect.',
        whyViktor2: 'I am moving and want to live beautifully from day one.',
        whyAlina0: 'I am opening a home exhibition. The space has to sing.',
        whyAlina1: 'A curator flies in from Milan — I refuse to blush.',
        whyAlina2: 'I am looking for the perfect backdrop for a new painting.',
        whyMark0: 'Handing the project to a client — two accents are missing.',
        whyMark1: 'A magazine photographer comes Saturday. I need the final touch.',
        whyMark2: 'I want to test my floor plan for real. Bring these and I will see.',
        whyLera0: 'I am opening a bouquet studio. I need light and space.',
        whyLera1: 'It is my mom’s anniversary and I am decorating her living room.',
        whyLera2: 'Flowers need a cozy home, and my walls are bare.',
        whyPhoneKirill0: 'The stream needs a rich set.',
        whyPhoneKirill1: 'The empty corner ruins it.',
        whyPhoneKirill2: 'A sponsor is touring today.',
        whyPhoneSofia0: 'No cozy shot means no likes.',
        whyPhoneSofia1: 'Followers are coming to eat.',
        whyPhoneSofia2: 'A brand is shooting here.',
        whyPhoneViktor0: 'This doubles the night rent.',
        whyPhoneViktor1: 'A buyer comes tomorrow.',
        whyPhoneViktor2: 'Beautiful from day one.',
        whyPhoneAlina0: 'The home show has to sing.',
        whyPhoneAlina1: 'A Milan curator is coming.',
        whyPhoneAlina2: 'I need a painting backdrop.',
        whyPhoneMark0: 'Two accents are missing.',
        whyPhoneMark1: 'The magazine comes Saturday.',
        whyPhoneMark2: 'I am testing the real plan.',
        whyPhoneLera0: 'I need light and some space.',
        whyPhoneLera1: 'The anniversary room is bare.',
        whyPhoneLera2: 'Flowers need a cozy home.',
        wishKirill: 'Kirill puts “{a}” on camera. Without “{b}” the stream is empty.',
        wishSofia: 'Sofia is filming “{a}” next to “{b}”.',
        wishViktor: 'Viktor prices the flat by “{a}” and “{b}”.',
        wishAlina: 'Alina hangs “{a}” in the show with “{b}”.',
        wishMark: 'Mark draws the wall around “{a}” and “{b}”.',
        wishLera: 'Lera sets “{a}” by the lamp and “{b}” by the window.',
        floor: 'Floor and walls',
        window: 'Panoramic window',
        soft: 'Lounge',
        light: 'Lighting',
        tech: 'Tech and decor',
        scandi: 'Scandinavian cozy',
        loft: 'Industrial loft',
        lux: 'Golden neo-luxe',
        styleTitle: '{zone}',
        styleLead: 'Pick a style. The room repaints at once.',
        stylePrice: 'Upgrade for {price}',
        styleMax: 'Restyle for {price}',
        inspire: 'Inspiration',
        fever: '🔥 DESIGN OVERDRIVE!',
        feverLeft: '{sec}s',
        saleTitle: '📦 Urgent materials sale',
        saleCopy: '50% off every upgrade!',
        surgeTitle: '⚡ Short circuit on site',
        surgeCopy: 'Tap the fuse box 10 times: {have}/10. A rare chest is the prize!',
        eventLeft: '{sec}s',
        rareChest: 'Chest: {name}',
        rareGold: 'Board is full. The chest became coins: +{amount}',
        zoneDone: 'Zone updated: {style}',
        delivered: '{name} accepted the project',
        visitKirill: 'Kirill rolls the camera. The set is ready.',
        visitSofia: 'Sofia frames the shot and gasps.',
        visitViktor: 'Viktor photographs the listing.',
        visitAlina: 'Alina hangs light on the painting.',
        visitMark: 'Mark walks the room and nods.',
        visitLera: 'Lera sets a bouquet on the table.',
        staged: 'The room now has a {item}.',
        noticed: '{name} spotted the {item}.',
        rehearse: 'Rehearsal! Free deliveries for 12 seconds.',
        rehearseWait: 'The client is catching their breath.',
        chain1: 'A chain. The room wakes up.',
        chain2: 'The guests gasp together.',
        chain3: 'This is a magazine cover.',
        scene0: 'Scene: place a piece',
        scene1: 'Scene: merge a pair',
        scene2: 'Scene: deliver an order',
        scene3: 'Scene: tap the client',
        sceneDone: 'Shot in the can.',
        courierBtn: 'Boxes',
        courier: 'A courier brought a pair for the shoot.',
        dealTitle: 'A pair is glowing',
        dealCopy: 'Merge the {item}, or sell it.',
        dealSell: 'Sell',
        dealKeep: 'Keep',
        dealSold: 'The spare {item} sold for {money}.',
        dealKept: 'We will keep it for a chain.',
        purr: 'Purr'
      },
      nav: {
        upgrades: 'Upgrades',
        shop: 'Shop',
        boosters: 'Boosters',
        sound: 'Sound',
        soundOn: 'Mute sound',
        soundOff: 'Unmute sound',
        lang: 'Switch language',
        close: 'Close panel'
      },
      grid: {
        title: 'Workshop',
        count: '{filled} / {total}',
        cell: 'Cell {n}',
        rank: 'Lv {n}'
      },
      album: {
        title: 'Interior album',
        progress: '{open} / {total}',
        locked: 'Sealed',
        hint: 'New pieces open as quests advance.'
      },
      sheet: {
        upgrades: 'Flat upgrades',
        shop: 'Shop and album',
        boosters: 'Boosters'
      },
      upgrades: {
        level: 'Lv {level}/{max}',
        buy: 'Buy · {price}',
        maxed: 'Maxed',
        now: 'Now: {value}',
        crystalEvery: 'every {seconds}s',
        crystalNow: '×{amount}',
        line: {
          flat: '+{value}{perSec} each level',
          percent: '+{percent}% income each level',
          crystalRate: 'Each level shortens the pause between crystals',
          crystalAmount: 'Each level adds a crystal to every find'
        }
      },
      shop: {
        packs: 'Safe and showcase',
        payMoney: 'Buy for {price}',
        payCrystals: 'Buy for {price} crystals',
        verb: 'Buy'
      },
      boost: {
        optional: 'Ads are optional. The flat can be finished without them.',
        gems: {
          title: 'Crystal reel',
          desc: 'A short video in exchange for a handful of crystals.',
          button: 'Watch ad: +{amount} crystals'
        },
        rush: {
          title: 'Golden hour',
          desc: 'Income doubles for a few minutes. The timer freezes whenever the game pauses.',
          button: 'Watch ad: ×2 income for {minutes} min',
          active: '{time} left'
        },
        purse: {
          title: 'Viewer envelope',
          desc: 'Coins equal to a minute and a half of your current income.',
          button: 'Watch ad: coins for {seconds}s of income'
        },
        break: {
          title: 'Coffee break',
          desc: 'A fullscreen pause with no reward. Gameplay and sound stop for the reel.',
          button: 'Start an ad break'
        }
      },
      ad: {
        fullscreenTitle: 'Ad break',
        fullscreenText: 'Interstitial reel. There is no reward.',
        rewardedTitle: 'Rewarded video',
        rewardedText: 'The reel is playing and the game is paused. The reward waits at the end.',
        countdown: '{sec}',
        paused: 'Sound is off and timers are stopped',
        mockNote: 'Local monetization preview',
        rewardReady: 'Reward added'
      },
      toast: {
        rewardCrystals: '+{amount} crystals',
        rewardMoney: '+{amount} coins',
        rush: 'Income doubled',
        break: 'The break is over',
        brokeMoney: 'Not enough coins',
        brokeCrystals: 'Not enough crystals',
        adLocked: 'A reel is already open',
        adFailed: 'The ad is unavailable right now',
        quest: 'Quest closed: {title}',
        bought: 'Bought: {name}',
        wait: 'One moment, the game is still waking'
      },
      contract: {
        discover: 'Discover “{item}” — next is {room}',
        deliver: 'Penthouse: deliver orders {have}/{need}',
        opened: '“{room}” is open',
        kept: 'Contract closed. The next one is already on the desk',
        step: '“{item}” is in the collection. The flat grows'
      },
      rooms: {
        0: {
          name: 'Bare studio',
          blurb: 'Grey concrete, cracks, and the first marks on the floor.',
          beat: 'Grey concrete and first marks.'
        },
        1: {
          name: 'White box',
          blurb: 'The paint lies flat. The roller left the first wide stroke.',
          beat: 'The paint lies flat and even.'
        },
        2: {
          name: 'Living corner',
          blurb: 'A floor lamp and a monstera. The studio starts to breathe.',
          beat: 'A lamp, a plant, it breathes.'
        },
        3: {
          name: 'Living room',
          blurb: 'Velvet, a table, and a seat worth staying for.',
          beat: 'Velvet and a seat worth staying.'
        },
        4: {
          name: 'Designer loft',
          blurb: 'Two screens by day, a cinema by night.',
          beat: 'Screens by day, cinema at night.'
        },
        5: {
          name: 'Parade rooms',
          blurb: 'A fireplace, a piano, and light that costs something.',
          beat: 'A fire, a piano, costly light.'
        },
        6: {
          name: 'Sky penthouse',
          blurb: 'The night city, a jacuzzi, and a golden key to the roof.',
          beat: 'Night city, a tub, the roof key.'
        }
      },
      items: {
        1: {
          name: 'Tape and Pencil',
          short: 'Tape',
          desc: 'The first marks on concrete. The drawing starts here.'
        },
        2: {
          name: 'Paint Roller',
          short: 'Roller',
          desc: 'A wide stroke of fresh paint. The walls stop being grey.'
        },
        3: {
          name: 'LED Floor Lamp',
          short: 'Lamp',
          desc: 'Even light that neither glares nor hums.'
        },
        4: {
          name: 'Monstera Planter',
          short: 'Monstera',
          desc: 'Designer ceramic and leaves with the holes of a big city.'
        },
        5: {
          name: 'Beanbag Chair',
          short: 'Beanbag',
          desc: 'A soft pit to fall into after the shift.'
        },
        6: {
          name: 'Loft Coffee Table',
          short: 'Table',
          desc: 'Black metal, thick wood, room for a cup and a plan.'
        },
        7: {
          name: 'Velvet Sofa',
          short: 'Sofa',
          desc: 'Deep pile and a seat guests stay for.'
        },
        8: {
          name: 'IT Station',
          short: 'Station',
          desc: 'Two monitors and a quiet keyboard. Work does not argue with comfort.'
        },
        9: {
          name: 'QLED Home Theater',
          short: 'Cinema',
          desc: 'A wall of screen. The evening starts with one button.'
        },
        10: {
          name: 'Marble Island',
          short: 'Island',
          desc: 'Cold stone, a warm kitchen, two stools, and fruit.'
        },
        11: {
          name: 'Panoramic Bio Fireplace',
          short: 'Hearth',
          desc: 'A living flame without smoke, across the whole lounge.'
        },
        12: {
          name: 'Grand Piano',
          short: 'Piano',
          desc: 'Black lacquer, an open lid, and an evening that sounds expensive.'
        },
        13: {
          name: 'Terrace Jacuzzi',
          short: 'Jacuzzi',
          desc: 'Warm water above the night city.'
        },
        14: {
          name: 'Smart Penthouse',
          short: 'Penthouse',
          desc: 'Light, climate, and shades obey one gesture.'
        },
        15: {
          name: 'Golden Key of the Architect',
          short: 'Key',
          desc: 'The empire is assembled. The key to the roof is yours.'
        }
      },
      play: {
        spawn: 'Delivery',
        energy: '{current}/{max}',
        claim: 'Claim {money}',
        claimGems: 'Claim {money} and {crystals} gems',
        questMerge: 'Merge {target} items',
        questDiscover: 'Unlock a level {target} item',
        questEarn: 'Earn {target} coins',
        offlineTitle: 'Welcome back!',
        offlineBody: 'While you were away, your flats earned +{amount} coins.',
        offlineClaim: 'Collect',
        offlineDouble: 'Double for an ad 🎬',
        boardFull: 'The board is full',
        noEnergy: 'No delivery charges',
        discovered: 'New piece: {name}',
        maxItem: 'This is already the top of the collection'
      },
      monetize: {
        combo: 'COMBO x{n}!',
        newLevel: 'NEW LEVEL!',
        codex: 'Collection',
        codexTitle: 'Encyclopedia',
        codexReward: '+{amount} crystals',
        codexKept: 'Already in the workshop',
        codexClose: 'Close',
        x2: '🔥 Income x2 for 2 minutes 🎬',
        x2active: '🔥 x2 {time} left 🎬',
        energyOffer: '⚡ Full charge + 3 rare pieces for a video 🎬',
        later: 'Not now',
        drone: '🚁 Golden delivery drone · VIP client 🎬',
        auto: '🤖 Auto-merge for 60 seconds for a video 🎬',
        autoActive: '🤖 Auto-merge {time} 🎬',
        stageWarning: 'Moving to a new property in {sec}s...',
        chestItem: 'Chest: {name}',
        chestGold: '+{amount} 💰'
      },
      branch: {
        level: 'Lv {level}/{max}',
        buy: 'Buy · {price}',
        buyGems: 'Buy · {price} gems',
        verb: 'Buy',
        maxed: 'Maxed',
        base: {
          name: 'Delivery level',
          desc: 'New pieces arrive already a higher level.'
        },
        supply: {
          name: 'Supply speed',
          desc: 'Workshop charges recover faster.'
        },
        luck: {
          name: 'Generous delivery',
          desc: 'A chance to receive two or three matching pieces at once.'
        },
        rent: {
          name: 'Rent rate',
          desc: 'Each level raises the income of every piece by 25%.'
        },
        magnet: {
          name: 'Merge magnet',
          desc: 'Pairs on the board join themselves at a steady interval.'
        },
        baseNow: 'Delivery: level {level}',
        supplyNow: 'A charge every {seconds}s',
        luckNow: 'x2 {double}% · x3 {triple}%',
        rentNow: 'Income ×{mult}',
        magnetNow: 'A pair every {seconds}s',
        magnetOff: 'The magnet is still asleep'
      },
      quests: {
        firstCoins: {
          title: 'First estimate',
          desc: 'Earn {target} coins. The studio starts paying for itself.'
        },
        firstTool: {
          title: 'First tool',
          desc: 'Buy an upgrade. Levels needed: {target}.'
        },
        steady: {
          title: 'Steady income',
          desc: 'Raise income to {target} per second.'
        },
        float: {
          title: 'Paint cushion',
          desc: 'Save {target} coins for the finish.'
        },
        crew: {
          title: 'Own crew',
          desc: 'Total upgrade levels: {target}.'
        },
        sparkle: {
          title: 'First sparkle',
          desc: 'Collect {target} crystals.'
        },
        tempo: {
          title: 'Renovation tempo',
          desc: 'Push income to {target} per second.'
        },
        cushion: {
          title: 'Soft capital',
          desc: 'Earn {target} coins.'
        },
        atelier: {
          title: 'Atelier hours',
          desc: 'Reach {target} total upgrade levels.'
        },
        jewels: {
          title: 'Casket',
          desc: 'Hold {target} crystals.'
        },
        rhythm: {
          title: 'Even home',
          desc: 'Income of {target} per second. The flat sounds calm.'
        },
        fortune: {
          title: 'Large estimate',
          desc: 'Save {target} coins.'
        },
        mansion: {
          title: 'Full floor',
          desc: 'Total upgrade levels: {target}.'
        },
        skyline: {
          title: 'Roofline',
          desc: 'Raise income to {target} per second.'
        },
        aurelia: {
          title: 'Name on the door',
          desc: 'Final capital: {target} coins. The penthouse is yours.'
        }
      },
      upgrade: {
        rent: {
          name: 'Collecting Rent',
          desc: 'A tidy lobby, and the tenants pay without a reminder.'
        },
        tips: {
          name: 'Kind Tips',
          desc: 'Guests leave coins for the warm light in the hall.'
        },
        crew: {
          name: 'Work Crew',
          desc: 'Two makers finish what used to take you a week.'
        },
        parquet: {
          name: 'Parquet',
          desc: 'A herringbone floor raises the price of every rented hour.'
        },
        light: {
          name: 'Designer Light',
          desc: 'The right lamp makes the same room worth more.'
        },
        concierge: {
          name: 'Concierge',
          desc: 'Someone greets the guests while income keeps moving.'
        },
        showcase: {
          name: 'Street Showcase',
          desc: 'The street window works as a quiet advertisement.'
        },
        marble: {
          name: 'Marble',
          desc: 'Cold stone, warm markup.'
        },
        crystalEye: {
          name: 'Quartz Eye',
          desc: 'A crystal glints in the finish more and more often.'
        },
        vault: {
          name: 'Lobby Vault',
          desc: 'Spare coins stop getting lost between boxes.'
        },
        atelier: {
          name: 'Atelier',
          desc: 'Sketches on the wall teach the room to cost more.'
        },
        fountain: {
          name: 'Fountain',
          desc: 'Quiet water in the lobby draws one more crystal.'
        },
        contract: {
          name: 'Lease Contract',
          desc: 'A long lease locks in a percentage, not a promise.'
        },
        penthouse: {
          name: 'Penthouse',
          desc: 'The top floor pays as if the city were yours.'
        },
        developer: {
          name: 'Developer',
          desc: 'You no longer repair a studio. You set the price of the block.'
        }
      },
      pack: {
        pouch: {
          name: 'Coin Envelope',
          desc: 'A slim stack for paint and the first lamp.'
        },
        safe: {
          name: 'Home Safe',
          desc: 'A reserve large enough for a serious finish.'
        },
        satchel: {
          name: 'Foreman Satchel',
          desc: 'A heavy bag. Inside, only coins and sawdust.'
        },
        chip: {
          name: 'Handful of Crystals',
          desc: 'A few sharp stones for an honest sack of coins.'
        },
        casket: {
          name: 'Crystal Casket',
          desc: 'Velvet, a latch, and enough sparkle for the showcase.'
        },
        strongbox: {
          name: 'Safe Deposit',
          desc: 'Crystals that stay silent until the door opens.'
        }
      }
    }
  };

  function dig(root, path) {
    var node = root;
    var parts = path.split('.');
    for (var i = 0; i < parts.length; i += 1) {
      if (node == null) return undefined;
      node = node[parts[i]];
    }
    return node;
  }

  function format(template, vars) {
    if (typeof template !== 'string') return '';
    return template.replace(/\{(\w+)\}/g, function (_, key) {
      if (!vars || vars[key] == null) return '';
      return String(vars[key]);
    });
  }

  var listeners = new Set();

  var I18n = {
    lang: 'ru',
    dict: DICT,

    t: function (path, vars) {
      var value = dig(DICT[this.lang], path);
      if (typeof value !== 'string') value = dig(DICT.en, path);
      if (typeof value !== 'string') return path;
      return format(value, vars);
    },

    get: function (path) {
      var value = dig(DICT[this.lang], path);
      if (value == null) value = dig(DICT.en, path);
      return value;
    },

    setLang: function (lang) {
      var next = lang === 'ru' ? 'ru' : 'en';
      var changed = this.lang !== next;
      this.lang = next;
      if (document.documentElement) document.documentElement.lang = next;
      if (document.title != null) document.title = this.t('meta.title');
      this.apply(document);
      if (changed) {
        listeners.forEach(function (fn) { fn(next); });
      }
    },

    toggle: function () {
      this.setLang(this.lang === 'ru' ? 'en' : 'ru');
      return this.lang;
    },

    apply: function (root) {
      var scope = root && root.querySelectorAll ? root : document;
      var nodes = scope.querySelectorAll('[data-i18n]');
      for (var i = 0; i < nodes.length; i += 1) {
        nodes[i].textContent = this.t(nodes[i].getAttribute('data-i18n'));
      }
      var ariaNodes = scope.querySelectorAll('[data-i18n-aria]');
      for (var j = 0; j < ariaNodes.length; j += 1) {
        ariaNodes[j].setAttribute('aria-label', this.t(ariaNodes[j].getAttribute('data-i18n-aria')));
      }
    },

    onChange: function (fn) {
      listeners.add(fn);
      return function () { listeners.delete(fn); };
    }
  };

  window.AureliaI18n = I18n;
})();
