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

  router.get('/order-num', verifyToken, (req, res) => {
    const userId = req.userId;
    const createdAt = new Date().toISOString().split('T')[0];
  
    const query = `SELECT id FROM orders WHERE user_id = ? and DATE_FORMAT(created_at, '%Y-%m-%d' ) = ?`;
  
    db.query(query, [userId, createdAt], (err, result) => {
      if (err) {
        console.error('번호표 조회 오류:', err);
        res.status(500).json({ error: '번호표 조회 실패' });
        return;
      }
      if (result.length === 0) {
        res.status(404).json({ error: '번호표를 찾을 수 없습니다' });
        return;
      }
      const wait_num = result[result.length - 1];
      res.json({ wait_num });
    });
  });
  


  module.exports = router;
