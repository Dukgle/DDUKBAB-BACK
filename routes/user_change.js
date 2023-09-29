const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/dbConfig');

router.put('/:userId/nickname-update', (req, res) => {
    const userId = req.params.userId;
    const { nickname } = req.body;
  
    const query = `UPDATE users SET nickname=? WHERE user_id=?`;
  
    db.query(query, [nickname, userId], (err, result) => {
        if (err) {
            console.error('닉네임 업데이트 오류:', err);
            res.status(500).json({ error: '닉네임 업데이트 실패' });
            return;
        }
        res.json({ message: '닉네임 업데이트 성공' });
    });
  })

router.get('/:userId/users-info', (req, res) => {
    const userId = req.params.userId;
    const query = `SELECT username, uni_num, role FROM users WHERE user_id = ?`;

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('정보 조회 오류:', err);
            res.status(500).json({ error: '정보 조회 실패' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: '정보를 찾을 수 없습니다' });
            return;
        }
        const user_info = result[0];
        res.json({ user_info });
    
    });
});



module.exports = router;