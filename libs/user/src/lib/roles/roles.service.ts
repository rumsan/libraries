import { Injectable } from '@nestjs/common';
import { Permission } from '@prisma/client';
import { StringUtils } from '@rumsan/core';
import { PrismaService } from '@rumsan/prisma';
import {
  checkPermissionSet,
  convertToPermissionSet,
} from '../../utils/permission.utils';
import { ERRORS_RSUSER } from '../constants';
import { RSE } from '../constants/errors';
import { PermissionSet } from '../interfaces';
import { CreateRoleDto, EditRoleDto } from './dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    if (!StringUtils.isValidString(dto.name))
      throw ERRORS_RSUSER.ROLE_NAME_INVALID;
    const { permissions, ...data } = dto;
    const { isValid, validSubjects } = checkPermissionSet(permissions);
    if (!isValid)
      throw RSE(
        `Invalid permission set. Valid subjects are {{validSubjects}}.`,
        'PERMISSION_SET_INVALID',
        400,
        { validSubjects: validSubjects.join(', ') },
      );

    const role = await this.prisma.role.create({ data });
    await this.addPermissionsToRole(role.id, permissions);

    return role;
  }

  addPermissionsToRole(roleId: number, permissions: PermissionSet) {
    const data = [];
    for (const subject in permissions) {
      for (const action of permissions[subject]) {
        data.push({ roleId: roleId, subject, action });
      }
    }
    return this.prisma.permission.createMany({
      data,
    });
  }

  addPermissionToRole(
    permission: Pick<Permission, 'roleId' | 'action' | 'subject'>,
  ) {
    return this.prisma.permission.create({
      data: permission,
    });
  }

  async update(roleId: number, dto: EditRoleDto) {
    return this.prisma.role.update({
      where: {
        id: roleId,
      },
      data: dto,
    });
  }

  list() {
    return this.prisma.role.findMany();
  }

  async getById(roleId: number) {
    return this.prisma.role.findUnique({ where: { id: +roleId } });
  }

  async getRoleByName(name: string, includePermissions = false) {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) throw RSE('Roles does not exist!', 'ROLE_NOEXIST', 404);
    if (includePermissions) {
      const permissions = await this.prisma.permission.findMany({
        where: {
          roleId: role?.id,
        },
      });

      return { role, permissions: convertToPermissionSet(permissions) };
    }
    return { role, permissions: null };
  }

  async delete(name: string) {
    const { role } = await this.getRoleByName(name);
    if (role.isSystem)
      throw RSE('System roles cannot be deleted.', 'ROLE_SYS_NODELETE', 401);
    await this.prisma.permission.deleteMany({
      where: {
        roleId: role.id,
      },
    });
    return this.prisma.role.delete({ where: { id: role.id, isSystem: false } });
  }

  listPermissions() {
    return this.prisma.permission.findMany();
  }

  async listPermissionsByRole(name: string) {
    const { role } = await this.getRoleByName(name);
    return this.prisma.permission.findMany({
      where: {
        roleId: role.id,
      },
    });
  }
}
