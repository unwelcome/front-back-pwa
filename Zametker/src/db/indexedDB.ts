export interface INote {
  id: number;
  title: string;
  text: string;
}

const DB_NAME = 'notesDB';
const DB_VERSION = 1; // Важно увеличивать версию при изменении структуры
const OBJECT_STORE_NAME = 'notes';
const DEVMODE = false;

class NotesDB {
  private db: IDBDatabase | undefined;

  // Инициализация базы данных
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        if(DEVMODE) console.error('Ошибка при открытии базы данных', event);
        reject(event);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        if(DEVMODE) console.log('База данных успешно открыта');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const objectStore = db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('title', 'title', { unique: false });
        if(DEVMODE) console.log('База данных обновлена/создана');
      };
    });
  }

  // Добавление заметки
  async addNote(note: Omit<INote, 'id'>): Promise<INote | undefined> {
    if (!this.db) {
      if(DEVMODE) console.error('База данных не инициализирована.');
      return undefined;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OBJECT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
      const request = objectStore.add(note);

      request.onsuccess = (event) => {
        const id = (event.target as IDBRequest).result as number;
        const newNote: INote = { id, ...note };
        if(DEVMODE) console.log('Заметка успешно добавлена, ID:', id);
        resolve(newNote);
      };

      request.onerror = (event) => {
        if(DEVMODE) console.error('Ошибка при добавлении заметки', event);
        reject(event);
      };
    });
  }

  // Получение всех заметок
  async getAllNotes(): Promise<INote[]> {
    if (!this.db) {
      if(DEVMODE) console.error('База данных не инициализирована.');
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OBJECT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
        const notes = (event.target as IDBRequest).result as INote[];
        if(DEVMODE) console.log('Заметки успешно получены', notes);
        resolve(notes);
      };

      request.onerror = (event) => {
        if(DEVMODE) console.error('Ошибка при получении заметок', event);
        reject(event);
      };
    });
  }

  // Получение заметки по ID
  async getNoteById(id: number): Promise<INote | undefined> {
    if (!this.db) {
      if(DEVMODE) console.error('База данных не инициализирована.');
      return undefined;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OBJECT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
      const request = objectStore.get(id);

      request.onsuccess = (event) => {
        const note = (event.target as IDBRequest).result as INote;
        if(DEVMODE) console.log(`Заметка с ID ${id} успешно получена`, note);
        resolve(note);
      };

      request.onerror = (event) => {
        if(DEVMODE) console.error(`Ошибка при получении заметки с ID ${id}`, event);
        reject(event);
      };
    });
  }

  // Обновление заметки
  async updateNote(note: INote): Promise<void> {
    if (!this.db) {
      if(DEVMODE) console.error('База данных не инициализирована.');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OBJECT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
      const request = objectStore.put(note);

      request.onsuccess = (event) => {
        if(DEVMODE) console.log(`Заметка с ID ${note.id} успешно обновлена`);
        resolve();
      };

      request.onerror = (event) => {
        if(DEVMODE) console.error(`Ошибка при обновлении заметки с ID ${note.id}`, event);
        reject(event);
      };
    });
  }

  // Удаление заметки по ID
  async deleteNote(id: number): Promise<void> {
    if (!this.db) {
      if(DEVMODE) console.error('База данных не инициализирована.');
      return;
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OBJECT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = (event) => {
        if(DEVMODE) console.log(`Заметка с ID ${id} успешно удалена`);
        resolve();
      };

      request.onerror = (event) => {
        if(DEVMODE) console.error(`Ошибка при удалении заметки с ID ${id}`, event);
        reject(event);
      };
    });
  }
}

export default NotesDB;