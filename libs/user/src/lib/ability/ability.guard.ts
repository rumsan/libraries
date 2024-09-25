import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { CurrentUserInterface } from '@rumsan/sdk/interfaces';

import { ACTIONS, RSE } from '@rumsan/extensions/constants';
import { CHECK_ABILITY, RequiredRule } from './ability.decorator';

const createForUser = (user: CurrentUserInterface) => {
  const { permissions } = user;

  const { can, build } = new AbilityBuilder(createMongoAbility);

  // Define default rules for all users (e.g., unauthenticated users)
  can('read', 'public'); // Example: Allow all users to read 'public' resources

  // Define rules based on user-specific permissions
  permissions.forEach((permission) => {
    if (permission.inverted) {
      can(permission.action, permission.subject, { inverted: true });
    } else {
      can(
        permission.action,
        permission.subject,
        JSON.parse(permission.conditions),
      );
    }
  });

  return build();
};
@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Required rules sent from controller
    const rules: any =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      [];
    const { actions, subject } = rules;

    const skipAbilitiesGuard = this.reflector.get<boolean>(
      'skipAbilitiesGuard',
      context.getHandler(),
    );

    if (skipAbilitiesGuard) {
      return true;
    }

    if (!subject || !actions) {
      return false;
    }

    const user: CurrentUserInterface = context.switchToHttp().getRequest().user;

    if (!user) {
      throw RSE('User not authenticated.');
    }

    const ability = createForUser(user);

    if (!ability) {
      throw RSE('User does not have the necessary permissions.');
    }

    let routeActions = actions;
    if (actions === '*') {
      routeActions = [
        ACTIONS.CREATE,
        ACTIONS.READ,
        ACTIONS.UPDATE,
        ACTIONS.DELETE,
      ];
    }
    const actionsArray = Array.isArray(routeActions)
      ? routeActions
      : [routeActions];
    let isAllowed = false;

    for (const action of actionsArray) {
      if (ability.can(action, subject)) {
        isAllowed = true;
        break; // Exit the loop as soon as one action is allowed
      }
    }

    if (!isAllowed) {
      throw RSE('User does not have permission to perform this action.');
    }

    return isAllowed;
  }
}
export const SkipAbilitiesGuard = () => SetMetadata('skipAbilitiesGuard', true);
