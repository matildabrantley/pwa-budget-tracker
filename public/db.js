let db;
let budgetVersion;
const request = indexedDB.open('budget', 2);

request.onupgradeneeded = function (e) {
    db = e.target.result;
    db.createObjectStore('budgetList', { autoIncrement: true });
  }

function checkDatabase() {

}

request.onsuccess = function (e) {
  db = e.target.result;
  checkDatabase();
};

const saveRecord = (recordData) => {
  const transaction = db.transaction(['budgetList'], 'readwrite');
  const objectStore = transaction.objectStore('budgetList');

  // Add record to your store with add method.
  objectStore.add(recordData);
};

window.addEventListener('online', checkDatabase);
