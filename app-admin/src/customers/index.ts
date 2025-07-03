// src/customers/index.ts
import { CustomerList } from './CustomerList';

export default {
    list: CustomerList,
    // Since create is handled in a dialog, we don't need a separate create page
};