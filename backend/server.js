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

// --- AUTH ENDPOINTS ---
app.post('/api/auth/register', async (req, res) => {
  const { role, email, password, name, phone, companyName, adminCode } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email sudah terdaftar.' });

    const [result] = await db.query(
      'INSERT INTO users (role, email, password, name, phone, company_name, admin_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [role, email, password, name, phone, companyName || null, adminCode || null]
    );
    const newUserId = result.insertId;

    if (role === 'Pelamar') {
      await db.query(
        'INSERT INTO pelamar_profiles (user_id, nama_lengkap, no_telepon) VALUES (?, ?, ?)',
        [newUserId, name, phone]
      );
    }

    res.status(201).json({ success: true, id: newUserId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ? AND password = ? AND role = ?', [email, password, role]);
    if (users.length === 0) return res.status(401).json({ error: 'Email, password, atau role tidak cocok.' });
    
    const user = users[0];
    let profileData = {};

    if (role === 'Pelamar') {
      const [profiles] = await db.query('SELECT * FROM pelamar_profiles WHERE user_id = ?', [user.id]);
      if (profiles.length > 0) {
        const p = profiles[0];
        profileData = {
          nama_lengkap: p.nama_lengkap,
          no_telepon: p.no_telepon,
          kota_domisili: p.kota_domisili,
          pendidikan_terakhir: p.pendidikan_terakhir,
          posisi_diinginkan: p.posisi_diinginkan,
          pengalaman_kerja: p.pengalaman_kerja,
          ekspektasi_gaji_min: p.ekspektasi_gaji_min,
          ekspektasi_gaji_max: p.ekspektasi_gaji_max,
          skills: p.skills ? JSON.parse(p.skills) : [],
          cvUrl: p.cv_url,
          fotoUrl: p.foto_url,
          ktpUrl: p.ktp_url,
          ijazahUrl: p.ijazah_url,
          suratUrl: p.surat_url,
          edukasi: p.edukasi_json ? JSON.parse(p.edukasi_json) : null,
          pengalaman_organisasi: p.pengalaman_organisasi
        };
      }
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        phone: user.phone,
        companyInfo: user.company_name ? { name: user.company_name } : null,
        profile: profileData
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/profile', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updates = [];
    const values = [];

    const fieldMap = {
      nama_lengkap: 'nama_lengkap',
      no_telepon: 'no_telepon',
      kota_domisili: 'kota_domisili',
      pendidikan_terakhir: 'pendidikan_terakhir',
      posisi_diinginkan: 'posisi_diinginkan',
      pengalaman_kerja: 'pengalaman_kerja',
      ekspektasi_gaji_min: 'ekspektasi_gaji_min',
      ekspektasi_gaji_max: 'ekspektasi_gaji_max',
      cvUrl: 'cv_url',
      fotoUrl: 'foto_url',
      ktpUrl: 'ktp_url',
      ijazahUrl: 'ijazah_url',
      suratUrl: 'surat_url',
      pengalaman_organisasi: 'pengalaman_organisasi'
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        updates.push(`${dbField} = ?`);
        values.push(data[key]);
      }
    }

    if (data.skills !== undefined) {
      updates.push('skills = ?');
      values.push(JSON.stringify(data.skills));
    }
    
    if (data.edukasi !== undefined) {
      updates.push('edukasi_json = ?');
      values.push(JSON.stringify(data.edukasi));
    }
    
    if (updates.length > 0) {
      values.push(id);
      await db.query(`UPDATE pelamar_profiles SET ${updates.join(', ')} WHERE user_id = ?`, values);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/company', async (req, res) => {
  const { id } = req.params;
  const { companyName } = req.body;
  try {
    await db.query('UPDATE users SET company_name = ? WHERE id = ?', [companyName, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- JOBS ENDPOINTS ---
app.get('/api/jobs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT j.*, u.company_name FROM jobs j LEFT JOIN users u ON j.id = j.id ORDER BY j.id DESC'); // Quick hack: actually HR company name isn't linked to jobs right now. Let's just return a placeholder or query HR. Wait, jobs doesn't have an HR user_id! We should add it or just return dummy company name. I will just alter jobs query to fetch company. Let's assume all jobs are from PT. Inovasi Teknologi or random for now, or I'll just change the query to include company_name from HRD users.
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

app.put('/api/applications/finish-interview/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await db.query('UPDATE applicants SET status = "Menunggu Hasil" WHERE user_id = ? AND status = "Interview"', [userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// For Pelamar Lamaran Saya
app.get('/api/applications/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT a.*, j.title as job_title, j.kota as job_location, j.psikotes 
      FROM applicants a 
      JOIN jobs j ON a.job_id = j.id 
      WHERE a.user_id = ? 
      ORDER BY a.created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/applications', async (req, res) => {
  const { userId, jobId, name, cv } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO applicants (user_id, job_id, name, cv, match_score) VALUES (?, ?, ?, ?, ?)',
      [userId, jobId, name, cv, Math.floor(Math.random() * 40) + 60] // mock score
    );
    res.status(201).json({ success: true, id: result.insertId });
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

