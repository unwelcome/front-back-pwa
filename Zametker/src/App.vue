<template>
  <statusWindow/>
  <div class="w-svw h-svh flex flex-col gap-4 justify-start items-center bg-slate-50">
    <div class="flex flex-col w-full lg:w-[800px] items-stretch grow gap-2 bg-gray-200 overflow-hidden">
      <div class="text-center pt-1">
        <p class="text-m text-gray-600">Статус подключения: <span class="font-medium" :class="{'text-red-600' : isOffline, 'text-cyan-600' : !isOffline}">{{ isOffline ? 'оффлайн' : 'онлайн' }}</span></p> 
      </div>
      <div class="flex flex-col gap-2 grow p-4 scrollable">

        <noteItem v-for="note of notesArray" 
          :id="note.id" 
          :title="note.title" 
          :text="note.text"
          @change-note="changeNote"
          @delete-note="deleteNote"
          />

        <p v-if="notesArray.length === 0" class="text-lg text-center w-full text-gray-500">Здесь будут ваши заметки...</p>

      </div>
      <div class="flex flex-col gap-2 items-stretch p-4">
        <!--Ввод названия-->
        <input 
          type="text" 
          class="border-2 border-solid border-gray-300 rounded-md px-2 py-1 bg-slate-50 outline-none focus:border-cyan-500 transition-colors" 
          placeholder="Введите название записки..." 
          v-model="title"
          />
        <!--Ввод текста-->
        <textarea 
          type="text" 
          class="border-2 border-solid border-gray-300 rounded-md px-2 py-1 bg-slate-50 outline-none focus:border-cyan-500 h-52 resize-none transition-colors" 
          placeholder="Введите текст записки..." 
          v-model="text"
          ></textarea>
        <!--Кнопка создания-->
        <input 
          type="button" 
          class=" bg-cyan-600 text-slate-50 cursor-pointer rounded-md px-2 py-1 font-medium hover:bg-cyan-500 active:bg-cyan-700 transition-colors" 
          :value="changeNoteID === null ? 'Создать запись' : 'Обновить запись'" 
          @click="createNote"
          />
      </div>
    </div>
  </div>
</template>
<script lang="ts">

import noteItem from './shared/noteItem.vue';
import { useStatusWindowAPI } from './widgets/StatusWindow/statusWindowAPI';
import statusWindow from './widgets/StatusWindow/components/statusWindow.vue';

import NotesDB from './db/indexedDB';

interface INote{
  id: number, 
  title: string, 
  text: string,
}

export default {
  components: {
    statusWindow,
    noteItem,
  },
  data(){
    return{
      StatusWindowAPI: useStatusWindowAPI(),

      dbHandler: new NotesDB(),

      notesArray: [] as Array<INote>,
      changeNoteID: null as number | null,
      title: '',
      text: '',

      isOffline: false,
    }
  },
  async mounted() {
    //Проверка подклбючения
    this.updateOnlineStatus();
    try{
      //Подключение к бд
      await this.dbHandler.init();
      try{ //Получение всех записей из бд
        this.notesArray = await this.dbHandler.getAllNotes();
      }
      catch(e){
        this.StatusWindowAPI.createStatusWindow({status: this.StatusWindowAPI.getCodes.error, text: 'Неудалось получить заметки!'});
      }
    }
    catch(e){
      this.StatusWindowAPI.createStatusWindow({status: this.StatusWindowAPI.getCodes.error, text: 'Неудалось подключиться к бд!'});
    }
    //Добавление слушателей
    window.addEventListener('online', this.updateOnlineStatus);
    window.addEventListener('offline', this.updateOnlineStatus);
  },
  beforeUnmount() { //Удаление слушателей
    window.removeEventListener('online', this.updateOnlineStatus);
    window.removeEventListener('offline', this.updateOnlineStatus);
  },
  methods: {
    updateOnlineStatus() {
      this.isOffline = !navigator.onLine;
    },
    findNoteByID(noteID: number): INote | null{
      for(let note of this.notesArray){
        if(note.id === noteID) return note;
      }
      return null;
    },
    changeNote(noteID: number){
      const note = this.findNoteByID(noteID);
      if(note === null) return;
      this.title = note.title;
      this.text = note.text;
      this.changeNoteID = noteID;
    },
    async deleteNote(noteID: number){
      try{
        //Удаляем записку
        await this.dbHandler.deleteNote(noteID);
        //Удаляем ее из массива
        this.notesArray = this.notesArray.filter(note => note.id !== noteID);
        this.StatusWindowAPI.createStatusWindow({status: this.StatusWindowAPI.getCodes.success, text: 'Записка удалена!'});
      }
      catch(e){
        this.StatusWindowAPI.createStatusWindow({status: this.StatusWindowAPI.getCodes.error, text: 'Неудалось обновить заметку!'});
      }
    },
    async createNote(){
      if(this.title !== '' && this.text !== ''){
        //если мы изменяем существующую записку
        if(this.changeNoteID !== null){
          try{
            //Обновляем записку
            await this.dbHandler.updateNote({id: this.changeNoteID, title: this.title, text: this.text});
            //Обновляем записоку в массиве
            const note = this.findNoteByID(this.changeNoteID);
            if(note){
              note.title = this.title;
              note.text = this.text;
            }
            //Очищаем
            this.changeNoteID = null; 
            this.title = '';
            this.text = '';
            //Сообщение об успехе
            this.StatusWindowAPI.createStatusWindow({status: this.StatusWindowAPI.getCodes.success, text: 'Записка обновлена!'});
          }
          catch(e){
            this.StatusWindowAPI.createStatusWindow({status: this.StatusWindowAPI.getCodes.error, text: 'Неудалось обновить заметку!'});
          }
        }
        else{ // если создаем новую записку
          try{
            const newNote = await this.dbHandler.addNote({title: this.title, text: this.text});
            // Если неудалосб добавить - ошибка
            if(!newNote) throw new Error();

            // иначе добавляем в массив
            this.notesArray.push(newNote);
            //Очищаем
            this.title = '';
            this.text = '';
          }
          catch(e){
            this.StatusWindowAPI.createStatusWindow({status: this.StatusWindowAPI.getCodes.error, text: 'Неудалось добавить заметку!'});
          }
        }
        return;
      }
      if(this.title === ''){
        this.StatusWindowAPI.createStatusWindow({status: this.StatusWindowAPI.getCodes.error, text: 'Введите название записки!'});
      }
      if(this.text === ''){
        this.StatusWindowAPI.createStatusWindow({status: this.StatusWindowAPI.getCodes.error, text: 'Введите текст записки!'});
      }
    }
  }
}
</script>
<style lang="css" scoped>
  .scrollable {
    --scroll-track-color: rgb(161, 161, 161);
    --scroll-thumb-color: #2d8b05;
    --scroll-bar-width: 6px;
    --scroll-bar-border-radius: calc(var(--scroll-bar-width) / 2);

    overflow-y: scroll;
    scrollbar-width: var(--scroll-bar-width);
    touch-action: pan-y;
  }
  .scrollable::-webkit-scrollbar {
    width: var(--scroll-bar-width);
  }
  .scrollable::-moz-scrollbar {
    width: var(--scroll-bar-width);
  }
  .scrollable::-webkit-scrollbar-track {
    background-color: var(--scroll-track-color);
    border-radius: var(--scroll-bar-border-radius);
    -webkit-transition: background-color 1s ease-in-out;
    transition: background-color 1s ease-in-out;
  }
  .scrollable::-moz-scrollbar-track {
    background-color: var(--scroll-track-color);
    border-radius: var(--scroll-bar-border-radius);
    -moz-transition: background-color 1s ease-in-out;
    transition: background-color 1s ease-in-out;
  }
  .scrollable::-webkit-scrollbar-thumb {
    background-color: var(--scroll-thumb-color);
    border-radius: var(--scroll-bar-border-radius);
    -webkit-transition: background-color 1s ease-in-out;
    transition: background-color 1s ease-in-out;
  }
  .scrollable::-moz-scrollbar-thumb {
    background-color: var(--scroll-thumb-color);
    border-radius: var(--scroll-bar-border-radius);
    -moz-transition: background-color 1s ease-in-out;
    transition: background-color 1s ease-in-out;
  }

</style>