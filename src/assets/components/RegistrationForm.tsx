import { useState, useEffect } from 'react';
import { ref as dbRef, set, get } from 'firebase/database';
import { db } from '../../firebase.ts';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase.ts';
import { useNavigate } from 'react-router-dom';

// Placeholder for the Bumblebee GIF. 
// User should replace this with a local asset or a valid URL.
const BUMBLEBEE_GIF = "https://media1.tenor.com/m/9XgQJjXQJjUAAAAC/bumblebee-transform.gif";
// Alternative: "https://i.pinimg.com/originals/3d/82/e5/3d82e50e70c5f0c5f0c5f0c5f0c5f0c5.gif"

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

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState<number>(4);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  const [isTransforming, setIsTransforming] = useState(false);
  // New state for Screenshot Warning
  const [showWarning, setShowWarning] = useState(false);

  // New states for Rules and Registration Check
  const [showRules, setShowRules] = useState(true);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      // Give auth a moment to initialize if needed, though usually it's ready if we came from login
      if (!auth.currentUser) {
        // If not logged in, maybe redirect? But let's assume auth state is handled.
        setCheckingRegistration(false);
        return;
      }

      const userEmail = auth.currentUser.email;
      const teamsRef = dbRef(db, 'teams');

      try {
        const snapshot = await get(teamsRef);
        if (snapshot.exists()) {
          const allTeams = snapshot.val();
          setRegistrationCount(Object.keys(allTeams).length);

          // Check if any team was created by this user
          for (const team of Object.values(allTeams) as any[]) {
            if (team.createdBy === userEmail) {
              setHasRegistered(true);
              break;
            }
          }
        }

        if (userEmail === '99230040469@klu.ac.in') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking registration:", error);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkRegistration();
  }, []);




  const [leader, setLeader] = useState<Member>({
    name: '',
    regNo: '',
    year: '',
    dept: '',
    phone: '',
    residenceType: 'Day Scholar',
    hostelName: '',
    roomNumber: '',
    wardenName: '',
    wardenPhone: '',
  });

  const [member1, setMember1] = useState<Member>({
    name: '',
    regNo: '',
    year: '',
    dept: '',
    phone: '',
    residenceType: 'Day Scholar',
    hostelName: '',
    roomNumber: '',
    wardenName: '',
    wardenPhone: '',
  });

  const [member2, setMember2] = useState<Member>({
    name: '',
    regNo: '',
    year: '',
    dept: '',
    phone: '',
    residenceType: 'Day Scholar',
    hostelName: '',
    roomNumber: '',
    wardenName: '',
    wardenPhone: '',
  });

  const [member3, setMember3] = useState<Member>({
    name: '',
    regNo: '',
    year: '',
    dept: '',
    phone: '',
    residenceType: 'Day Scholar',
    hostelName: '',
    roomNumber: '',
    wardenName: '',
    wardenPhone: '',
  });

  const [member4, setMember4] = useState<Member>({
    name: '',
    regNo: '',
    year: '',
    dept: '',
    phone: '',
    residenceType: 'Day Scholar',
    hostelName: '',
    roomNumber: '',
    wardenName: '',
    wardenPhone: '',
  });

  const playSfx = (type: 'transform' | 'click') => {
    const sound = document.getElementById(`sfx-${type}`) as HTMLAudioElement;
    if (sound) {
      sound.currentTime = 0;
      sound.volume = 0.4;
      sound.play().catch(() => { });
    }
  };

  const handleMemberChange = (
    memberSetter: React.Dispatch<React.SetStateAction<Member>>,
    field: keyof Member,
    value: string
  ) => {
    let finalValue = value;

    if (field === 'regNo') {
      // Only numbers allowed
      finalValue = value.replace(/[^0-9]/g, '');
    } else if (field === 'year') {
      // Only 1-4 allowed, max 1 char
      finalValue = value.replace(/[^1-4]/g, '').slice(0, 1);
    } else if (field === 'dept') {
      // Force uppercase
      finalValue = value.toUpperCase();
    } else if (field === 'phone') {
      // Only numbers, max 10 digits
      finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    memberSetter((prev) => ({ ...prev, [field]: finalValue }));
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

  const triggerTransformation = (callback: () => void) => {
    setIsTransforming(true);
    playSfx('transform');

    // Duration of the transformation animation (e.g., 3 seconds)
    setTimeout(() => {
      setIsTransforming(false);
      callback();
    }, 3000);
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    playSfx('click');

    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    if (/[.#$[\]]/.test(teamName)) {
      toast.error('Team name cannot contain ., #, $, [, or ]');
      return;
    }

    const members = [leader, member1, member2, member3];
    if (teamSize === 5) {
      members.push(member4);
    }

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      if (!member.name || !member.regNo || !member.year || !member.dept || !member.phone) {
        toast.error(`Please fill all fields for ${i === 0 ? 'Team Leader' : `Member ${i}`}`);
        return;
      }
      if (member.phone.length !== 10) {
        toast.error(`Phone number for ${i === 0 ? 'Team Leader' : `Member ${i}`} must be exactly 10 digits`);
        return;
      }
    }

    // Validate per-member hostel details for members who selected Hosteller
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (m.residenceType === 'Hosteller') {
        if (!m.hostelName || !m.roomNumber || !m.wardenName || !m.wardenPhone) {
          toast.error(`Please fill all hostel fields for ${i === 0 ? 'Team Leader' : `Member ${i}`}`);
          return;
        }
      }
    }

    // Check for duplicate registrations
    try {
      setLoading(true);
      const teamsRef = dbRef(db, 'teams');
      const snapshot = await get(teamsRef);

      if (snapshot.exists()) {
        const allTeams = snapshot.val();
        const currentRegNos = members.map(m => m.regNo.trim().toLowerCase());

        for (const [tName, tData] of Object.entries(allTeams) as [string, any][]) {
          if (tData.members) {
            for (const member of tData.members) {
              if (currentRegNos.includes(member.regNo.trim().toLowerCase())) {
                toast.error(`Registration Number ${member.regNo} is already registered in team "${tName}"`);
                setLoading(false);
                return;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking duplicates:", error);
      toast.error("Error verifying registration. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);

    // Trigger transformation before showing payment
    triggerTransformation(() => {
      setShowPayment(true);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        e.target.value = ''; // Reset input
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        e.target.value = ''; // Reset input
        return;
      }

      setPaymentScreenshot(file);
    }
  };



  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playSfx('click');

    if (!transactionId.trim()) {
      toast.error('Please enter the Transaction ID');
      return;
    }

    // Modified Logic: Show Warning Popup instead of Toast
    if (!paymentScreenshot) {
      setShowWarning(true);
      return;
    }

    setLoading(true);

    try {
      const members = [leader, member1, member2, member3];
      if (teamSize === 5) {
        members.push(member4);
      }

      // Compress and convert image to Base64
      const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800; // Resize to reasonable width
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;

              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

              // Compress to JPEG with 0.6 quality
              const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
              resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
          };
          reader.onerror = (err) => reject(err);
        });
      };

      let screenshotBase64 = '';
      if (paymentScreenshot) {
        try {
          screenshotBase64 = await compressImage(paymentScreenshot);
        } catch (err) {
          console.error("Image compression failed", err);
          toast.error("Failed to process image");
          setLoading(false);
          return;
        }
      }

      const payload: any = {
        createdBy: auth.currentUser?.email,
        members: members,
        payment: {
          amount: teamSize * 200,
          transactionId: transactionId,
          screenshotUrl: screenshotBase64, // Storing Base64 string directly
          timestamp: new Date().toISOString(),
        }
      };

      await set(dbRef(db, 'teams/' + teamName), payload);

      // Trigger transformation before success message and reset
      triggerTransformation(() => {
        toast.success('Team Registered Successfully!');
        setHasRegistered(true);

        // Reset Form
        setTeamName('');
        const emptyMember: Member = {
          name: '',
          regNo: '',
          year: '',
          dept: '',
          phone: '',
          residenceType: 'Day Scholar',
          hostelName: '',
          roomNumber: '',
          wardenName: '',
          wardenPhone: '',
        };

        setLeader(emptyMember);
        setMember1(emptyMember);
        setMember2(emptyMember);
        setMember3(emptyMember);
        setMember4(emptyMember);
        setShowPayment(false);
        setTransactionId('');
        setPaymentScreenshot(null);
        setTeamSize(4);
      });

    } catch (error: any) {
      console.error("Registration Error:", error);
      if (error.code === 'storage/unauthorized') {
        toast.error('Permission denied: Unable to upload screenshot. Please check your internet or contact admin.');
      } else if (error.code === 'storage/canceled') {
        toast.error('Upload canceled');
      } else if (error.code === 'storage/unknown') {
        toast.error('Unknown error occurred during upload');
      } else {
        toast.error(`Registration failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };



  /* Helper to render member fields */
  const renderMemberFields = (
    member: Member,
    setter: React.Dispatch<React.SetStateAction<Member>>,
    label: string
  ) => (
    <div className="mb-8 sub-card p-6 bg-black/40 border border-cyan-500/20 rounded-lg">
      <h3 className="text-cyan-300 font-semibold mb-6 text-xl" style={{ fontFamily: 'Orbitron' }}>
        {label}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-gray-400 text-sm">Full Name</label>
          <input
            type="text"
            placeholder="Name"
            className="glow-input"
            value={member.name}
            onChange={(e) => handleMemberChange(setter, 'name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-4">
          <label className="text-gray-400 text-sm">Register Number</label>
          <input
            type="text"
            placeholder="Register Number"
            className="glow-input"
            value={member.regNo}
            onChange={(e) => handleMemberChange(setter, 'regNo', e.target.value)}
            required
          />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-4">
          <label className="text-gray-400 text-sm">Year of Study</label>
          <select
            className="glow-input h-14 text-lg"
            value={member.year}
            onChange={(e) => handleMemberChange(setter, 'year', e.target.value)}
            required
          >
            <option value="">Select Year</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>

        <div className="space-y-4">
          <label className="text-gray-400 text-sm">Department</label>
          <input
            type="text"
            placeholder="Department (e.g. CSE)"
            className="glow-input"
            value={member.dept}
            onChange={(e) => handleMemberChange(setter, 'dept', e.target.value)}
            required
          />
        </div>

        <div className="space-y-4">
          <label className="text-gray-400 text-sm">Phone Number</label>
          <input
            type="text"
            placeholder="Phone Number"
            className="glow-input"
            value={member.phone}
            onChange={(e) => handleMemberChange(setter, 'phone', e.target.value)}
            required
          />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-4">
          <label className="text-cyan-300 font-semibold block mb-2">Residence Type</label>
          <div className="flex flex-col sm:flex-row gap-4">
            {['Day Scholar', 'Hosteller'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleMemberChange(setter, 'residenceType', type)}
                className={`glow-btn flex-1 py-4 ${member.residenceType === type ? 'bg-cyan-600/40 border-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.5)]' : 'opacity-60 hover:opacity-100'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {member.residenceType === 'Hosteller' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 pt-6 border-t border-cyan-500/30"
        >
          <h4 className="text-cyan-200 mb-4 font-mono">Hostel Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Select Hostel</label>
              <select
                className="glow-input h-14 text-lg" // Made larger
                value={member.hostelName}
                onChange={(e) => handleMemberChange(setter, 'hostelName', e.target.value)}
                required
              >
                <option value="">Choose Hostel...</option>
                {['MH-1', 'MH-2', 'MH-3', 'MH-6', 'PG', 'LH-1', 'LH-2', 'LH-3', 'LH-4'].map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Room Number</label>
              <input
                type="text"
                placeholder="Room Number"
                className="glow-input h-14"
                value={member.roomNumber}
                onChange={(e) => handleMemberChange(setter, 'roomNumber', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Warden Name</label>
              <input
                type="text"
                placeholder="Warden Name"
                className="glow-input h-14"
                value={member.wardenName}
                onChange={(e) => handleMemberChange(setter, 'wardenName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Warden Phone</label>
              <input
                type="text"
                placeholder="Warden Phone Number"
                className="glow-input h-14"
                value={member.wardenPhone}
                onChange={(e) => handleMemberChange(setter, 'wardenPhone', e.target.value)}
                required
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  if (checkingRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-cyan-400 font-bold text-xl animate-pulse" style={{ fontFamily: 'Orbitron' }}>
          VERIFYING IDENTITY...
        </div>
      </div>
    );
  }

  if (hasRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative bg-cover bg-center">
        <div className="glass-card w-full max-w-lg text-center p-8 border border-cyan-500/30">
          <h2 className="text-3xl text-yellow-400 font-bold mb-6" style={{ fontFamily: 'Orbitron' }}>
            REGISTRATION COMPLETE
          </h2>

          <div className="space-y-6 mb-8 text-left">
            {/* WhatsApp Section */}
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <p className="text-green-400 mb-2 font-bold text-center">Step 1: Join Community</p>
              <a
                href="https://chat.whatsapp.com/LMQTrtNyhO4JCYvANdMaCv"
                target="_blank"
                rel="noopener noreferrer"
                className="glow-btn bg-green-600/20 text-green-300 hover:text-white block w-full py-2 text-center"
              >
                Join WhatsApp Group
              </a>
            </div>

            {/* Google Form Section */}
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <p className="text-red-400 mb-2 font-bold text-center uppercase animate-pulse">⚠️ Mandatory Final Step ⚠️</p>
              <p className="text-gray-300 text-sm mb-3 text-center">You must submit the payment screenshot and details here to confirm your slot.</p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSc1Q7MWogzrHPpvghXj4OJXWDTMNYVB15aUVKao5esM9noPLQ/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="glow-btn bg-blue-600/20 text-blue-300 hover:text-white block w-full py-2 text-center"
              >
                Submit Google Form
              </a>
            </div>
          </div>

          <div className="mb-8 space-y-2">
            <h3 className="text-2xl text-cyan-400 font-bold" style={{ fontFamily: 'Orbitron' }}>
              WELCOME TO HACK-AI-THON
            </h3>
            <p className="text-yellow-500 font-mono tracking-widest text-lg uppercase">
              Transformers Assemble
            </p>
          </div>

          <button onClick={handleLogout} className="glow-btn w-full">
            LOGOUT
          </button>
        </div>
      </div>
    );
  }

  if (registrationCount >= 59 && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <div className="glass-card w-full max-w-2xl p-12 border border-red-500/50 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-red-900/10 animate-pulse"></div>

          <div className="relative z-10">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-4xl text-red-500 font-bold mb-6 tracking-wider" style={{ fontFamily: 'Orbitron' }}>
              REGISTRATIONS CLOSED
            </h2>

            <p className="text-xl text-gray-300 mb-8 font-mono leading-relaxed">
              The maximum limit of 59 teams has been reached. We are no longer accepting new registrations through the portal.
            </p>

            <div className="p-6 bg-red-950/30 rounded-xl border border-red-500/30 mb-8">
              <p className="text-red-300 font-semibold text-lg mb-2">Need Assistance?</p>
              <p className="text-gray-400">
                Please contact the event coordinator for more information or any special requests.
              </p>
            </div>

            <button onClick={handleLogout} className="glow-btn border-red-500 text-red-400 hover:bg-red-900/20 w-full max-w-xs mx-auto">
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showRules) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full max-w-2xl p-8 border border-cyan-500/30 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

          <h2 className="text-3xl text-center text-yellow-400 font-bold mb-8 tracking-wider" style={{ fontFamily: 'Orbitron' }}>
            RULES FROM OPTIMUS PRIME
          </h2>

          <div className="space-y-6 text-gray-200 mb-8 font-mono text-sm md:text-base">
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 text-xl">1.</span>
              <p><strong className="text-cyan-300">Verify details:</strong> Enter all info clearly and double-check before submitting.</p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-cyan-400 text-xl">2.</span>
              <p><strong className="text-cyan-300">Payment proof:</strong> You must upload a screenshot of your payment.</p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-cyan-400 text-xl">3.</span>
              <p><strong className="text-cyan-300">Join Group:</strong> Joining the official WhatsApp group is mandatory.</p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-cyan-400 text-xl">4.</span>
              <p><strong className="text-cyan-300">Final Step:</strong> Re-submit payment details in the group’s Google Form.</p>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-cyan-400 text-xl">5.</span>
              <p><strong className="text-cyan-300">Team Check:</strong> Verify every teammate's details before final submission.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
            <input
              type="checkbox"
              id="agreeRules"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
              className="w-5 h-5 accent-cyan-500 cursor-pointer"
            />
            <label htmlFor="agreeRules" className="text-gray-300 cursor-pointer select-none">
              I have read and agree to the rules above
            </label>
          </div>

          <button
            onClick={() => {
              if (agreedToRules) {
                playSfx('click');
                setShowRules(false);
              } else {
                toast.error("Please agree to the rules to proceed");
              }
            }}
            className={`glow-btn w-full ${!agreedToRules ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!agreedToRules}
          >
            SUBMIT & PROCEED
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">

      {/* Transformation Overlay */}
      <AnimatePresence>
        {isTransforming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-lg aspect-video">
              {/* Placeholder GIF - Replace with actual asset if available */}
              <img
                src={BUMBLEBEE_GIF}
                alt="Transforming..."
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <h2 className="text-yellow-400 font-black text-3xl mt-8 tracking-widest animate-pulse" style={{ fontFamily: 'Orbitron' }}>
              PROCESSING DATA...
            </h2>
            <div className="w-64 h-2 bg-gray-800 mt-4 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="h-full bg-yellow-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-4xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="title-glow text-3xl text-center md:text-left">Team Registration</h2>
          <button onClick={handleLogout} className="glow-btn text-sm px-4 py-2 w-full md:w-auto">
            Logout
          </button>
        </div>

        <form onSubmit={showPayment ? handleFinalSubmit : handleNext}>
          {!showPayment ? (
            <>
              <div className="scrollable-form">
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Team Name"
                    className="glow-input"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </div>

                {/* Team Size Selection */}
                <div className="mb-6">
                  <label className="block text-cyan-300 mb-2 font-semibold" style={{ fontFamily: 'Orbitron' }}>
                    Select Team Size
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setTeamSize(4)}
                      className={`glow-btn flex-1 ${teamSize === 4 ? 'bg-cyan-600/40 border-cyan-400' : 'opacity-50'}`}
                    >
                      4 Members
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamSize(5)}
                      className={`glow-btn flex-1 ${teamSize === 5 ? 'bg-cyan-600/40 border-cyan-400' : 'opacity-50'}`}
                    >
                      5 Members
                    </button>
                  </div>
                </div>

                {renderMemberFields(leader, setLeader, 'Team Leader')}
                {renderMemberFields(member1, setMember1, 'Member 1')}
                {renderMemberFields(member2, setMember2, 'Member 2')}
                {renderMemberFields(member3, setMember3, 'Member 3')}
                {teamSize === 5 && renderMemberFields(member4, setMember4, 'Member 4')}
              </div>

              <button type="submit" className="glow-btn w-full mt-4" disabled={loading}>
                {loading ? 'Verifying...' : 'Next: Payment'}
              </button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl text-cyan-300 font-bold mb-2" style={{ fontFamily: 'Orbitron' }}>
                  Payment Details
                </h3>
                <p className="text-gray-300">
                  Total Amount: <span className="text-cyan-400 text-xl font-bold">₹{teamSize * 200}</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">({teamSize} members × ₹200)</p>
              </div>

              <div className="flex flex-col items-center justify-center mb-8">
                <div className="bg-black/40 p-6 rounded-xl border border-cyan-500/30 w-full max-w-md">
                  <h4 className="text-cyan-400 font-bold mb-4 text-lg border-b border-cyan-500/30 pb-2 text-center" style={{ fontFamily: 'Orbitron' }}>BANK TRANSFER DETAILS</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                      <span className="text-gray-400 text-sm">Bank Name</span>
                      <span className="text-white font-mono font-bold text-right">Karur Vysya Bank</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                      <span className="text-gray-400 text-sm">Account Name</span>
                      <span className="text-white font-mono font-bold text-right">170084 KARE ACM</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                      <span className="text-gray-400 text-sm">Account Number</span>
                      <span className="text-white font-mono font-bold text-right tracking-wider">1818155000002703</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">IFSC Code</span>
                      <span className="text-white font-mono font-bold text-right tracking-wider">KVBL0001818</span>
                    </div>
                  </div>
                </div>
                <p className="text-cyan-200 text-sm mt-4">Please transfer the amount to the above account</p>
              </div>

              <div className="sub-card space-y-4">
                <div>
                  <label className="block text-cyan-300 mb-2 text-sm">Transaction ID</label>
                  <input
                    type="text"
                    placeholder="Enter UPI Transaction ID"
                    className="glow-input"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-cyan-300 mb-2 text-sm">Payment Screenshot (Max 10MB)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-cyan-300
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-cyan-900 file:text-cyan-300
                        hover:file:bg-cyan-800
                        cursor-pointer border border-cyan-500/30 rounded-lg p-2 bg-black/40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPayment(false)}
                  className="glow-btn bg-transparent border-gray-500 text-gray-300 hover:text-white w-1/3"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="glow-btn w-2/3"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Warning Popup */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          >
            <div className="border-2 border-red-500 bg-black p-8 max-w-lg w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.5)]">
              <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-black text-red-500 mb-6 tracking-widest" style={{ fontFamily: 'Orbitron' }}>
                  WARNING
                </h2>
                <p className="text-lg text-gray-300 mb-8 font-mono leading-relaxed">
                  PAYMENT VERIFICATION FAILED.
                  <br /><br />
                  Screenshot evidence is required to authorize this transaction. Please upload the payment screenshot to proceed.
                </p>
                <button
                  onClick={() => {
                    playSfx('click');
                    setShowWarning(false);
                  }}
                  className="glow-btn border-red-500 text-red-500 hover:bg-red-900/20 w-full py-4 text-xl"
                >
                  ACKNOWLEDGE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="absolute bottom-2 text-center w-full z-10 opacity-70">
        <p className="text-[10px] md:text-xs text-cyan-500/60 font-mono">
          &copy; 2026 ACM KARE | Represented by Shaik Thahah. All rights reserved.
        </p>
      </div>
    </div >
  );
};

export default RegistrationForm;
