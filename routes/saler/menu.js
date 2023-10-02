const express = require('express');
const router = express.Router();
const db = require('../../config/dbConfig');

router.post('/:salerId', (req,res) => {
    const salerId = req.params.salerId;
    const {seat_num } = req.body;

    const query = `INSERT INTO pasta (seat_num) VALUE (?)`;

    db.query(query, [seat_num], (err, result) => {
        if (err) {
            console.error('자리 선택 오류:', err);
            res.status(500).json({ error: '자리 선택 실패' });
            return;
          }
          console.log('자리 선택 성공');
          res.json({ message: '자리 선택 성공' });
    })
});

module.exports = router;