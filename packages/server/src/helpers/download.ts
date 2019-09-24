const Fs = require('fs');
const Path = require('path');
const Axios = require('axios');
const Request = require('request');
import Url = require('url');

export async function  downloadFile(url: string, filename: string): Promise<void> {
    // const result = Url.parse(url);
    const writer = Fs.createWriteStream(filename);
    const response = await Axios({ url, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }