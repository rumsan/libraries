import { ACTIONS } from '../constants';

//TODO: register source of actions
const actionsList: any = ACTIONS;

export const AbilityAction = {
  add: (actions: { [key: string]: string }) => {
    Object.keys(actions).forEach((key) => {
      actionsList[key] = actions[key];
    });
  },

  list: () => {
    const result: { [key: string]: string } = {};
    Object.keys(actionsList).forEach((key) => {
      if (typeof actionsList[key] === 'function') return;
      result[key] = actionsList[key];
    });
    return result;
  },

  listArray: () => {
    const result: string[] = [];
    Object.keys(actionsList).forEach((key) => {
      if (typeof actionsList[key] === 'function') return;
      result.push(actionsList[key]);
    });
    return result;
  },

  checkForValidActions: (actions: string | string[]) => {
    const validActions = AbilityAction.listArray();
    if (typeof actions === 'string') {
      return {
        isValid: validActions.includes(actions),
        validActions,
      };
    }
    return {
      isValid: actions.every((a) => validActions.includes(a)),
      validActions,
    };
  },
};
