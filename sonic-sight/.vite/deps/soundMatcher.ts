interface Sound {
    name: string;

    bass: number;
    mid: number;
    treble: number;
}

class SoundDatabase {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private storeName: string;

  constructor(dbName: string = 'soundDB', storeName: string = 'sounds') {
    this.dbName = dbName;
    this.storeName = storeName;
    SoundDatabase.initDB(dbName, storeName)
        .then((db) => {
            this.db = db;
            console.log("Database Initialised Successfully");
        })
        .catch((error) => {
            console.log("Failed");
        });
  }

  // Initialize the IndexedDB
  static async initDB(dbName:string, storeName:string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onerror = (event) => reject('Database error: ' + (event.target as IDBRequest).error);

      request.onsuccess = (event) => {
        const db = (event.target as IDBRequest).result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'name' });  // 'name' is the key for each sound
        }
      };
    });
  }

  // Load all sounds from the database
  async loadSounds(): Promise<Sound[]> {
    if (this.db == null) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll(); // Get all sounds from the store
      request.onsuccess = () => resolve(request.result as Sound[]);
      request.onerror = (event) => reject('Error fetching sounds: ' + (event.target as IDBRequest).error?.message);
    });
  }

  // Add a new sound to the database
  async addSound(sound: Sound): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.add(sound);
      request.onsuccess = () => resolve('Sound added successfully');
      request.onerror = (event) => reject('Error adding sound: ' + (event.target as IDBRequest).error?.message);
    });
  }
}
