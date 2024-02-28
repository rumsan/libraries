import { SettingsService } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;
    let prismaMock: any;

    beforeEach(() => {
        prismaMock = {
            setting: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
            },
        };
        service = new SettingsService(prismaMock);
    });

    it('should return public settings', async () => {
        const mockSettings = [
            { name: 'SMTP', value: { "HOST": "smtp.gmail.com", "PORT": 465, "SECURE": true, "PASSWORD": "test", "USERNAME": "test" }, isPrivate: false },
            { name: 'SMTP1', value: { "HOST": "smtp.gmail.com", "PORT": 465, "SECURE": true, "PASSWORD": "test", "USERNAME": "test" }, isPrivate: false },
        ];

        prismaMock.setting.findMany.mockResolvedValue(mockSettings);

        const result = await service.listPublic();
        console.log(result)

        expect(result).toEqual({
            SMTP: { "HOST": "smtp.gmail.com", "PORT": 465, "SECURE": true, "PASSWORD": "test", "USERNAME": "test" },
            SMTP1: { "HOST": "smtp.gmail.com", "PORT": 465, "SECURE": true, "PASSWORD": "test", "USERNAME": "test" },
        });
        expect(prismaMock.setting.findMany).toHaveBeenCalledWith({
            where: { isPrivate: false },
        });
    });


    it('should return a public setting by name', async () => {
        const mockSetting = { name: 'SMTP', value: { "HOST": "smtp.gmail.com", "PORT": 465, "SECURE": true, "PASSWORD": "test", "USERNAME": "test" }, isPrivate: false };

        prismaMock.setting.findUnique.mockResolvedValue(mockSetting);

        const result = await service.getPublic('SMTP');

        expect(result).toEqual(mockSetting);
        expect(prismaMock.setting.findUnique).toHaveBeenCalledWith({
            where: { name: 'SMTP', isPrivate: false },
        });
    });

    it('should throw an error if a public setting is not found', async () => {
        prismaMock.setting.findUnique.mockResolvedValue(null);



        await expect(service.getPublic('NONEXISTENT')).rejects.toThrow(
            "Public setting 'NONEXISTENT' not found"
        );
        expect(prismaMock.setting.findUnique).toHaveBeenCalledWith({
            where: { name: 'NONEXISTENT', isPrivate: false },
        });
    });
});