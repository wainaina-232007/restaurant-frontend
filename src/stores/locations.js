// locations.js
import { defineStore } from 'pinia';
import api from '../services/api';

export const useLocationsStore = defineStore({
  id: 'locations',
  state: () => ({
    locations: [],
    snackbarCreate: false,
    snackbarUpdate: false,
    snackbarDelete: false,
    // snackbarTimeout: 3000,
    dialog: false,
    dialogDelete: false,
    // toolbarColor: 'info',
    editedIndex: -1,
    editedItem: {
      id: '',
      name: '',
    },
    defaultItem: {
      id: '',
      name: '',
    },
    itemToDelete: '',
  }),

  actions: {
    async fetchLocations() {
      try {
        const response = await api.get('location');
        this.locations = response.data;
      } catch (error) {
        console.error('Error fetching locations', error);
      }
    },

    async createLocation(location) {
      try {
        const response = await api.post('location', location);
        this.locations.push(response.data);
        this.snackbarCreate = true;        
      } catch (error) {
        console.error('Error creating location', error);
      }
    },

    async updateLocation(location) {
      try {
        await api.put(`location/${location.id}`, location);
        const index = this.locations.findIndex((s) => s.id === location.id);
        if (index !== -1) {
          this.locations[index] = location;
        }
        this.snackbarUpdate = true;        
      } catch (error) {
        console.error('Error updating location', error);
      }
    },

    deleteLocation(item) {
      this.editedIndex = item;
      this.itemToDelete = item;
      this.dialogDelete = true;
    },

    async deleteLocationConfirm() {
      try {
        await api.delete(`location/${this.itemToDelete}`);
        this.locations = this.locations.filter((s) => s.id !== this.itemToDelete);        
      } catch (error) {
        console.error('Error deleting location', error);
      }
      this.closeDelete();
    },

    openDialog() {
        this.editedIndex = -1; 
        this.editedItem = { id: '', name: '' };    
        this.dialog = true;   
      },

    async editItem(item) {
      try {
        console.log("Item to edit is ", item);
        const response = await api.get(`location/${item}`);
        this.editedIndex = item;
        this.editedItem = response.data;
        this.dialog = true;
      } catch (error) {
        console.error('Error fetching item for pre-update', error);
      }
    },

    close() {
      this.dialog = false;
    },
    
    closeDelete() {
      this.dialogDelete = false;
    },
    
    
  },
});
