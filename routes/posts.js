const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const db = require('../config/dbConfig');

router.get('/posting/:postId', (req, res) => {
    const userId = req.params.userId;
    const postId = req.params.postId;

    const query = `SELECT * FROM posts WHERE post_id = ?`;

    db.query(query, [postId], (err, result) => {
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
router.post('/create', (req, res) => {
    const {sort, menu, star, title, content } = req.body;

    const query = `INSERT INTO posts (sort, menu, star, title, content) VALUES (?,?,?,?,?)`;

    db.query(query, [sort, menu, star, title, content], (err, result) => {
        if (err) {
            console.error('게시글 작성 오류:', err);
            res.status(500).json({ error: '게시글 작성 실패' });
            return;
          }
          console.log('게시글 작성 성공');
          res.json({ message: '게시글 작성 성공' });
    })
})
router.put('/update/:postId', (req, res) => {
    const postId = req.params.postId;
    const { sort, menu, star, title, content } = req.body;

    const query = `UPDATE posts SET sort=?, menu=?, star=?, title=?, content=? WHERE post_id=?`;

    db.query(query, [sort, menu, star, title, content, postId], (err, result) => {
        if (err) {
            console.error('게시글 업데이트 오류:', err);
            res.status(500).json({ error: '게시글 업데이트 실패' });
            return;
        }
        res.json({ message: '게시글 업데이트 성공' });
    });
});

router.delete('/delete/:postId', (req, res) => {
    const postId = req.params.postId;

    const query = `DELETE FROM posts WHERE post_id=?`;

    db.query(query, [postId], (err, result) => {
        if (err) {
            console.error('게시글 삭제 오류:', err);
            res.status(500).json({ error: '게시글 삭제 실패' });
            return;
        }
        res.json({ message: '게시글 삭제 성공' });
    });
});



module.exports = router;