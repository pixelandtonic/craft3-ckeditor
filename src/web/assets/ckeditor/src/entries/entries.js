import {Plugin} from 'ckeditor5';
import CraftEntriesEditing from './entriesediting';
import CraftEntriesUI from './entriesui';

export default class CraftEntries extends Plugin {
  static get requires() {
    return [CraftEntriesEditing, CraftEntriesUI];
  }

  static get pluginName() {
    return 'CraftEntries';
  }
}
