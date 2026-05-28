import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const DataProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [psychotestPackages, setPsychotestPackages] = useState([]);
  const [supportMessages, setSupportMessages] = useState([]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [jobsRes, applicantsRes, packagesRes, messagesRes] = await Promise.all([
        fetch(`${API_URL}/jobs`),
        fetch(`${API_URL}/applicants`),
        fetch(`${API_URL}/packages`),
        fetch(`${API_URL}/messages`)
      ]);
      
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (applicantsRes.ok) setApplicants(await applicantsRes.json());
      if (packagesRes.ok) setPsychotestPackages(await packagesRes.json());
      if (messagesRes.ok) setSupportMessages(await messagesRes.json());
    } catch (error) {
      console.error("Failed to fetch data from backend:", error);
      // alert("Gagal mengambil data dari database. Pastikan XAMPP MySQL dan Server Backend menyala!");
    }
  };

  useEffect(() => {
    fetchData();
    
    // Optional: simple polling for real-time chat updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const addPsychotestPackage = async (pkgName) => {
    try {
      const res = await fetch(`${API_URL}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pkgName })
      });
      if (res.ok) {
        setPsychotestPackages(prev => [...prev, pkgName]);
      } else {
        alert("Gagal menyimpan paket psikotes. Pastikan tabel database sudah ada.");
      }
    } catch (error) {
      console.error(error);
      alert("Koneksi ke backend gagal. Pastikan XAMPP dan Backend berjalan.");
    }
  };

  const updateApplicantStatus = async (applicantId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/applicants/${applicantId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApplicants((prev) => prev.map((app) => (app.id === applicantId ? { ...app, status: newStatus } : app)));
      } else {
        alert("Gagal mengupdate status. Pastikan tabel database sudah ada.");
      }
    } catch (error) {
      console.error(error);
      alert("Koneksi ke backend gagal. Pastikan XAMPP dan Backend berjalan.");
    }
  };

  const addInterviewFeedback = async (applicantId, feedback) => {
    // Note: The backend schema might need updating to support interview feedback properly,
    // but for simplicity, we mock the local state update. A full PUT /applicants/:id/interview endpoint would be better.
    setApplicants((prev) =>
      prev.map((app) => (app.id === applicantId ? { ...app, interviewSummary: feedback } : app))
    );
  };

  const addJob = async (newJob) => {
    try {
      const res = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      if (res.ok) {
        const savedJob = await res.json();
        setJobs(prev => [{ ...savedJob, status: 'Active' }, ...prev]);
        alert("Lowongan berhasil diposting ke database!");
      } else {
        alert("Gagal memposting lowongan. Pastikan tabel database sudah ada.");
      }
    } catch (error) {
      console.error(error);
      alert("Koneksi ke backend gagal. Pastikan XAMPP dan Backend berjalan.");
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    const statusToSave = newStatus === 'Dibuka' ? 'Active' : newStatus;
    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusToSave })
      });
      if (res.ok) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: statusToSave } : j));
      } else {
        alert("Gagal mengupdate status lowongan.");
      }
    } catch (error) {
      console.error(error);
      alert("Koneksi ke backend gagal. Pastikan XAMPP dan Backend berjalan.");
    }
  };

  const updateJob = async (jobId, updatedJob) => {
    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJob)
      });
      if (res.ok) {
        const savedJob = await res.json();
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...savedJob } : j));
        alert("Lowongan berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui lowongan.");
      }
    } catch (error) {
      console.error(error);
      alert("Koneksi ke backend gagal. Pastikan XAMPP dan Backend berjalan.");
    }
  };

  const addSupportMessage = async (text, role) => {
    const timestamp = new Date().toISOString();
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderRole: role, text, timestamp })
      });
      if (res.ok) {
        const savedMsg = await res.json();
        setSupportMessages(prev => [...prev, savedMsg]);
      } else {
        alert("Gagal mengirim pesan. Pastikan tabel database sudah ada.");
      }
    } catch (error) {
      console.error(error);
      alert("Koneksi ke backend gagal. Pastikan XAMPP dan Backend berjalan.");
    }
  };

  const fetchCompanyProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/company`);
      if (res.ok) return await res.json();
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const updateCompanyProfile = async (profileData) => {
    try {
      const res = await fetch(`${API_URL}/profile/company`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const uploadCompanyLogo = async (file) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch(`${API_URL}/profile/company/logo`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.logo;
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/user`);
      if (res.ok) return await res.json();
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const updateUserProfile = async (userProfileData) => {
    try {
      const res = await fetch(`${API_URL}/profile/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfileData)
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <DataContext.Provider value={{ 
      jobs, applicants, updateApplicantStatus, addInterviewFeedback, addJob,
      isChatOpen, setIsChatOpen, psychotestPackages, addPsychotestPackage,
      supportMessages, addSupportMessage, updateJobStatus, updateJob,
      fetchCompanyProfile, updateCompanyProfile, uploadCompanyLogo,
      fetchUserProfile, updateUserProfile
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
