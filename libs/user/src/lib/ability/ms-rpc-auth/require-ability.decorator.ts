import { SetMetadata } from '@nestjs/common';

export const REQUIRE_ABILITY_KEY = 'require_ability';

export interface RequireAbilityMetadata {
  action: string;
  subject: string;
}

export const RequireAbility = (action: string, subject: string) =>
  SetMetadata(REQUIRE_ABILITY_KEY, { action, subject });
