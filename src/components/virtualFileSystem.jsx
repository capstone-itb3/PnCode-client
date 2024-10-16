class VirtualFileSystem {
    constructor() {
      this.files = {};
    }
  
    addFile(path, content) {
      this.files[path] = content;
    }
  
    getFile(path) {
      return this.files[path] || null;
    }
  
    deleteFile(path) {
      delete this.files[path];
    }
  
    listFiles() {
      return Object.keys(this.files);
    }
  }
  
  export default VirtualFileSystem;
  