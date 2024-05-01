exports.update = (entitiesToUpdate, existingModel) => {
    // Iterate through the properties of entitiesToUpdate
    for (let key in entitiesToUpdate) {
      const value = entitiesToUpdate[key];
  
      // Check if the value exists and is not null or undefined
      if (value !== undefined && value !== null) {
        existingModel[key] = value; // Update the existing model with the new value
      }
    }
    return existingModel;
  };