export default {
  tabs: {
    gallery: 'Галерея',
    similarity: 'Похожие фото',
    persons: 'Люди',
  },
  appTitle: 'Умный менеджер фото',

  indexing: {
    title: 'Сканирование папки',
    placeholder: 'Путь к папке  —  Windows: C:\\Users\\Photos  |  Mac: /Users/name/Pictures',
    startButton: 'Начать сканирование',
    scanning: 'Сканирование...',
    backendDown: '⚠ Сервер не запущен — запустите start.bat / start.sh',
    done: 'Успешно отсканировано {{count}} фото',
  },

  similarity: {
    sliderTitle: 'Уровень похожести',
    levelMin: '0 — Идентичные',
    levelMax: '10 — Очень похожие',
    searchButton: 'Найти похожие фото',
    searching: 'Поиск...',
    bulkDelete: 'Авто-удалить дубликаты ({{count}} групп)',
    bulkConfirm: 'Автоматически удалить дубликаты из {{count}} групп? (Самый большой файл в каждой группе будет сохранён)',
    noResults: 'Похожие фото не найдены при уровне {{level}}',
    groupsFound: 'Найдено <strong>{{count}}</strong> групп похожих фото',
    groupsHint: '• Нажмите на фото, чтобы отметить для удаления (красный) / сохранения (зелёный)',
    score: 'Схожесть: {{score}}',
    photos: '{{count}} фото',
    keepLargest: 'Оставить наибольшее',
    confirm: 'Подтвердить',
    bulkError: 'Ошибка при массовом удалении',
    resolveError: 'Ошибка при сохранении выбора',
    levels: {
      0: 'Полностью идентичные — пиксель в пиксель',
      2: 'Дубликаты (обрезка / изменение размера)',
      4: 'Одно фото, разное сжатие',
      6: 'Одна сцена, разный угол',
      8: 'Одно событие',
      10: 'Те же люди, похожее место',
    },
  },

  gallery: {
    count: '{{count}} фото',
    loading: 'Загрузка...',
    deleteConfirm: 'Переместить в корзину?',
    prev: '← Назад',
    next: 'Вперёд →',
    page: '{{page}} / {{total}}',
    faces: '{{count}} лиц',
  },

  persons: {
    title: 'Добавить человека',
    placeholder: 'Имя человека',
    addButton: 'Добавить',
    editButton: 'Изменить',
    photoCount: '{{count}} фото',
    empty: 'Люди не добавлены. Они будут добавлены автоматически при сканировании.',
  },

  folderPicker: {
    title: 'Выбрать папку',
    loading: 'Загрузка...',
    error: 'Нет доступа к папке',
    empty: 'Пустая папка',
    up: '..',
    cancel: 'Отмена',
    select: 'Выбрать эту папку',
    currentPath: 'Выберите папку',
  },
}
