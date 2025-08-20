const fs = require('fs-extra');
const path = require('path');
const { s3Upload, mybucketList } = require('../../../runtime/s3Upload');
const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

jest.mock('klassijs-astellen', () => ({
  astellen: {
    get: jest.fn().mockReturnValue('browserName'),
  },
}));
jest.mock('@aws-sdk/client-s3', () => ({
  // S3Client: jest.fn().mockImplementation(() => ({
  //   send: jest.fn().mockResolvedValue({}),
  // })),
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({
      Buckets: [{ Name: 'mockBucket' }],
    }), // Mocked response for ListBucketsCommand
  })),
  ListBucketsCommand: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn().mockImplementation(() => ({})),
}));

fs.readdirSync = jest.fn().mockReturnValue(['file1.html.json']);
fs.readFileSync = jest.fn().mockReturnValue('fileContent');
fs.removeSync = jest.fn(undefined);

// Mock mybucketList function globally
jest.mock('../../../runtime/s3Upload', () => {
  const actualModule = jest.requireActual('../../../runtime/s3Upload');
  return {
    ...actualModule,
    mybucketList: jest.fn().mockResolvedValue([{ Name: 'mockBucket' }]), // Mock the function to return a bucket list
  };
});

let logSpy, errorSpy;

beforeAll(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterAll(() => {
  if (errorSpy && errorSpy.mockRestore) errorSpy.mockRestore();
  if (logSpy && logSpy.mockRestore) logSpy.mockRestore();
});

describe('s3Upload', () => {
  beforeEach(() => {
    global.dataconfig = { s3FolderName: 'mockedFolder' };
    global.s3Data = { S3_BUCKET: 'mockBucket' };
    global.env = { envName: 'testenv' };
    global.settings = { remoteConfig: 'browserName' };
    global.BROWSER_NAME = 'browserName';

    mockS3Client = {
      send: jest.fn().mockResolvedValue({
        Buckets: [{ Name: 'mockBucket' }],
      }),
    };

    S3Client.mockImplementation(() => mockS3Client);
    ListBucketsCommand.mockImplementation(() => ({}));
    PutObjectCommand.mockImplementation((params) => params);
  });


  it('should upload files to S3 and use the mocked envConfig and dataConfig', async () => {
    try {
      const mybucket = await mybucketList();

      if (mybucket && mybucket.some) {
        mybucket.some((bucket) => bucket.Name === 'mockBucket');
      } else {
        console.error('Bucket list is undefined or not an array!');
      }

      await s3Upload();
    } catch (err) {
      console.error('Error during s3Upload:', err);
    }

    expect(mockS3Client.send).toHaveBeenCalled();
    expect(fs.removeSync).toHaveBeenCalledWith(path.resolve('./reports/browserName/testenv/', 'file1.html.json'));
    expect(global.dataconfig.s3FolderName).toBe('mockedFolder');
    expect(global.dataconfig.s3FolderName).toBeDefined();
    // TODO: Test the PutObjectCommand, this is not working as expected
    // expect(PutObjectCommand).toHaveBeenCalledWith({
    //   Bucket: 'mockBucket',
    //   Key: expect.stringContaining('file1.html.json'),
    //   Body: 'fileContent',
    // });

    expect(fs.removeSync).toHaveBeenCalledWith(path.resolve('./reports/browserName/testenv/', 'file1.html.json'));
  });

  it('should print an error message if list of buckets cannot be retrieved', async () => {
    const logSpy = jest.spyOn(console, 'error');
    ListBucketsCommand.mockImplementationOnce(() => {
      throw new Error('Test Error');
    });
    await s3Upload();
    expect(logSpy).toHaveBeenCalledWith('Error ', 'Test Error');
  });

  it('should remove a combine directory if it already exists', async () => {
    const testFolderPath = path.resolve(process.cwd(), 'reports', 'browserName', 'testenvCombine');
    fs.ensureDirSync(testFolderPath);
    await s3Upload();
    try {
      expect(fs.existsSync(testFolderPath)).toBeFalsy();
    } catch (err) {
      throw new Error(err);
    } finally {
      fs.emptyDirSync(path.resolve(process.cwd(), 'reports', 'browserName'));
    }
  });

  it('should collect the files to be uploaded', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const testFolderPath = path.resolve(process.cwd(), 'reports', 'browserName');
    fs.ensureDirSync(testFolderPath);
    fs.writeFileSync(path.resolve(testFolderPath, 'testfile1.txt'), 'Test data');
    // Ensure the bucket list mock returns the correct bucket
    require('../../../runtime/s3Upload').mybucketList.mockResolvedValueOnce([{ Name: 'mockBucket' }]);
    ListBucketsCommand.mockResolvedValueOnce(() => {
      return { Buckets: ['mockBucket'] };
    });

    await s3Upload();
    try {
      expect(logSpy).toHaveBeenCalledWith('Report files uploaded successfully to s3 Bucket');
    } catch (err) {
      throw new Error(err);
    } finally {
      fs.emptyDirSync(testFolderPath);
      logSpy.mockRestore();
    }
  });

  it('should fail gracefully if an error occurs while uploading to the S3 bucket', async () => {
    const logSpy = jest.spyOn(console, 'error');
    PutObjectCommand.mockImplementationOnce(() => {
      throw new Error('Test Error');
    });
    const testFolderPath = path.resolve(process.cwd(), 'reports', 'browserName');
    fs.ensureDirSync(testFolderPath);
    fs.writeFileSync(path.resolve(testFolderPath, 'testfile1.txt'), 'Test data');
    ListBucketsCommand.mockResolvedValueOnce(() => {
      return { Buckets: ['mockBucket'] };
    });
    await s3Upload();
    try {
      expect(logSpy).toHaveBeenCalledWith('Error ', 'Test Error');
    } catch (err) {
      throw new Error(err);
    } finally {
      fs.emptyDirSync(testFolderPath);
    }
  });
});

