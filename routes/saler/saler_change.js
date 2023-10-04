const express = require('express');
const router = express.Router();
const db = require('../../config/dbConfig');

router.put('/:salerId/nickname-update', (req, res) => {
    const salerId = req.params.salerId;
    const { nickname } = req.body;
  
    const query = `UPDATE salers SET nickname=? WHERE saler_id=?`;
  
    db.query(query, [nickname, salerId], (err, result) => {
        if (err) {
            console.error('닉네임 업데이트 오류:', err);
            res.status(500).json({ error: '닉네임 업데이트 실패' });
            return;
        }
        res.json({ message: '닉네임 업데이트 성공' });
    });
  })

  router.get('/:salerId/saler-info', (req, res) => {
    const salerId = req.params.salerId;
    const query = `SELECT username, uni_num, role FROM salers WHERE saler_id = ?`;

    db.query(query, [salerId], (err, result) => {
        if (err) {
            console.error('정보 조회 오류:', err);
            res.status(500).json({ error: '정보 조회 실패' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: '정보를 찾을 수 없습니다' });
            return;
        }
        const saler_info = result[0];
        res.json({ saler_info });
    });
});

module.exports = router;