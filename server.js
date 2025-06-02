const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Cho phép CORS và phục vụ frontend
app.use(cors());
app.use(express.static('public'));

// Elasticsearch client
const client = new Client({
  node: 'http://localhost:9200',
});

// Kiểm tra kết nối ES
(async () => {
  try {
    const health = await client.cluster.health();
    console.log('Elasticsearch cluster health:', health.status);
  } catch (err) {
    console.error('Không thể kết nối Elasticsearch:', err.message);
  }
})();

// Route tìm kiếm
app.get('/search', async (req, res) => {
  const keyword = req.query.q;
  if (!keyword) return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });

  try {
    const result = await client.search({
      index: 'products',
      size: 20,
      query: {
        multi_match: {
          query: keyword,
          fields: ['name^3', 'description', 'category'],
          fuzziness: 'AUTO',
        }
      }
    });

    const hits = result.hits.hits.map(hit => hit._source);
    res.json(hits);
  } catch (err) {
    console.error('Lỗi tìm kiếm:', err.message);
    res.status(500).json({ error: 'Lỗi khi tìm kiếm' });
  }
});

// Khởi động server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

