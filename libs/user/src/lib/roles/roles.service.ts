import { Injectable } from '@nestjs/common';
import { Permission, Prisma, PrismaClient, Role } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import {
  CreateRoleDto,
  EditRoleDto,
  ListRoleDto,
} from '@rumsan/extensions/dtos';
import { PaginatorTypes, PrismaService, paginator } from '@rumsan/prisma';
import { StringUtils } from '@rumsan/sdk/utils';
import { ERRORS } from '../constants';
import { RSE } from '../constants/errors';
import { PermissionSet } from '../interfaces';
import {
  checkPermissionSet,
  convertToPermissionSet,
} from '../utils/permission.utils';

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 20 });
type PrismaClientType = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$on' | '$connect' | '$disconnect' | '$use' | '$transaction' | '$extends'
>;

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    if (!StringUtils.isValidString(dto.name)) throw ERRORS.ROLE_NAME_INVALID;
    const { permissions, ...data } = dto;
    const { isValid, validSubjects } = checkPermissionSet(permissions);
    if (!isValid)
      throw RSE(
        `Invalid permission set. Valid subjects are {{validSubjects}}.`,
        'PERMISSION_SET_INVALID',
        400,
        { validSubjects: validSubjects.join(', ') },
      );

    return this.prisma.$transaction(async (prisma) => {
      const role = await prisma.role.create({ data });
      await this._addPermissionsToRole(role.id, permissions, prisma);

      return role;
    });
  }

  async update(roleName: string, dto: EditRoleDto) {
    return this.prisma.$transaction(async (prisma) => {
      const { role: existingRole } = await this.getRoleByName(roleName);
      const { permissions, ...data } = dto;

      // Update the role details
      const updatedRole = await prisma.role.update({
        where: { id: existingRole.id },
        data,
      });

      // If permissions are provided, update them
      if (permissions) {
        // Delete existing permissions
        await prisma.permission.deleteMany({
          where: { roleId: existingRole.id },
        });

        await this._addPermissionsToRole(existingRole.id, permissions, prisma);
      }

      return {
        role: updatedRole,
        permissions: await this._getPermissionsByRoleId(updatedRole.id, prisma),
      };
    });
  }

  async delete(name: string) {
    return this.prisma.$transaction(async (prisma) => {
      const { role } = await this.getRoleByName(name);
      if (role.isSystem)
        throw RSE('System roles cannot be deleted.', 'ROLE_SYS_NODELETE', 401);

      // Delete existing permissions
      await prisma.permission.deleteMany({
        where: { roleId: role.id },
      });

      return prisma.role.delete({ where: { id: role.id, isSystem: false } });
    });
  }

  async list(dto: ListRoleDto): Promise<PaginatorTypes.PaginatedResult<Role>> {
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[dto.sort] = dto.order;

    return paginate(
      this.prisma.role,
      {
        orderBy,
      },
      {
        page: dto.page,
        perPage: dto.perPage,
      },
    );
  }

  async getById(roleId: number) {
    return this.prisma.role.findUnique({ where: { id: +roleId } });
  }

  async getRoleByName(name: string, includePermissions = false) {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) throw RSE('Roles does not exist!', 'ROLE_NOEXIST', 404);
    if (includePermissions) {
      const permissions = await this._getPermissionsByRoleId(role.id);
      return { role, permissions };
    }
    return { role, permissions: null };
  }

  async getRoleById(roleId: number, includePermissions = false) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw RSE('Roles does not exist!', 'ROLE_NOEXIST', 404);
    if (includePermissions) {
      const permissions = await this._getPermissionsByRoleId(role.id);
      return { role, permissions };
    }
    return { role, permissions: null };
  }

  async getRolesByPermission(action: string, subject: string): Promise<Role[]> {
    const rolesWithPermission = await this.prisma.permission.findMany({
      where: {
        action,
        subject,
      },
      select: {
        roleId: true,
      },
    });

    const roleIds = rolesWithPermission.map((permission) => permission.roleId);

    const roles = await this.prisma.role.findMany({
      where: {
        id: {
          in: roleIds,
        },
      },
    });

    return roles;
  }

  async listPermissionsByRole(name: string) {
    const { role } = await this.getRoleByName(name);
    return this.prisma.permission.findMany({
      where: {
        roleId: role.id,
      },
    });
  }

  async _getPermissionsByRoleId(
    roleId: number,
    prisma: PrismaClientType = this.prisma,
  ) {
    const permissions = await prisma.permission.findMany({
      where: {
        roleId,
      },
    });

    return convertToPermissionSet(permissions);
  }

  _addPermissionsToRole(
    roleId: number,
    permissions: PermissionSet,
    prisma: PrismaClientType = this.prisma,
  ) {
    const permissionsData: Prisma.PermissionCreateManyInput[] = [];
    for (const subject in permissions) {
      for (const action of permissions[subject]) {
        permissionsData.push({
          roleId,
          subject,
          action,
        });
      }
    }
    return prisma.permission.createMany({
      data: permissionsData,
    });
  }

  _addPermissionToRole(
    permission: Pick<Permission, 'roleId' | 'action' | 'subject'>,
    prisma: PrismaClientType = this.prisma,
  ) {
    return prisma.permission.create({
      data: permission,
    });
  }
}
