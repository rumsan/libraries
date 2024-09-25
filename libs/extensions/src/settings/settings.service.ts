import { Injectable, Logger } from '@nestjs/common';
import { Prisma, PrismaClient, Setting, SettingDataType } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { PaginatorTypes, PrismaService } from '@rumsan/prisma';
import { paginator } from '@rumsan/prisma/pagination/paginator';
import { PROTECTED_SETTINGS } from '../constants';
import { CreateSettingDto, ListSettingDto, UpdateSettngsDto } from '../dtos';

const paginate: PaginatorTypes.PaginateFunction = paginator({ perPage: 20 });

function capitalizeObjectKeys(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    // Return the value if it's not an object
    return obj;
  }

  if (Array.isArray(obj)) {
    // Process each element in the array
    return obj.map(capitalizeObjectKeys);
  }

  // Process each key-value pair in the object
  const upperCaseObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      upperCaseObj[key.toUpperCase()] = capitalizeObjectKeys(obj[key]);
    }
  }
  return upperCaseObj;
}

function getDataType(
  value: string | number | boolean | object,
): SettingDataType {
  if (typeof value === 'string') {
    return SettingDataType.STRING;
  } else if (typeof value === 'number') {
    return SettingDataType.NUMBER;
  } else if (typeof value === 'boolean') {
    return SettingDataType.BOOLEAN;
  } else if (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  ) {
    return SettingDataType.OBJECT;
  }
  throw new Error(`Invalid data type for 'value': ${typeof value}`);
}

type PrismaClientType = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$on' | '$connect' | '$disconnect' | '$use' | '$transaction' | '$extends'
>;

@Injectable()
export class SettingsService {
  private static data: any = {};
  constructor(private prisma: PrismaService) {}

  public static get(path: string) {
    const keys = path.split('.');
    let value = SettingsService.data;

    for (let key of keys) {
      key = key.toUpperCase();
      if (!value[key]) {
        throw new Error(`Setting '${key}' not found.`);
      }
      value = value[key];
    }

    return value;
  }

  async getPublic(name: string) {
    // Ensure that the name is stored in uppercase
    const uppercaseName = name.toUpperCase();
    const publicSetting = await this.prisma.setting.findUnique({
      where: { name: uppercaseName, isPrivate: false },
    });
    if (!publicSetting) {
      throw new Error(`Public setting '${uppercaseName}' not found`); // You can customize the error message
    }
    return publicSetting;
  }

  async list(query: ListSettingDto) {
    const AND_CONDITIONS = [];
    let conditions = {};

    if (query.name) {
      AND_CONDITIONS.push({
        name: { contains: query.name, mode: 'insensitive' },
      });
      conditions = { AND: AND_CONDITIONS };
    }

    if (query.private !== undefined) {
      AND_CONDITIONS.push({
        isPrivate: query.private,
      });
      conditions = { AND: AND_CONDITIONS };
    }

    if (query.readOnly !== undefined) {
      AND_CONDITIONS.push({
        isReadOnly: query.readOnly,
      });
      conditions = { AND: AND_CONDITIONS };
    }

    const select: Prisma.SettingSelect = {
      name: true,
      dataType: true,
      isPrivate: true,
      isReadOnly: true,
      requiredFields: true,
      value: true,
    };

    const rData = await paginate(
      this.prisma.setting,
      {
        where: { ...conditions },
        select,
      },
      {
        page: query.page,
        perPage: query.perPage,
      },
    );

    rData.data = rData.data?.map((item: any) => ({
      ...item,
      value: item.isPrivate ? PROTECTED_SETTINGS : item.value,
      requiredFields: item.isPrivate
        ? [PROTECTED_SETTINGS]
        : item.requiredFields,
    }));

    return rData;
  }

  async load() {
    const publicSettings = await this.prisma.setting.findMany();
    const result: any = {};
    for (const setting of publicSettings) {
      result[setting.name] = setting.value;
    }
    Logger.log('Settings Loaded from Database', SettingsService.name);
    SettingsService.data = result;
  }

  async update(name: string, dto: UpdateSettngsDto) {
    const { value, requiredFields } = dto;
    const settingsName = await this.prisma.setting.findUnique({
      where: {
        name,
      },
    });
    if (!settingsName) throw new Error('Setting not found');

    // Check if the setting is read-only
    if (settingsName.isReadOnly) {
      throw new Error(`Setting '${name}' is read-only and cannot be updated`);
    }

    if (!value || typeof value !== 'object' || !Array.isArray(requiredFields)) {
      throw new Error('Invalid data structure');
    }

    const matchKeysWithRequiredFields = Object.keys(value).every((key) =>
      requiredFields.includes(key),
    );

    const matchRequiredFieldsWithKey = requiredFields.every((field) =>
      Object.keys(value).includes(field),
    );
    if (!matchKeysWithRequiredFields || !matchRequiredFieldsWithKey)
      throw new Error('Key did not match with the Required Fields');
    const updatedData = await this.prisma.setting.update({
      where: {
        name,
      },
      data: {
        value: dto.value,
        requiredFields: dto.requiredFields,
        isPrivate: dto.isPrivate,
        isReadOnly: dto.isReadOnly,
        sessionId: dto.sessionId,
        updatedBy: dto.updatedBy,
      },
    });
    this.load();

    return updatedData;
  }

  private listValidSettingsName() {
    return Object.keys(SettingsService.data).join(', ');
  }

  //   Ensures that the name is stored in uppercase.
  //   Converts the items in requiredFields to uppercase if they exist.
  //   Checks if value is an object and not an array or null.
  //   Validates that the value object has all the properties specified in requiredFields in a case-insensitive manner.
  //   Capitalizes keys of the value object without changing the values.
  //   If value is not an o,bject, it sets requiredFields to an empty array [].

  //DO NOT EXPOSE THIS USING CONTROLLER
  async create(
    createSettingDto: CreateSettingDto,
    prisma: PrismaClientType = this.prisma,
  ) {
    let {
      name,
      value: dtoValue,
      requiredFields,
      isReadOnly,
      isPrivate,
      sessionId,
      createdBy,
    } = createSettingDto;
    let value: any = dtoValue;

    // Ensure that the name is stored in uppercase
    name = name.toUpperCase();
    const requiredFieldsArray: string[] = requiredFields
      ? requiredFields.map((field) => field.toUpperCase())
      : [];

    const dataType = getDataType(value);

    // Check if 'value' is an object and not an array or null
    if (dataType === SettingDataType.OBJECT) {
      // Use type assertion here to tell TypeScript that value is an object
      const rawValueObject = value as Record<string, any>;
      // Capitalize keys of the 'value' object without changing the values
      value = capitalizeObjectKeys(rawValueObject);

      // Check if 'value' object has all the properties specified in 'requiredFields' (case-insensitive)
      if (requiredFieldsArray && requiredFieldsArray.length > 0) {
        value = Object.keys(value)
          .filter((key) => requiredFieldsArray.includes(key))
          .reduce((obj: any, key) => {
            obj[key] = value[key];
            return obj;
          }, {});

        const missingFields = requiredFieldsArray.filter((field) => {
          const matchingKey = Object.keys(value).find(
            (key) => key.toUpperCase() === field,
          );
          return !matchingKey;
        });

        if (missingFields.length > 0) {
          throw new Error(
            `Required fields missing in 'value' object: ${missingFields.join(
              ', ',
            )}`,
          ); // 400 Bad Request
        }
      }
    } else {
      // If 'value' is not an object, set 'requiredFields' to an empty array []
      requiredFields = [];
    }

    const existingSetting = await prisma.setting.findUnique({
      where: { name },
    });

    if (existingSetting) {
      throw new Error('Setting with this name already exists'); // 400 Bad Request
    }
    const newSetting = await prisma.setting.create({
      data: {
        name,
        value,
        dataType,
        requiredFields: requiredFieldsArray,
        isReadOnly,
        isPrivate,
        sessionId,
        createdBy,
      },
    });

    this.load();
    return newSetting;
  }

  //DO NOT EXPOSE THIS USING CONTROLLER
  async bulkCreate(createSettingDtos: CreateSettingDto[]) {
    const createdSettings: Setting[] = [];
    await this.prisma.$transaction(async (prisma) => {
      for (const createSettingDto of createSettingDtos) {
        const newSetting = await this.create(createSettingDto, prisma);
        createdSettings.push(newSetting);
      }
    });
    return createdSettings;
  }

  //DO NOT EXPOSE THIS USING CONTROLLER
  async delete(name: string) {
    // Ensure that the name is stored in uppercase
    const uppercaseName = name.toUpperCase();

    // Check if the setting exists in the database
    const existingSetting = await this.prisma.setting.findUnique({
      where: { name: uppercaseName },
    });

    if (!existingSetting) {
      throw new Error(
        `Setting '${uppercaseName}' not found. Valid settings: ${this.listValidSettingsName()}`,
      );
    }

    // Delete the setting
    await this.prisma.setting.delete({ where: { name: uppercaseName } });

    return this.listAll();
  }

  //DO NOT EXPOSE THIS USING CONTROLLER
  async listAll() {
    return this.prisma.setting.findMany();
  }

  async getByName(name: string) {
    const uppercaseName = name.toUpperCase();

    const rData = await this.prisma.setting.findUnique({
      where: { name: uppercaseName },
      select: {
        name: true,
        dataType: true,
        isPrivate: true,
        isReadOnly: true,
        requiredFields: true,
        value: true,
      },
    });

    if (rData?.isPrivate) {
      rData.value = PROTECTED_SETTINGS;
      rData.requiredFields = [PROTECTED_SETTINGS];
    }

    return rData;
  }
}
