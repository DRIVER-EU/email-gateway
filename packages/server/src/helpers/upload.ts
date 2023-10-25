// Upload file to Large File Service

import { createReadStream } from "node:fs";
import WebRequest from "request-promise";

export async function uploadFileToLargeFileService(
  largeFileServiceUrl: string,
  fileName: string,
  isPrivate: boolean = false
) {
  const options = {
    method: "POST",
    url: largeFileServiceUrl,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    formData: {
      uploadFile: createReadStream(fileName),
      // 'type'; 'image/jpeg'
      private: isPrivate ? "true" : "false",
    },
    resolveWithFullResponse: true,
  };
  //let requestPromise = util.promisify(Request);
  //let response = await requestPromise(Request(options));
  return await WebRequest(options);
}
