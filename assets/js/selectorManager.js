export class SelectorManager {
    constructor() {
      this.selectors = {}; // Menyimpan ID selector
    }
  
    // Menambahkan ID ke dalam daftar selectors
    register(id) {
      // Tidak perlu memeriksa apakah elemen ada di DOM
      if (id && !this.selectors[id]) {
        this.selectors[id] = {
          id: id, // Menyimpan ID yang ditambahkan
          tagName: 'unknown' // Untuk elemen yang belum ada, kita asumsikan tagName 'unknown'
        };
      }
    }
  
    // Mendapatkan nilai ID selector
    getValue(id) {
      return this.selectors[id] ? this.selectors[id] : null;
    }
  
    // Mendapatkan semua nilai selectors
    getAllValues() {
      return this.selectors;
    }
  
    // Menambahkan selector dari input pengguna
    registerFromUI(inputId) {
      const newId = document.getElementById(inputId)?.value;
      if (newId) {
        this.register(newId); // Tambahkan ID baru ke selectors
      }
    }
  
    // Mengupdate tagName selector berdasarkan pilihan dropdown
    updateTagName(id, tagName) {
      if (this.selectors[id]) {
        this.selectors[id].tagName = tagName;
      }
    }
  
    // Menghubungkan dropdown tagName dengan selector
    connectTagNameDropdown(dropdownId, inputId) {
      const dropdown = document.getElementById(dropdownId);
      const input = document.getElementById(inputId);
      
      if (dropdown && input) {
        dropdown.addEventListener('change', () => {
          const selectedTag = dropdown.value;
          input.value = selectedTag;
  
          // Mengupdate tagName di selector
          this.updateTagName(inputId, selectedTag);
        });
      }
    }

    getAllValuesAsObject() {
        const result = {};
        for (const id in this.selectors) {
            const element = document.getElementById(id);
            if (element) {
                result[id] = element.value || element.textContent || '';
            } else {
                result[id] = '';
            }
        }
        return result;
    }
  }
  