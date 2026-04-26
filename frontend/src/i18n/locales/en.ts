export default {
  tabs: {
    gallery: 'Gallery',
    similarity: 'Similar Photos',
    persons: 'People',
  },
  appTitle: 'Smart Photo Manager',

  indexing: {
    title: 'Scan Photo Folder',
    placeholder: 'Folder path  —  Windows: C:\\Users\\Photos  |  Mac: /Users/name/Pictures',
    startButton: 'Start Scan',
    scanning: 'Scanning...',
    backendDown: '⚠ Backend is not running — run start.bat / start.sh',
    done: 'Successfully scanned {{count}} photos',
  },

  similarity: {
    sliderTitle: 'Similarity Level',
    levelMin: '0 — Identical',
    levelMax: '10 — Very similar',
    searchButton: 'Find Similar Photos',
    searching: 'Searching...',
    bulkDelete: 'Auto-delete duplicates ({{count}} groups)',
    bulkConfirm: 'Auto-delete duplicates from {{count}} groups? (The largest file in each group will be kept)',
    noResults: 'No similar photos found at level {{level}}',
    groupsFound: 'Found <strong>{{count}}</strong> groups of similar photos',
    groupsHint: '• Click a photo to mark for deletion (red) / keep (green)',
    score: 'Similarity: {{score}}',
    photos: '{{count}} photos',
    keepLargest: 'Keep largest',
    confirm: 'Confirm',
    bulkError: 'Error during bulk resolve',
    resolveError: 'Error saving selection',
    levels: {
      0: 'Identical — pixel for pixel',
      2: 'Duplicates (crop / resize)',
      4: 'Same photo, different compression',
      6: 'Same scene, different angle',
      8: 'Same event',
      10: 'Same people, similar location',
    },
  },

  gallery: {
    count: '{{count}} photos',
    loading: 'Loading...',
    deleteConfirm: 'Move to trash?',
    prev: '← Prev',
    next: 'Next →',
    page: '{{page}} / {{total}}',
    faces: '{{count}} faces',
  },

  persons: {
    title: 'Add Person',
    placeholder: 'Person\'s name',
    addButton: 'Add',
    editButton: 'Edit',
    photoCount: '{{count}} photos',
    empty: 'No people defined yet. They will be added automatically when photos are scanned.',
  },

  folderPicker: {
    title: 'Select Folder',
    loading: 'Loading...',
    error: 'Cannot access this folder',
    empty: 'Empty folder',
    up: '..',
    cancel: 'Cancel',
    select: 'Select This Folder',
    currentPath: 'Select a folder',
  },
}
