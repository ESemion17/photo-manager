export default {
  tabs: {
    gallery: 'גלריה',
    similarity: 'תמונות דומות',
    persons: 'אנשים',
  },
  appTitle: 'ניהול תמונות חכם',

  indexing: {
    title: 'סריקת תיקיית תמונות',
    placeholder: 'נתיב לתיקייה  —  Windows: C:\\Users\\Photos  |  Mac: /Users/name/Pictures',
    startButton: 'התחל סריקה',
    scanning: 'סורק...',
    backendDown: '⚠ הבקאנד לא פעיל — הרץ את start.bat / start.sh',
    done: 'נסרקו {{count}} תמונות בהצלחה',
  },

  similarity: {
    sliderTitle: 'רמת דמיון לחיפוש',
    levelMin: '0 — זהה לחלוטין',
    levelMax: '10 — דומה מאוד',
    searchButton: 'חפש תמונות דומות',
    searching: 'מחפש...',
    bulkDelete: 'מחק כפולות אוטומטית ({{count}} קבוצות)',
    bulkConfirm: 'מחיקה אוטומטית מתוך {{count}} קבוצות? (ישמר הקובץ הגדול ביותר)',
    noResults: 'לא נמצאו תמונות דומות ברמה {{level}}',
    groupsFound: 'נמצאו <strong>{{count}}</strong> קבוצות של תמונות דומות',
    groupsHint: '• לחץ על תמונה לסמן למחיקה (אדום) / שמירה (ירוק)',
    score: 'דמיון: {{score}}',
    photos: '{{count}} תמונות',
    keepLargest: 'שמור הכי גדולה',
    confirm: 'אשר',
    bulkError: 'שגיאה בטיפול הגורף',
    resolveError: 'שגיאה בשמירת הבחירה',
    levels: {
      0: 'זהות מוחלטת — פיקסל לפיקסל',
      2: 'כפולות (crop / resize)',
      4: 'אותה תמונה, דחיסה שונה',
      6: 'אותה סצנה, זווית שונה',
      8: 'אותו אירוע',
      10: 'אותם אנשים, מיקום דומה',
    },
  },

  gallery: {
    count: '{{count}} תמונות',
    loading: 'טוען...',
    deleteConfirm: 'העבר לאשפה?',
    prev: '← קודם',
    next: 'הבא →',
    page: '{{page}} / {{total}}',
    faces: '{{count}} פנים',
  },

  persons: {
    title: 'הוסף אדם',
    placeholder: 'שם האדם',
    addButton: 'הוסף',
    editButton: 'עריכה',
    photoCount: '{{count}} תמונות',
    empty: 'אין אנשים מוגדרים. הם יתווספו אוטומטית כשתמונות יסרקו.',
  },

  folderPicker: {
    title: 'בחר תיקייה',
    loading: 'טוען...',
    error: 'לא ניתן לגשת לתיקייה',
    empty: 'תיקייה ריקה',
    up: '..',
    cancel: 'ביטול',
    select: 'בחר תיקייה זו',
    currentPath: 'בחר תיקייה',
  },
}
