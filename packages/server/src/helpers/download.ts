import fs from "fs";
import axios from "axios";

export async function downloadFile(
  url: string,
  filename: string
): Promise<void> {
  // const result = Url.parse(url);
  const writer = fs.createWriteStream(filename);
  const response = await axios({ url, method: "GET", responseType: "stream" });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
