import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@rumsan/prisma';
import { CreateRoleDto, EditRoleDto } from './dto';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let rolesService: RolesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesService, PrismaService],
    }).compile();

    rolesService = module.get<RolesService>(RolesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(rolesService).toBeDefined();
  });

  describe('create', () => {
    it('should create a role and return it', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'TestRole',
        // Add other properties as needed for your DTO
      };

      const mockRole = {
        id: 1,
        name: 'TestRole',
        // Add other properties as needed for your Role entity
      };

      jest.spyOn(prismaService.role, 'create').mockResolvedValueOnce(mockRole);

      const result = await rolesService.create(createRoleDto);

      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('should update a role and return it', async () => {
      const roleId = 1;
      const editRoleDto: EditRoleDto = {
        // Add properties to update in the DTO
      };

      const mockRole = {
        id: roleId,
        name: 'UpdatedRoleName',
        // Add other properties as needed for your Role entity
      };

      jest.spyOn(prismaService.role, 'update').mockResolvedValueOnce(mockRole);

      const result = await rolesService.update(roleId, editRoleDto);

      expect(result).toEqual(mockRole);
    });
  });

  // Add more test cases for other functions as needed
});
