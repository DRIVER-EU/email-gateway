// Upload file to Large File Service


const WebRequest = require('request-promise');
const FileSystem = require('fs');
const util = require('util');

export async function  uploadFileToLargeFileService(largeFileServiceUrl: string, fileName: string, isPrivate: boolean = false) {
    const options = {
        method: 'POST',
        url: largeFileServiceUrl,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        formData: {
          'uploadFile': FileSystem.createReadStream(fileName),
          // 'type'; 'image/jpeg'
          'private': isPrivate ?  'true' : 'false'
        },
        resolveWithFullResponse: true
      };
      //let requestPromise = util.promisify(Request);
      //let response = await requestPromise(Request(options));
      return await WebRequest(options);
  }