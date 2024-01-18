import { SUBJECTS } from '../constants';

export const AbilitySubject = {
  add: (subjects: { [key: string]: string }) => {
    Object.keys(subjects).forEach((key) => {
      SUBJECTS[key] = subjects[key];
    });
  },

  list: () => {
    const result: { [key: string]: string } = {};
    Object.keys(SUBJECTS).forEach((key) => {
      if (typeof SUBJECTS[key] === 'function') return;
      result[key] = SUBJECTS[key];
    });
    return result;
  },

  listArray: () => {
    const result: string[] = [];
    Object.keys(SUBJECTS).forEach((key) => {
      if (typeof SUBJECTS[key] === 'function') return;
      result.push(SUBJECTS[key]);
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
