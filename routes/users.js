// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');

// 회원가입 API 엔드포인트
router.post('/register', (req, res) => {
  const { username, uni_num, nickname, password, role } = req.body;

  // 비밀번호 해싱
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('비밀번호 해싱 오류:', err);
      res.status(500).json({ error: '회원가입 실패' });
      return;
    }

    let tableName;
    if (role === "학생" || role === "교직원") {
        tableName = 'users';
    } else if (role == '판매자') {
        tableName = 'salers';
    }

    // 해싱된 비밀번호를 데이터베이스에 저장
    const query = `INSERT INTO ${tableName} (username, uni_num, nickname, password, role) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [username, uni_num, nickname, hash, role], (err, result) => {
      if (err) {
        console.error('회원가입 오류:', err);
        res.status(500).json({ error: '회원가입 실패' });
        return;
      }
      console.log('회원가입 성공');
      res.json({ message: '회원가입 성공' });
    });
  });
});

router.post('/login', (req, res) => {
  const { uni_num, password} = req.body;


  
  const tableName = /^[가-힣]+$/.test(uni_num.trim()) ? 'salers' : 'users';

  if (tableName === 'salers') id = 'saler_id';
  else id = 'user_id';

  // 사용자 정보 조회 (uni_num을 통해 저장된 해싱된 비밀번호와 role을 가져옴)
  const query = `SELECT ${id}, uni_num, password, role FROM ${tableName} WHERE uni_num = ?`;
  db.query(query, [uni_num], (err, rows) => {
    if (err) {
      console.error('로그인 오류:', err);
      res.status(500).json({ error: '로그인 실패' });
      return;
    }

    if (rows.length === 0) {
      res.status(401).json({ error: '사용자를 찾을 수 없음' });
      return;
    }

    const storedPassword = rows[0].password;
    const role = rows[0].role;

    // 비밀번호 검증
    bcrypt.compare(password, storedPassword, (err, result) => {
      if (err || !result) {
        res.status(401).json({ error: '비밀번호 불일치' });
        return;
      }

      let payload;
      if (tableName === 'users') {
        payload = {
          userId: rows[0].user_id, // 사용자 ID (user_id 또는 saler_id)
          uni_num,
          role,
        };;
      } else {
        payload = {
          salerId: rows[0].saler_id, // 사용자 ID (user_id 또는 saler_id)
          uni_num,
          role,
        };
      }
      
      // JWT 토큰 발급
      const secretKey = 'your-secret-key'
      const expiresIn = '5h';
      const token = jwt.sign(payload, secretKey, {expiresIn});
      console.log('로그인 성공');
      res.json({ message: '로그인 성공', token});
      
    });
  });
});


module.exports = router;