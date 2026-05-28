import express from 'express';
import cors from 'cors';
import db from './db.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Ensure uploads directory exists
fs.mkdirSync('uploads', { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'company_logo_' + Date.now() + ext);
  }
});
const upload = multer({ storage });


// --- JOBS ENDPOINTS ---
app.get('/api/jobs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM jobs ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/jobs', async (req, res) => {
  const { title, department, kota, pendidikan, jenisPekerjaan, sistemKerja, gender, statusPernikahan, deskripsi, hariJamKerja, psikotes, paketPsikotes } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO jobs (title, department, kota, pendidikan, jenis_pekerjaan, sistem_kerja, gender, status_pernikahan, deskripsi, hari_jam_kerja, psikotes, paket_psikotes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, department, kota, pendidikan, jenisPekerjaan, sistemKerja, gender, statusPernikahan, deskripsi, hariJamKerja, psikotes ? 1 : 0, paketPsikotes]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/jobs/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query('UPDATE jobs SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;
  const { title, department, kota, pendidikan, jenisPekerjaan, sistemKerja, gender, statusPernikahan, deskripsi, hariJamKerja, psikotes, paketPsikotes } = req.body;
  try {
    await db.query(
      'UPDATE jobs SET title = ?, department = ?, kota = ?, pendidikan = ?, jenis_pekerjaan = ?, sistem_kerja = ?, gender = ?, status_pernikahan = ?, deskripsi = ?, hari_jam_kerja = ?, psikotes = ?, paket_psikotes = ? WHERE id = ?',
      [title, department, kota, pendidikan, jenisPekerjaan, sistemKerja, gender, statusPernikahan, deskripsi, hariJamKerja, psikotes ? 1 : 0, paketPsikotes, id]
    );
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- APPLICANTS ENDPOINTS ---
app.get('/api/applicants', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM applicants ORDER BY id DESC');
    // Parse JSON strings back to arrays/objects
    const parsedRows = rows.map(r => ({
      ...r,
      jobId: r.job_id,
      matchScore: r.match_score,
      aiMatchDetails: {
        strengths: r.ai_strengths ? JSON.parse(r.ai_strengths) : [],
        weaknesses: r.ai_weaknesses ? JSON.parse(r.ai_weaknesses) : [],
        conclusion: r.ai_conclusion
      },
      interviewSummary: r.interview_score ? {
        score: r.interview_score,
        notes: r.interview_notes,
        conclusion: r.interview_conclusion
      } : null
    }));
    res.json(parsedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/applicants/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query('UPDATE applicants SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PSYCHOTEST PACKAGES ENDPOINTS ---
app.get('/api/packages', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT name FROM psychotest_packages');
    res.json(rows.map(r => r.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/packages', async (req, res) => {
  const { name } = req.body;
  try {
    await db.query('INSERT INTO psychotest_packages (name) VALUES (?)', [name]);
    res.status(201).json({ name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SUPPORT MESSAGES ENDPOINTS ---
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, sender_role as senderRole, text, timestamp FROM support_messages ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  const { senderRole, text, timestamp } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO support_messages (sender_role, text, timestamp) VALUES (?, ?, ?)',
      [senderRole, text, timestamp]
    );
    res.status(201).json({ id: result.insertId, senderRole, text, timestamp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PROFILE ENDPOINTS ---
app.get('/api/profile/company', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM company_profile WHERE id = 1');
    if (rows.length > 0) {
      const row = rows[0];
      res.json({
        namaPerusahaan: row.nama_perusahaan || '',
        emailPerusahaan: row.email_perusahaan || '',
        deskripsi: row.deskripsi || '',
        noTelp: row.no_telp || '',
        alamat: row.alamat || '',
        provinsi: row.provinsi || '',
        kota: row.kota || '',
        kecamatan: row.kecamatan || '',
        kodePos: row.kode_pos || '',
        jumlahPegawai: row.jumlah_pegawai || '',
        industri: row.industri || '',
        website: row.website || '',
        tahunBerdiri: row.tahun_berdiri || '',
        nib: row.nib || '',
        logo: row.logo || ''
      });
    } else {
      res.json({});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile/company', async (req, res) => {
  const { namaPerusahaan, emailPerusahaan, deskripsi, noTelp, alamat, provinsi, kota, kecamatan, kodePos, jumlahPegawai, industri, website, tahunBerdiri, nib } = req.body;
  try {
    await db.query(
      `UPDATE company_profile SET 
        nama_perusahaan = ?, email_perusahaan = ?, deskripsi = ?, no_telp = ?, alamat = ?, 
        provinsi = ?, kota = ?, kecamatan = ?, kode_pos = ?, jumlah_pegawai = ?, 
        industri = ?, website = ?, tahun_berdiri = ?, nib = ? 
       WHERE id = 1`,
      [namaPerusahaan, emailPerusahaan, deskripsi, noTelp, alamat, provinsi, kota, kecamatan, kodePos, jumlahPegawai, industri, website, tahunBerdiri, nib]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile/company/logo', upload.single('logo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const filename = req.file.filename;
  try {
    await db.query('UPDATE company_profile SET logo = ? WHERE id = 1', [filename]);
    res.json({ success: true, logo: filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profile/user', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM user_profile WHERE id = 1');
    if (rows.length > 0) {
      const row = rows[0];
      res.json({
        namaLengkap: row.nama_lengkap || '',
        email: row.email || '',
        noWhatsapp: row.no_whatsapp || ''
      });
    } else {
      res.json({});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile/user', async (req, res) => {
  const { namaLengkap, email, noWhatsapp } = req.body;
  try {
    await db.query(
      'UPDATE user_profile SET nama_lengkap = ?, email = ?, no_whatsapp = ? WHERE id = 1',
      [namaLengkap, email, noWhatsapp]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

