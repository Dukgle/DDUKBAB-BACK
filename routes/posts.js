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
router.get('/get/:postId', verifyToken, (req, res) => {
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

// 게시글 좋아요 api
router.post('/like-post/:postId', verifyToken, (req, res) => {
  const userId = req.userId;
  const postId = req.params.postId;

  // 게시물 작성자 정보 조회 (예: posts 테이블에서 작성자 정보 조회)
  db.query('SELECT user_id FROM posts WHERE post_id = ?', [postId], (err, rows) => {
      if (err) {
          console.error('MySQL 쿼리 오류:', err);
          return res.status(500).json({ error: '서버 오류' });
      }

      if (rows.length === 0) {
          return res.status(404).json({ error: '게시물이 존재하지 않습니다.' });
      }

      const postAuthorId = rows[0].user_id;

      // 게시물 작성자와 로그인한 사용자가 동일한 경우
      if (postAuthorId === userId) {
          return res.status(400).json({ error: '자신의 글에는 좋아요를 누를 수 없습니다.' });
      }

      // 좋아요 클릭 기록 확인
      db.query('SELECT * FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId], (err, rows) => {
          if (err) {
              console.error('MySQL 쿼리 오류:', err);
              return res.status(500).json({ error: '서버 오류' });
          }

          if (rows.length > 0) {
              // 이미 클릭한 경우
              return res.status(400).json({ error: '이미 좋아요를 클릭했습니다.' });
          } else {
              // 클릭 가능한 경우, 좋아요 클릭 기록을 추가
              db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId], (err, result) => {
                  if (err) {
                      console.error('MySQL 쿼리 오류:', err);
                      return res.status(500).json({ error: '서버 오류' });
                  }

                  res.json({ message: '게시글 좋아요가 업데이트되었습니다.' });
              });
          }
      });
  });
});



router.get('/like-get/:postId', (req, res) => {
  const postId = req.params.postId;

  const query = `SELECT likes FROM posts WHERE post_id = ?`;

  db.query(query, [postId], (err, result) => {
    if (err) {
      console.error('좋아요 조회 오류:', err);
      res.status(500).json({ error: '좋아요 조회 실패' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: '좋아요 수를 찾을 수 없습니다' });
      return;
    }
    const like = result[0];
    res.json({ like });
  });
});

module.exports = router;
