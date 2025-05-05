// src/utils/validations.js

export const validateEmail = (email) => {
    const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return re.test(email);
  };
  
  export const validatePhone = (phone) => {
    const re = /^\d{10}$/; // Accepts 10-digit numbers
    return re.test(phone);
  };
  
  export const validateFileType = (file, allowedTypes) => {
    return file && allowedTypes.includes(file.type);
  };
  
  export const validateFileSize = (file, maxSizeMB) => {
    return file && file.size <= maxSizeMB * 1024 * 1024;
  };
  