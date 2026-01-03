import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../firebase.ts';
import { motion } from 'framer-motion';

const TeamDetail = () => {
  const { teamName } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamName) return;
    const teamRef = ref(db, `teams/${teamName}`);
    function handle(snap: any) {
      setTeam(snap.val());
      setLoading(false);
    }
    onValue(teamRef, handle);
    return () => off(teamRef, handle as any);
  }, [teamName]);

  return (
    <div className="min-h-screen px-4 py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="glow-btn mb-4">Back</button>
        {loading ? (
          <div className="glass-card p-6">Loading...</div>
        ) : !team ? (
          <div className="glass-card p-6">Team not found</div>
        ) : (
          <div className="glass-card p-6">
            <h2 className="title-glow text-2xl mb-4">{teamName}</h2>
            <div className="grid gap-4">
              {(team.members || []).map((m: any, idx: number) => (
                <div key={idx} className="sub-card">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-cyan-200">{m.regNo} • {m.year} • {m.dept}</div>
                  <div className="mt-2">
                    <div className="text-sm text-cyan-300">Residence: {m.residenceType || 'Day Scholar'}</div>
                    {m.residenceType === 'Hosteller' && (
                      <div className="mt-2 p-3 bg-black/20 rounded-lg text-sm text-cyan-300 border border-cyan-500/10">
                        <div>Hostel: {m.hostelName}</div>
                        <div>Room: {m.roomNumber}</div>
                        <div>Warden: {m.wardenName}</div>
                        <div>Phone: {m.wardenPhone}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {team.payment && (
              <div className="mt-8">
                <h3 className="title-glow text-xl mb-4">Payment Details</h3>
                <div className="sub-card space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-cyan-300 mb-1">Total Amount</div>
                      <div className="text-xl font-bold">₹{team.payment.amount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-cyan-300 mb-1">Transaction ID</div>
                      <div className="font-mono bg-black/30 p-2 rounded border border-cyan-500/20">
                        {team.payment.transactionId}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-cyan-300 mb-2">Payment Screenshot</div>
                    <div className="relative group">
                      <img
                        src={team.payment.screenshotUrl}
                        alt="Payment Screenshot"
                        className="w-full max-w-md rounded-lg border border-cyan-500/30 transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <a
                        href={team.payment.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-4 right-4 bg-black/80 text-cyan-300 px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Full Size
                      </a>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 text-right">
                    Submitted: {new Date(team.payment.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TeamDetail;
