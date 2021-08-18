let db;
let budgetVersion;

// Create a new db request
const request = indexedDB.open('budget', budgetVersion || 21);

request.onupgradeneeded = function (e) {
    db = e.target.result;

    if (db.objectStoreNames.length === 0)
        db.createObjectStore('budgetList', { autoIncrement: true });
};

function checkDatabase() {
  // Open a transaction on your budgetList db
  let transaction = db.transaction(['budgetList'], 'readwrite');
  // access your budgetList object
  const store = transaction.objectStore('budgetList');
  // Get all records from store and set to a variable
  const getAll = store.getAll();

  // request success
  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // If our returned response is not empty
          if (res.length !== 0) {
            // Open another transaction to budgetList with the ability to read and write
            transaction = db.transaction(['budgetList'], 'readwrite');
            // Assign the current store to a variable
            const currentStore = transaction.objectStore('budgetList');
            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  db = e.target.result;

  // Check if app is online before reading from db
  if (navigator.onLine)
    checkDatabase();
};

const saveRecord = (record) => {
  // Create a transaction on the budgetList db with readwrite access
  const transaction = db.transaction(['budgetList'], 'readwrite');
  // Access your budgetList object store
  const store = transaction.objectStore('budgetList');
  // Add record to your store with add method.
  store.add(record);
};

// Listen for app coming back online
window.addEventListener('online', checkDatabase);
