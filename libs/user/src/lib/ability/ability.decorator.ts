import { SetMetadata } from '@nestjs/common';

export const CHECK_ABILITY = 'check_ability';

export interface RequiredRule {
  action: string;
  subject: string;
  conditions?: any;
}

// export const CheckAbilities = (...requirements: RequiredRule[]) =>
//   SetMetadata(CHECK_ABILITY, requirements);

export const CheckAbilities = (options: {
  actions: string | string[];
  subject: string;
}) => SetMetadata(CHECK_ABILITY, options);
