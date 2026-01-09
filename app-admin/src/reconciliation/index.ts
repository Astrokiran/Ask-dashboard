import { RefundableConsultationsList } from './RefundableConsultationsList';
import { ReconciliationOffersList } from './ReconciliationOffersList';

const reconciliation = {
    list: RefundableConsultationsList,
};

const reconciliationOffers = {
    list: ReconciliationOffersList,
};

export { reconciliation, reconciliationOffers };
export default reconciliation;
