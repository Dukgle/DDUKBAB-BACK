// 미들웨어: JWT 검증 및 사용자 인증
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');

// 미들웨어: JWT 검증 및 사용자 인증
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

// 게시글 조회 엔드포인트 수정: 유저 ID와 함께
router.get('/posting/:postId', verifyToken, (req, res) => {
  const userId = req.userId;
  const postId = req.params.postId;

  const query = `SELECT * FROM posts WHERE post_id = ? AND user_id = ?`;

  db.query(query, [postId, userId], (err, result) => {
    if (err) {
      console.error('게시글 조회 오류:', err);
      res.status(500).json({ error: '게시글 조회 실패' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
      return;
    }
    const post = result[0];
    res.json({ post });
  });
});


// 나머지 엔드포인트도 유저 ID를 검증하여 사용자만 해당 작업을 수행하도록 수정

// 게시글 작성 엔드포인트
router.post('/create', verifyToken, (req, res) => {
  const userId = req.userId;
  const { sort, menu, star, title, content } = req.body;

  const query = `INSERT INTO posts (user_id, sort, menu, star, title, content) VALUES (?,?,?,?,?,?)`;

  db.query(query, [userId, sort, menu, star, title, content], (err, result) => {
    if (err) {
      console.error('게시글 작성 오류:', err);
      res.status(500).json({ error: '게시글 작성 실패' });
      return;
    }
    console.log('게시글 작성 성공');
    res.json({ message: '게시글 작성 성공' });
  });
});

// 게시글 업데이트 엔드포인트
router.put('/update/:postId', verifyToken, (req, res) => {
  const userId = req.userId;
  const postId = req.params.postId;
  const { sort, menu, star, title, content } = req.body;

  const query = `UPDATE posts SET sort=?, menu=?, star=?, title=?, content=? WHERE post_id=? AND user_id=?`;

  db.query(query, [sort, menu, star, title, content, postId, userId], (err, result) => {
    if (err) {
      console.error('게시글 업데이트 오류:', err);
      res.status(500).json({ error: '게시글 업데이트 실패' });
      return;
    }
    if (result.affectedRows === 0) {
        res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
        return;
    }
    const successMsg = '게시글 업데이트 성공';
    res.json({ message: successMsg});
  });
});

// 게시글 삭제 엔드포인트
router.delete('/delete/:postId', verifyToken, (req, res) => {
  const userId = req.userId;
  const postId = req.params.postId;

  const query = `DELETE FROM posts WHERE post_id=? AND user_id=?`;

  db.query(query, [postId, userId], (err, result) => {
    if (err) {
      console.error('게시글 삭제 오류:', err);
      res.status(500).json({ error: '게시글 삭제 실패' });
      return;
    }
    if (result.affectedRows === 0) {
        res.status(404).json({ error: '게시글을 삭제할 수 없습니다' });
        return;
    }
    const successMsg ='게시글 삭제 성공';
    res.json({message:successMsg});
  });
});

module.exports = router;
