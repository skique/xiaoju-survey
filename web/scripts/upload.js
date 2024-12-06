import * as path from 'path';
import {globby} from 'globby';


import { Client } from 'minio';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import mime from 'mime';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadFile = async ({
  file,
  filepath
}) =>{
  const config ={
    ACCESS_KEY: 'AKDD000000000011BXDJURJBBCNHUJ', // your_access_key
    SECRET_KEY: 'ASDDLtlXpdVhsIkapFEevIjtGNDshnAxpNFtjHCJ', // your_secret_key
    BUCKET: 'xiaojuwenjuan', // your_bucket
    REGION: 'hangzhou',
    ENDPOINT: 's3-gzpu.didistatic.com', // endpoint
    USE_SSL: true, // useSSL
  }
  const client = new Client({
    endPoint: config.ENDPOINT,
    accessKey: config.ACCESS_KEY,
    secretKey: config.SECRET_KEY,
    region:config.REGION,
    useSSL: config.USE_SSL,
    pathStyle: true,
  });
  const key =  'surveyUpload/dist/' + filepath
  const metaData = {
    'Content-Type': mime.getType(filepath),
  }
  await client.putObject(config.BUCKET, key, file, metaData);
}

const upload = async () => {
  const filesPath = path.join(__dirname, '../dist/')
  const files = await globby(filesPath, {
    ignore: ['**/*.html'],
  })
  const tasks = files.map(file => {
    return () =>
      uploadFile({
        file: fs.createReadStream(file),
        filepath: file.replace(filesPath, ''),
      })
  })

  await Promise.all(tasks.map(task => task()))

  console.log('静态资源上传成功：', JSON.stringify(files, null, 2))
}

upload()
