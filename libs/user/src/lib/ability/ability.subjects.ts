import { SUBJECTS } from '../constants';

//TODO: register source of subjects
const subjectsList: any = SUBJECTS;

export const AbilitySubject = {
  add: (subjects: { [key: string]: string }, source: string = '') => {
    Object.keys(subjects).forEach((key) => {
      subjectsList[key] = subjects[key];
    });
  },

  list: () => {
    const result: { [key: string]: string } = {};
    Object.keys(SUBJECTS).forEach((key) => {
      if (typeof subjectsList[key] === 'function') return;
      result[key] = subjectsList[key];
    });
    return result;
  },

  listArray: () => {
    const result: string[] = [];
    Object.keys(SUBJECTS).forEach((key) => {
      if (typeof subjectsList[key] === 'function') return;
      result.push(subjectsList[key]);
    });
    return result;
  },

  checkForValidSubjects: (subjects: string | string[]) => {
    const validSubjects = AbilitySubject.listArray();
    if (typeof subjects === 'string') {
      return {
        isValid: validSubjects.includes(subjects),
        validSubjects,
      };
    }
    return {
      isValid: subjects.every((s) => validSubjects.includes(s)),
      validSubjects,
    };
  },
};
