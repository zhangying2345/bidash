export class ItemSelector {
  /**
   *
   *
   * @param array T[]
   * @param selectedItem T
   * @param uniqueKey string
   * @memberof ItemSelector
   */
  static setSelectedFlag<T>(array: T[], selectedFlag: string = 'selected', selectedItem?: T, uniqueKey: string = 'id') {
    array.forEach((citem, id) => {
      citem[selectedFlag] = selectedItem && uniqueKey ? (citem[uniqueKey] === selectedItem[uniqueKey]) : (id === 0);
    });
  }

  /**
   *
   *
   * @param array T[]
   * @memberof ItemSelector
   */
  static clearSelectedFlag<T>(array: T[], selectedFlag: string = 'selected', childrenFlag: string = 'children') {
    array.forEach((item) => {
      item[selectedFlag] = false;
      if (item[childrenFlag] && item[childrenFlag].length !== 0) {
        this.clearSelectedFlag(item[childrenFlag], selectedFlag, childrenFlag);
      }
    });
  }

  /**
   *
   *
   * @param array T[]
   * @memberof ItemSelector
   */
  static findSelectedItem<T>(array: T[], selectedFlag: string = 'selected', childrenFlag: string = 'children') {
    const selectedItem = array.find((item) => item[selectedFlag]);
    if (selectedItem) {
      return selectedItem;
    }
    const childrenArray = array.filter((_item) => _item[childrenFlag] && _item[childrenFlag].length !== 0);
    if (!childrenArray || childrenArray.length === 0) {
      return array[0];
    }
    childrenArray.forEach((_citem) => {
      if (_citem[childrenFlag] && _citem[childrenFlag].length !== 0) {
        this.findSelectedItem(_citem[childrenFlag], selectedFlag, childrenFlag);
      }
    })
  }


  /**
   *  if the deleted one is not selected,just delete it
   *  if the deleted one is selected and the last one,then select the previous one by default
   *  if the deleted one is selected but not the last one,then select the next one by default
   *
   * @param array T[]
   * @memberof ItemSelector
   */
  static selectItemAfterDelete<T>(array: T[], deletedItem: T, previousSelectedItem: T, selectedFlag: string = 'selected', indexFlag: string = 'index') {
    return deletedItem[selectedFlag] ?
      (deletedItem[indexFlag] === array.length - 1 ? array[deletedItem[indexFlag] - 1] : array[deletedItem[indexFlag] + 1]) :
      previousSelectedItem;
  }
}
