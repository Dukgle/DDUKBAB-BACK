// // 파일 속 이미지 이름명에 따라 db menu_name명에 맞게 저장
// const express = require('express');
// const multer = require('multer');
// const router = express.Router();
// const fs = require('fs');
// const path = require('path');
// const db = require('./config/dbConfig');

// // uploads 디렉토리 내의 파일 목록을 읽어옴
// const uploadDir = './uploads'; // 이미지 파일이 저장된 디렉토리 경로
// fs.readdir(uploadDir, (err, files) => {
//   if (err) {
//     console.error('디렉토리 읽기 오류:', err);
//     return;
//   }

//   // 파일 목록을 반복하면서 각 파일의 메뉴 이름을 추출하여 데이터베이스에 저장
//   files.forEach((filename) => {
//     const extname = path.extname(filename); // 확장자
//     const menuName = path.basename(filename, extname); // 파일명에서 확장자 제외한 부분

//     // 이미지 파일 확장자가 지원되는 확장자인지 확인
//     const validExtensions = ['.jpg', '.jpeg', '.png'];
//     if (validExtensions.includes(extname)) {
//       const imagePath = `/uploads/${filename}`;
      
//       // 데이터베이스에 이미지 경로 저장
//       const query = 'UPDATE menu SET image_path = ? WHERE menu_name = ?';
//       db.query(query, [imagePath, menuName], (dbErr, result) => {
//         if (dbErr) {
//           console.error('이미지 경로 저장 오류:', dbErr);
//         } else {
//           console.log(`메뉴 이름: ${menuName}, 이미지 경로 저장 성공`);
//         }
//       });
//     } else {
//       console.log(`메뉴 이름: ${menuName}, 지원되지 않는 이미지 형식`);
//     }
//   });
// });


// module.exports = router;
