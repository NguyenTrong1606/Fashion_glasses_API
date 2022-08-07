//const { refreshToken } = require('firebase-admin/app');
const { google } = require('googleapis');
const fs = require('fs');
//const path = require('path')
const { Duplex } = require('stream');
//require('dotenv').config();


// const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = process.env.CLIENT_SECRET;
// const REDIRECT_URI = process.env.REDIRECT_URI;
// const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
// const FOLDERIMG = process.env.FOLDERIMG;

// const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
// oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// const drive = google.drive({
//     version: 'v3',
//     auth: oauth2Client
// })

// function bufferToStream(buffer) {
//     const duplexStream = new Duplex();
//     duplexStream.push(buffer);
//     duplexStream.push(null);
//     return duplexStream;
// }


// const MyDrive = {};

// MyDrive.setFilePublic = async (fileId) => {
//     try {
//         await drive.permissions.create({
//             fileId: fileId,
//             requestBody: {
//                 role: 'reader',
//                 type: 'anyone'
//             }
//         })
//         return true;
//     } catch (error) {
//         console.log(error);
//         return false;
//     }
// }




// MyDrive.uploadIMG = async (file, filename) => {
//     try {
//         const createFile = await drive.files.create({
//             requestBody: {
//                 name: `${filename}.jpg`,
//                 mimeType: 'image/jpg',
//                 parents: [FOLDERIMG]
//             },
//             media: {
//                 mimeType: 'image/jpg',
//                 body: bufferToStream(file.data)
//             }
//         })
//         switch (createFile.status) {
//             case 200:
//                 {
//                     await that.setFilePublic(createFile.data.id);
//                     return createFile.data.id;
//                 }
//             default: console.error("err", response.error); break;
//         }
//     } catch (error) {
//         console.log(error);
//         return false;
//     }
// }

// MyDrive.deleteIMG = async (fileId) => {
//     try {
//         const deleteFile = await drive.files.delete({
//             fileId: fileId
//         })
//         //console.log(deleteFile.data, deleteFile.status);
//         return true;
//     } catch (error) {
//         console.log(error);
//         return false;
//     }
// }

// MyDrive.getImageId = (path) => {
//     let pos = path.lastIndexOf('=');
//     return path.substr(pos + 1);
// }

const MyDrive = {}

const KEYFILEPATH = "fashion_glasses_keydrive.json";
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const FOLDER = '1W48shX2crsHTjua60-s5kxdOvzCqovfw';

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES
})

function bufferToStream(buffer) {
  const duplexStream = new Duplex();
  duplexStream.push(buffer);
  duplexStream.push(null);
  return duplexStream;
}


MyDrive.uploadImage = async (file, filename) => {
  const driveService = google.drive({ version: 'v3', auth });

  let fileMetaData = {
    'name': filename + '.png',
    'parents': [FOLDER]
  }

  let media = {
    mimeType: 'image/jpeg',
    body: bufferToStream(file.data)
  }

  let response = await driveService.files.create({
    resource: fileMetaData,
    media: media,
    fields: 'id'
  })

  switch (response.status) {
    case 200:
      let file = response.result;
      console.log("ok", response.data.id);
      return response.data.id;
    default: console.error("err", response.error); break;
  }

  return false;
}

function listFiles(auth) {
  const drive = google.drive({ version: 'v3', auth });
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
        deleteFiles(auth, file.id);

      });
    } else {
      console.log('No files found.');
    }
  });
}

MyDrive.deleteFiles = (idFile) => {
  const drive = google.drive({ version: 'v3', auth });
  console.log("delete id: "+idFile);
  drive.files.delete({
    'fileId': idFile
  }, (err, res) => {
    if (err) {
      console.log(err);
      return false;
    }
    else {
      // File k tồn tại thì vẫn ok
      console.log("delete ok");
      return true;
    }
  })
}

MyDrive.getImageId = (path) => {
  let pos = path.lastIndexOf('=');
  return path.substr(pos + 1);
}

module.exports = MyDrive;