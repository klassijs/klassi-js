const path = require('path');
const fs = require('fs-extra');
const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

// Mock the dependencies
jest.mock('@aws-sdk/client-s3');
jest.mock('fs-extra');
jest.mock('recursive-readdir');
jest.mock('klassijs-astellen');

// Mock the helpers module
jest.mock('../../../runtime/helpers', () => ({
  s3BucketCurrentDate: jest.fn().mockReturnValue('2024-01-01'),
}));

// Mock the async module
jest.mock('async', () => ({
  eachOfLimit: jest.fn().mockImplementation((files, limit, callback) => {
    return Promise.resolve();
  }),
}));

// Mock the recursive-readdir module
jest.mock('recursive-readdir', () => 
  jest.fn().mockResolvedValue([
    './reports/browserName/testenv/file1.html.json',
    './reports/browserName/testenv/file2.html.json',
  ])
);

// Mock the global variables and environment
global.env = { envName: 'testenv' };
global.BROWSER_NAME = 'browserName';
global.dataconfig = { s3FolderName: 'mockedFolder' };
global.s3Data = { S3_BUCKET: 'mockBucket', S3_REGION: 'us-east-1' };
process.env.S3_KEY = 'mockKey';
process.env.S3_SECRET = 'mockSecret';

describe('s3Upload', () => {
  let mockS3Client;
  let mockSend;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock S3Client
    mockSend = jest.fn();
    mockS3Client = {
      send: mockSend,
    };
    S3Client.mockImplementation(() => mockS3Client);
    
    // Mock ListBucketsCommand
    ListBucketsCommand.mockImplementation((params) => params);
    
    // Mock PutObjectCommand
    PutObjectCommand.mockImplementation((params) => params);
    
    // Mock fs methods
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue(['file1.html.json']);
    fs.removeSync.mockImplementation(() => {});
    fs.ensureDirSync.mockImplementation(() => {});
    fs.emptyDirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});
    fs.readFileSync.mockReturnValue('fileContent');
  });

  it('should upload files to S3 and use the mocked envConfig and dataConfig', async () => {
    // Mock successful bucket list response
    mockSend.mockResolvedValueOnce({
      Buckets: [{ Name: 'mockBucket' }]
    });
    
    // Mock successful upload
    mockSend.mockResolvedValueOnce({});

    const { s3Upload } = require('../../../runtime/s3Upload');
    await s3Upload();

    expect(mockS3Client.send).toHaveBeenCalled();
    expect(fs.removeSync).toHaveBeenCalledWith(path.resolve('./reports/browserName/testenv/', 'file1.html.json'));
    expect(global.dataconfig.s3FolderName).toBe('mockedFolder');
    expect(global.dataconfig.s3FolderName).toBeDefined();
  });

  it('should print an error message if list of buckets cannot be retrieved', async () => {
    const logSpy = jest.spyOn(console, 'log');
    
    // Mock failed bucket list
    mockSend.mockRejectedValueOnce(new Error('Test Error'));

    const { s3Upload } = require('../../../runtime/s3Upload');
    await s3Upload();
    
    expect(logSpy).toHaveBeenCalledWith('The s3 bucket list could not be retrieved');
    logSpy.mockRestore();
  });

  it('should remove a combine directory if it already exists', async () => {
    const testFolderPath = path.resolve(process.cwd(), 'reports', 'browserName', 'testenvCombine');
    
    // Mock successful bucket list response
    mockSend.mockResolvedValueOnce({
      Buckets: [{ Name: 'mockBucket' }]
    });
    
    // Mock successful upload
    mockSend.mockResolvedValueOnce({});
    
    // Mock fs.rmSync to simulate directory removal
    fs.rmSync.mockImplementation(() => {});
    
    fs.ensureDirSync(testFolderPath);
    
    const { s3Upload } = require('../../../runtime/s3Upload');
    await s3Upload();
    
    // Verify that fs.rmSync was called (which removes the combine directory)
    expect(fs.rmSync).toHaveBeenCalled();
    
    try {
      fs.emptyDirSync(path.resolve(process.cwd(), 'reports', 'browserName'));
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  it('should collect the files to be uploaded', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const testFolderPath = path.resolve(process.cwd(), 'reports', 'browserName');
    
    // Mock successful bucket list response
    mockSend.mockResolvedValueOnce({
      Buckets: [{ Name: 'mockBucket' }]
    });
    
    // Mock successful upload
    mockSend.mockResolvedValueOnce({});
    
    fs.ensureDirSync(testFolderPath);
    fs.writeFileSync(path.resolve(testFolderPath, 'testfile1.txt'), 'Test data');

    const { s3Upload } = require('../../../runtime/s3Upload');
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
    const testFolderPath = path.resolve(process.cwd(), 'reports', 'browserName');
    
    // Mock successful bucket list response first
    mockSend.mockResolvedValueOnce({
      Buckets: [{ Name: 'mockBucket' }]
    });
    
    // Mock successful bucket list for the second call (in deploy)
    mockSend.mockResolvedValueOnce({
      Buckets: [{ Name: 'mockBucket' }]
    });
    
    // Mock failed upload - this will trigger the error in the deploy function
    mockSend.mockRejectedValueOnce(new Error('Test Error'));
    
    fs.ensureDirSync(testFolderPath);
    fs.writeFileSync(path.resolve(testFolderPath, 'testfile1.txt'), 'Test data');
    
    const { s3Upload } = require('../../../runtime/s3Upload');
    
    // The function should complete without throwing an error
    await expect(s3Upload()).resolves.not.toThrow();
    
    try {
      fs.emptyDirSync(testFolderPath);
    } catch (err) {
      // Ignore cleanup errors
    }
  });
});

