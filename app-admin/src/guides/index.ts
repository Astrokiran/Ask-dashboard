import { GuideList } from './GuideList';
import { GuideCreate } from './GuideCreate';
import { GuideShow } from './GuideShow';
import { GuideEdit } from './GuideEdit'; // Make sure you have an Edit file too!

export default {
    list: GuideList,
    create: GuideCreate,
    edit: GuideEdit, // Use the same layout as create or customize it
    show: GuideShow,
};