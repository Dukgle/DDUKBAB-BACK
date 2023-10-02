const express = require('express');
const router = express.Router();
const db = require('../../config/dbConfig');

// 이름, 닉네임 조회
router.get('/:salerId/saler-page/info', (req,res) => {
    const salerId = req.params.salerId;

    const query = `SELECT username, nickname FROM salers WHERE saler_id = ?`;

    db.query(query, [salerId], (err, result) => {
        if (err) {
            console.error('마이페이지 조회 오류:', err);
            res.status(500).json({ error: '마이페이지 조회 실패' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: '마이페이지를 찾을 수 없습니다' });
            return;
        }
        const saler_page = result[0];
        res.json({ saler_page });
    });
});

module.exports = router;