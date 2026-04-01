import { AnswerTemplateList } from './AnswerTemplateList';
import { AnswerTemplateCreate } from './AnswerTemplateCreate';

const answerTemplates = {
    list: AnswerTemplateList,
    create: AnswerTemplateCreate,
    // edit is disabled because API doesn't support GET /templates/{id}
};

export default answerTemplates;
