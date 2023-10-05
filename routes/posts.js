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

// 내 게시글 조회 한개
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

// 내 게시글 조회 전부
router.get('/get', verifyToken, (req, res) => {
  const userId = req.userId;
  const query = `SELECT content, created_at, star FROM posts WHERE user_id = ?`;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('게시글 조회 오류:', err);
      res.status(500).json({ error: '게시글 조회 실패' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
      return;
    }
    const post = result;
    res.json({ post });
  });
});

// 모두가 확인 가능
router.get('/get-everyone', (req, res) => {
  // "sort"와 "menu" 값을 요청에서 추출합니다.
  const { sort, menu } = req.body;

  // SQL 쿼리를 동적으로 생성합니다.
  let query = 'SELECT users.nickname, posts.content, posts.star, posts.created_at FROM posts join users where posts.user_id = users.user_id and posts.sort = ? AND posts.menu = ?';

  // // "sort" 및 "menu"가 요청에 포함된 경우, 조건을 추가합니다.
  // if (sort && menu) {
  //   query += ` `;
  // } else if (sort) {
  //   query += ` and sort = ?`;
  // } else if (menu) {
  //   query += ` and menu = ?`;
  // }

  // console.log(query)

  // 데이터베이스 쿼리를 실행합니다.
  db.query(query, [sort, menu], (err, result) => {
    if (err) {
      console.error('게시글 조회 오류:', err);
      res.status(500).json({ error: '게시글 조회 실패' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
      return;
    }
    const post = result;
    res.json({ post });
  });
});

// 모두가 최신 순으로 볼 수 있게
router.get('/get-everyone/latest', (req, res) => {
  // "sort"와 "menu" 값을 요청에서 추출합니다.
  const { sort, menu } = req.body;

  // SQL 쿼리를 동적으로 생성합니다.
  let query = 'SELECT users.nickname, posts.content, posts.star, posts.created_at FROM posts JOIN users ON posts.user_id = users.user_id';

  // 정렬 기준을 추가하여 최신순으로 정렬합니다.
  query += ' ORDER BY posts.created_at ASC';

  // 데이터베이스 쿼리를 실행합니다.
  db.query(query, [sort, menu], (err, result) => {
    if (err) {
      console.error('게시글 조회 오류:', err);
      res.status(500).json({ error: '게시글 조회 실패' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
      return;
    }
    const post = result;
    res.json({ post });
  });
});


// 모두가 별점 순으로 볼 수 있게
router.get('/get-everyone/star', (req, res) => {
  // "sort"와 "menu" 값을 요청에서 추출합니다.
  const { sort, menu } = req.body;

  // SQL 쿼리를 동적으로 생성합니다.
  let query = 'SELECT users.nickname, posts.content, posts.star, posts.created_at FROM posts JOIN users ON posts.user_id = users.user_id';

  // 정렬 기준을 추가하여 최신순으로 정렬합니다.
  query += ' ORDER BY posts.star DESC';

  // 데이터베이스 쿼리를 실행합니다.
  db.query(query, [sort, menu], (err, result) => {
    if (err) {
      console.error('게시글 조회 오류:', err);
      res.status(500).json({ error: '게시글 조회 실패' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
      return;
    }
    const post = result;
    res.json({ post });
  });
});


// 모두가 확인 가능(일부 게시)
router.get('/get-everyone/:postId', (req, res) => {
  // "sort"와 "menu" 값을 요청에서 추출합니다.
  const postId = req.params.postId;
  const { sort, menu } = req.body;

  // SQL 쿼리를 동적으로 생성합니다.
  let query = 'SELECT posts.post_id,posts.title, users.nickname, posts.sort, posts.menu, posts.star, posts.content, posts.created_at, posts.likes FROM posts join users where posts.user_id = users.user_id and posts.sort = ? AND posts.menu = ? AND posts.post_id = ?';

  // 데이터베이스 쿼리를 실행합니다.
  db.query(query, [sort, menu, postId], (err, result) => {
    if (err) {
      console.error('게시글 조회 오류:', err);
      res.status(500).json({ error: '게시글 조회 실패' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
      return;
    }
    const post = result;
    res.json({ post });
  });
});


// 게시글 작성 엔드포인트
router.post('/create', verifyToken, (req, res) => {
  const userId = req.userId;
  const { sort, menu, star, title, content } = req.body;
  const createAt = new Date();

  const query = `INSERT INTO posts (user_id, sort, menu, star, title, content, created_at) VALUES (?,?,?,?,?,?,?)`;

  db.query(query, [userId, sort, menu, star, title, content, createAt], (err, result) => {
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

// 게시글 좋아요 API
router.post('/like-post/:postId', verifyToken, (req, res) => {
  const userId = req.userId;
  const postId = req.params.postId;
  const createdAt = new Date(); // 변수명 수정: createAt -> createdAt

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
        db.query('INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, ?)', [userId, postId, createdAt], (err, result) => {
          if (err) {
            console.error('MySQL 쿼리 오류:', err);
            return res.status(500).json({ error: '서버 오류' });
          }

          // 게시물의 likes 열을 1 증가시킵니다.
          db.query('UPDATE posts SET likes = likes + 1 WHERE post_id = ?', [postId], (err, updateResult) => {
            if (err) {
              console.error('MySQL 쿼리 오류:', err);
              return res.status(500).json({ error: '서버 오류' });
            }

            // 좋아요를 가장 많이 받은 3개의 게시물을 조회하는 쿼리 (좋아요를 누른 게시물은 작성자와 일치하는 게시물만 선택)
            const topLikedPostsQuery = `
              SELECT posts.*
              FROM posts WHERE posts.user_id = ?
              GROUP BY posts.post_id
              ORDER BY likes DESC
              LIMIT 3
            `;

            db.query(topLikedPostsQuery, [postAuthorId], (err, topLikedPosts) => {
              if (err) {
                console.error('MySQL 쿼리 오류:', err);
                return res.status(500).json({ error: '서버 오류' });
              }

              res.json({ message: '게시글 좋아요가 업데이트되었습니다.', topLikedPosts });
            });
          });
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

// 게시글 좋아요 삭제 API
router.delete('/like-delete/:postId', verifyToken, (req, res) => {
  const userId = req.userId;
  const postId = req.params.postId;

  // 좋아요 클릭 기록 확인
  db.query('SELECT * FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId], (err, rows) => {
    if (err) {
      console.error('MySQL 쿼리 오류:', err);
      return res.status(500).json({ error: '서버 오류' });
    }

    if (rows.length === 0) {
      // 클릭한 좋아요 기록이 없는 경우
      return res.status(404).json({ error: '좋아요 기록을 찾을 수 없습니다.' });
    }

    // 좋아요 클릭 기록 삭제
    db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId], (err, result) => {
      if (err) {
        console.error('MySQL 쿼리 오류:', err);
        return res.status(500).json({ error: '서버 오류' });
      }

      db.query('UPDATE posts SET likes = likes + 1 WHERE post_id = ?', [postId], (err, updateResult) => {
        if (err) {
          console.error('MySQL 쿼리 오류:', err);
          return res.status(500).json({ error: '서버 오류' });
        }

      res.json({ message: '게시글 좋아요가 삭제되었습니다.' });
    });
  });
  });
});


module.exports = router;
