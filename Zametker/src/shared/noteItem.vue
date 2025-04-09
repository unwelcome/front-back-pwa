<template>
  <div class="flex flex-col gap-1 p-2 rounded bg-slate-50">
    <div class="flex flex-col gap-1 cursor-pointer" @click="isOpen = !isOpen">
      <h2 class="text-lg font-medium">{{ title }}</h2>
      <p>{{ text }}</p>
    </div>
    <div v-if="isOpen" class="flex flex-row gap-4">
      <input 
        type="button" 
        value="Изменить" 
        class="px-2 py-1 text-slate-50 transition-colors bg-amber-600 hover:bg-amber-500 active:bg-amber-700 rounded-lg cursor-pointer select-none"
        @click="changeNote"/>
      <input 
        type="button" 
        value="Удалить" 
        class="px-2 py-1 text-slate-50 transition-colors bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-lg cursor-pointer select-none"
        @click="deleteNote"/>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  emits: ['deleteNote', 'changeNote'],
  props: {
    id: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  data() {
    return{
      isOpen: false,
    } 
  },
  methods: {
    changeNote(){
      this.$emit('changeNote', this.id);
      this.isOpen = false;
    },
    deleteNote(){
      this.$emit('deleteNote', this.id);
      this.isOpen = false;
    }
  }
}
</script>