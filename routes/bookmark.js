const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');

function verifyToken(req, res, next) {
    const token = req.headers.authorization.split(' ')[1];
  //   console.log(token);
  
    if (!token) {
      return res.status(401).json({ error: '인증 토큰이 없습니다' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) {
          console.log(err);
        return res.status(401).json({ error: '인증 토큰이 유효하지 않습니다' });
  
      }
      req.userId = decoded.userId; // JWT에 저장된 사용자 ID를 request 객체에 저장
      req.role = decoded.role; // JWT에 저장된 사용자 역할을 request 객체에 저장
      next();
    });
  }

  router.get('/get', verifyToken, (req, res) => {
    const userId = req.userId;
  
    const query = `SELECT * FROM bookmarks WHERE user_id = ?`;
  
    db.query(query, [userId], (err, result) => {
      if (err) {
        console.error('즐겨찾기 조회 오류:', err);
        res.status(500).json({ error: '즐겨찾기 조회 실패' });
        return;
      }
      if (result.length === 0) {
        res.status(404).json({ error: '즐겨찾기 메뉴를 찾을 수 없습니다' });
        return;
      }
      const bookmarks = result; // 전체 값 가져오기
      res.json({ bookmarks });
    });
  });
  router.post('/create', verifyToken, (req, res) => {
    const userId = req.userId;
    const { menu_name } = req.body;
  
    const query = `INSERT INTO bookmarks (user_id, menu_name ) VALUES (?,?)`;
  
    db.query(query, [userId, menu_name], (err, result) => {
      if (err) {
        console.error('즐겨찾기 오류:', err);
        res.status(500).json({ error: '즐겨찾기 실패' });
        return;
      }
      console.log('즐겨찾기 성공');
      res.json({ message: '즐겨찾기 성공' });
    });
  });

  router.delete('/delete/:bookmarkId', verifyToken, (req, res) => {
    const userId = req.userId;
    const bookmarkId = req.params.bookmarkId;
  
    const query = `DELETE FROM bookmarks WHERE bookmark_id=? AND user_id=?`;
  
    db.query(query, [bookmarkId, userId], (err, result) => {
      if (err) {
        console.error('즐겨찾기 삭제 오류:', err);
        res.status(500).json({ error: '즐겨찾기 삭제 실패' });
        return;
      }
      if (result.affectedRows === 0) {
          res.status(404).json({ error: '즐겨찾기를 삭제할 수 없습니다' });
          return;
      }
      const successMsg ='즐겨찾기 삭제 성공';
      res.json({message:successMsg});
    });
  });

  module.exports = router;
