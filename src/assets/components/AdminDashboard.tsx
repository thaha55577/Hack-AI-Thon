import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db, auth } from '../../firebase.ts';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

interface Member {
  name: string;
  regNo: string;
  year: string;
  dept: string;
  phone: string;
  residenceType?: 'Day Scholar' | 'Hosteller';
  hostelName?: string;
  roomNumber?: string;
  wardenName?: string;
  wardenPhone?: string;
}

interface Team {
  teamName: string;
  members: Member[];
  payment?: {
    timestamp?: string;
    amount?: number;
    transactionId?: string;
    screenshotUrl?: string;
  };
}

interface AttendanceRow {
  teamNumber: number;
  teamName: string;
  regNo: string;
  name: string;
  dept: string;
  phone: string;
  isFirstMember: boolean;
  residenceType?: string;
  hostelName?: string;
  roomNumber?: string;
  wardenName?: string;
  wardenPhone?: string;
  registrationTime?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teamsRef = ref(db, 'teams');

    const handleData = (snapshot: any) => {
      const data = snapshot.val();

      if (!data) {
        setTeams([]);
        setLoading(false);
        return;
      }

      const processedTeams = Object.entries(data).map(([teamName, teamData]: [string, any]) => ({
        teamName,
        members: teamData.members || [],
        payment: teamData.payment,
      }));

      // Sort by timestamp ascending (oldest first)
      processedTeams.sort((a, b) => {
        const timeA = a.payment?.timestamp ? new Date(a.payment.timestamp).getTime() : 0;
        const timeB = b.payment?.timestamp ? new Date(b.payment.timestamp).getTime() : 0;
        return timeA - timeB;
      });

      setTeams(processedTeams);
      setLoading(false);
    };

    onValue(teamsRef, handleData);

    return () => {
      off(teamsRef);
    };
  }, []);

  const playSfx = (type: 'transform' | 'click') => {
    const sound = document.getElementById(`sfx-${type}`) as HTMLAudioElement;
    if (sound) {
      sound.currentTime = 0;
      sound.volume = 0.4;
      sound.play().catch(() => {
        // Auto-play policy might block this without interaction
      });
    }
  };

  const handleLogout = async () => {
    playSfx('click');
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const flattenTeamsToRows = (teams: Team[]): AttendanceRow[] => {
    const rows: AttendanceRow[] = [];
    teams.forEach((team, teamIndex) => {
      team.members.forEach((member, memberIndex) => {
        rows.push({
          teamNumber: teamIndex + 1,
          teamName: team.teamName,
          regNo: member.regNo,
          name: member.name,
          dept: member.dept || '',
          phone: member.phone || '',
          isFirstMember: memberIndex === 0,
          residenceType: member.residenceType || 'Day Scholar',
          hostelName: member.hostelName || '',
          roomNumber: member.roomNumber || '',
          wardenName: member.wardenName || '',
          wardenPhone: member.wardenPhone || '',
          registrationTime: team.payment?.timestamp ? new Date(team.payment.timestamp).toLocaleString() : '',
        });
      });
    });
    return rows;
  };

  const attendanceRows = flattenTeamsToRows(filteredTeams);

  const handleExportCSV = () => {
    playSfx('click');
    if (filteredTeams.length === 0) {
      toast.error('No teams to export');
      return;
    }

    // CSV header with new residence/hostel columns
    let csvContent = 'Team Number,Team Name,Reg Number,Name,Department,Phone Number,Residence Type,Hostel Name,Room Number,Warden Name,Warden Phone,Registration Time\n';

    attendanceRows.forEach((row) => {
      const escape = (s?: string) => `"${(s || '').replace(/"/g, '""')}"`;
      csvContent += `${row.teamNumber},${escape(row.teamName)},${escape(row.regNo)},${escape(row.name)},${escape(row.dept)},${escape(row.phone)},${escape(row.residenceType)},${escape(row.hostelName)},${escape(row.roomNumber)},${escape(row.wardenName)},${escape(row.wardenPhone)},${escape(row.registrationTime)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'HACK-AI-THON-Team-Details.csv');
    toast.success('CSV exported successfully');
  };

  const handleExportPDF = async () => {
    playSfx('click');
    if (filteredTeams.length === 0) {
      toast.error('No teams to export');
      return;
    }

    const doc = new jsPDF();

    try {
      const img = new Image();
      img.src = '/ACM_LOGO.png';
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      doc.addImage(img, 'PNG', 14, 10, 25, 25);
    } catch (error) {
      console.log('Logo not loaded');
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION', 105, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.text('KARE ACM STUDENT CHAPTER – HACK-AI-THON', 105, 22, { align: 'center' });

    doc.setFontSize(10);
    doc.text('TEAM REGISTRATION SHEET', 105, 29, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 35, { align: 'center' });

    const tableData = attendanceRows.map((row) => [
      row.teamNumber.toString(),
      row.teamName,
      row.regNo,
      row.name,
      row.dept,
      row.phone,
      row.residenceType || 'Day Scholar',
      row.hostelName || '',
      row.roomNumber || '',
      row.wardenName || '',
      row.wardenPhone || '',
      row.registrationTime || '',
    ]);

    autoTable(doc, {
      head: [[
        'Team Number',
        'Team Name',
        'Reg Number',
        'Name',
        'Department',
        'Phone',
        'Residence Type',
        'Hostel Name',
        'Room Number',
        'Warden Name',
        'Warden Phone',
        'Reg Time'
      ]],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
        lineWidth: 0.1,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      // rely on autoTable default column sizing for PDF
    });

    doc.save('HACK-AI-THON-Team-Details.pdf');
    toast.success('PDF exported successfully');
  };

  const handleExportFilteredPDF = async (filterType: 'Hosteller' | 'Day Scholar') => {
    playSfx('click');
    const filteredRows = attendanceRows.filter((r) => (r.residenceType || 'Day Scholar') === filterType);
    if (filteredRows.length === 0) {
      toast.error(`No ${filterType === 'Hosteller' ? 'hostellers' : 'day scholars'} to export`);
      return;
    }

    const doc = new jsPDF();

    try {
      const img = new Image();
      img.src = '/ACM_LOGO.png';
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      doc.addImage(img, 'PNG', 14, 10, 25, 25);
    } catch (error) {
      console.log('Logo not loaded');
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION', 105, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.text('KARE ACM STUDENT CHAPTER – HACK-AI-THON', 105, 22, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`${filterType.toUpperCase()} - TEAM REGISTRATION SHEET`, 105, 29, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 35, { align: 'center' });

    const tableData = filteredRows.map((row) => [
      row.teamNumber.toString(),
      row.teamName,
      row.regNo,
      row.name,
      row.dept,
      row.phone,
      row.residenceType || 'Day Scholar',
      row.hostelName || '',
      row.roomNumber || '',
      row.wardenName || '',
      row.wardenPhone || '',
      row.registrationTime || '',
    ]);

    autoTable(doc, {
      head: [[
        'Team Number',
        'Team Name',
        'Reg Number',
        'Name',
        'Department',
        'Phone',
        'Residence Type',
        'Hostel Name',
        'Room Number',
        'Warden Name',
        'Warden Phone',
        'Reg Time'
      ]],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
        lineWidth: 0.1,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
    });

    const fileName = filterType === 'Hosteller' ? 'HACK-AI-THON-Hostellers.pdf' : 'HACK-AI-THON-DayScholars.pdf';
    doc.save(fileName);
    toast.success(`${fileName} exported successfully`);
  };

  const triggerBlast = () => {
    // 1. Play Explosion Sound
    const blastSound = new Audio('https://www.soundjay.com/mechanical/sounds/explosion-01.mp3');
    blastSound.volume = 0.5;
    blastSound.play().catch(() => { });

    // 2. Add Shake to the body
    document.body.classList.add('shake-active');

    // 3. Remove shake after animation ends
    setTimeout(() => {
      document.body.classList.remove('shake-active');
    }, 500);
  };

  return (
    <div className="min-h-screen px-4 py-8 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="cybertron-title text-4xl">COMMAND CENTER</h1>
            <button onClick={handleLogout} className="glow-btn" onMouseDown={() => playSfx('click')}>
              ABORT SESSION
            </button>
          </div>

          <div className="tf-card mb-6 p-6">
            <div className="glitch-overlay"></div>
            <div className="frame-corner top-left"></div>
            <div className="frame-corner bottom-right"></div>

            <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
              <input
                type="text"
                placeholder="SCAN FOR UNIT..."
                className="glow-input flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex gap-3">
                <button onClick={handleExportCSV} className="glow-btn text-sm px-4" onMouseDown={() => playSfx('click')}>
                  EXTRACT DATA (CSV)
                </button>
                <button onClick={handleExportPDF} className="glow-btn text-sm px-4" onMouseDown={() => playSfx('click')}>
                  EXTRACT DATA (PDF)
                </button>
              </div>
              <div className="flex flex-col gap-2 ml-2 mt-2">
                <button onClick={() => handleExportFilteredPDF('Hosteller')} className="glow-btn text-xs px-3 py-2" onMouseDown={() => playSfx('click')}>
                  EXTRACT HOSTELLERS
                </button>
                <button onClick={() => handleExportFilteredPDF('Day Scholar')} className="glow-btn text-xs px-3 py-2" onMouseDown={() => playSfx('click')}>
                  EXTRACT DAY SCHOLARS
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="loader"></div>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="tf-card text-center py-12">
              <div className="glitch-overlay"></div>
              <p className="text-xl text-cyan-300 relative z-10">
                {searchTerm
                  ? 'NO UNITS DETECTED.'
                  : 'DATABASE EMPTY.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team, idx) => (
                <motion.div
                  key={team.teamName}
                  className="war-card group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  onClick={() => {
                    triggerBlast();
                    setTimeout(() => {
                      navigate(`/admin/team/${encodeURIComponent(team.teamName)}`);
                    }, 300);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {/* Video Overlay (Placeholder or actual if available) */}
                  <div className="video-overlay absolute inset-0 z-0">
                    {/* Using a placeholder video or image if no specific video is available per team */}
                    <div className="w-full h-full bg-gradient-to-t from-black to-transparent opacity-50"></div>
                  </div>

                  <div className="explosion-overlay"></div>
                  <div className="hud-line"></div>
                  <div className="glitch-overlay opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="card-content relative z-10 p-6 h-full flex flex-col justify-between min-h-[200px]">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2 tracking-wider" style={{ fontFamily: 'Orbitron', textShadow: '0 0 10px #00d4ff' }}>
                        {team.teamName}
                      </h3>
                      <div className="text-xs text-cyan-200/70 mb-2 font-mono">
                        {team.payment?.timestamp
                          ? new Date(team.payment.timestamp).toLocaleString()
                          : 'Time: N/A'}
                      </div>
                      <div className="h-1 w-12 bg-cyan-500 mb-4"></div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="text-cyan-400 font-mono text-sm">
                        UNITS: {team.members.length}
                      </div>
                      <div className="text-white border border-cyan-500 px-3 py-1 text-xs hover:bg-cyan-500/20 transition-colors">
                        ENGAGE
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center text-cyan-300 font-orbitron text-sm">
            <p>ACTIVE UNITS: {filteredTeams.length} | TOTAL PERSONNEL: {attendanceRows.length}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
