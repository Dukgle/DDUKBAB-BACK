const express = require('express');
const router = express.Router();
const db = require('../config/dbConfig');

// 이름, 닉네임 조회
router.get('/:userId/my-page/info', (req,res) => {
    const userId = req.params.userId;

    const query = `SELECT username, nickname, point FROM users WHERE user_id = ?`;

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('마이페이지 조회 오류:', err);
            res.status(500).json({ error: '마이페이지 조회 실패' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: '마이페이지를 찾을 수 없습니다' });
            return;
        }
        const my_page = result[0];
        res.json({ my_page });
    });
});

// 좌석 조회(한개 예약으로 제)
router.get('/:userId/my-page/seat-reserve', (req,res) => {
    const userId = req.params.userId;
    const query = `SELECT username, nickname, point FROM users WHERE user_id = ?`;

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('마이페이지 조회 오류:', err);
            res.status(500).json({ error: '마이페이지 조회 실패' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: '마이페이지를 찾을 수 없습니다' });
            return;
        }
        const my_page = result[0];
        res.json({ my_page });
    });
});

// 남은 시간 api

module.exports = router;