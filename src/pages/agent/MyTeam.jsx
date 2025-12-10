import { useState } from 'react';
import { Search, Copy, User, ChevronRight } from 'lucide-react';
import { Card, SearchBar, PageHeader } from '../../components/ui';

export default function MyTeam() {
  const [activeLevel, setActiveLevel] = useState('L1');
  const [searchTerm, setSearchTerm] = useState('');
  const referralId = '12346788';
  // TODO: Fetch referralId from API/user profile
  const referralBaseUrl = import.meta.env.VITE_REFERRAL_BASE_URL || 'https://nbn.iotareward.com';
  const referralLink = `${referralBaseUrl.replace(/^https?:\/\//, '')}/${referralId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${referralBaseUrl}/${referralId}`);
    console.log('Referral link copied to clipboard');
    // TODO: Show toast notification
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(referralId);
    console.log('Referral ID copied to clipboard');
    // TODO: Show toast notification
  };

  const allTeamMembers = [
    { id: 'u7p8....q9r0', joinDate: '15-11-2025 16:30', referrals: 2, bonus: 150.00, volume: 14000.00, level: 'L1' },
    { id: 'u7p8....q9r1', joinDate: '16-11-2025 10:30', referrals: 5, bonus: 350.00, volume: 24000.00, level: 'L1' },
    { id: 'u7p8....q9r2', joinDate: '17-11-2025 09:15', referrals: 0, bonus: 50.00, volume: 4000.00, level: 'L2' },
    { id: 'u7p8....q9r3', joinDate: '18-11-2025 14:20', referrals: 1, bonus: 100.00, volume: 8000.00, level: 'L2' },
    { id: 'u7p8....q9r4', joinDate: '19-11-2025 11:45', referrals: 3, bonus: 250.00, volume: 18000.00, level: 'L2' },
  ];

  // Filter by level first, then by search term
  const filteredMembers = allTeamMembers
    .filter(m => m.level === activeLevel)
    .filter(m => {
      if (searchTerm === '') return true;
      const searchLower = searchTerm.toLowerCase();
      return m.id.toLowerCase().includes(searchLower);
    });

  return (
    <div className="space-y-6">
      < div className="flex flex-col md:flex-row md:items-center justify-between gap-4" >
        <h1 className="text-2xl font-bold">My Team</h1>
        <div className="bg-card px-4 py-2 rounded-lg border shadow-sm flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs">Referral Link</span>
            <div className="flex items-center gap-2 font-medium">
              {referralLink}
              <Copy onClick={handleCopyLink} size={14} className="cursor-pointer hover:text-primary" />
            </div>
          </div>
          <div className="h-8 w-px bg-border"></div>
          <div>
            <span className="text-muted-foreground block text-xs">Referral ID</span>
            <div className="flex items-center gap-2 font-medium">
              {referralId}
              <Copy onClick={handleCopyId} size={14} className="cursor-pointer hover:text-primary" />
            </div>
          </div>
        </div>
      </div >

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveLevel('L1')}
          className={`p-4 rounded-xl border text-center transition-all ${activeLevel === 'L1' ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : 'bg-card hover:bg-secondary'}`}
        >
          <p className="text-3xl font-bold">24</p>
          <p className="text-sm opacity-90">Total Agent L1</p>
        </button>
        <button
          onClick={() => setActiveLevel('L2')}
          className={`p-4 rounded-xl border text-center transition-all ${activeLevel === 'L2' ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : 'bg-card hover:bg-secondary'}`}
        >
          <p className="text-3xl font-bold">100</p>
          <p className="text-sm opacity-90">Total Member L2</p>
        </button>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Team Members ({activeLevel})</h3>
          <SearchBar placeholder="Search ID..." value={searchTerm} onChange={setSearchTerm} className="max-w-xs" />
        </div>
        <div className="divide-y">
          {filteredMembers.map((member) => (
            <div key={member.id} className="py-4 hover:bg-secondary/20 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-medium font-mono">{member.id}</p>
                  <p className="text-xs text-muted-foreground">Joined: {member.joinDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 text-sm">
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Total Referral</p>
                  <p className="font-medium">{member.referrals}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Total Bonus</p>
                  <p className="font-medium text-green-600">+{member.bonus.toFixed(2)}</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-muted-foreground text-xs">Total Transaction</p>
                  <p className="font-medium">{member.volume.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div >
  );
}
