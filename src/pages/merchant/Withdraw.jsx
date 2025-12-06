import { Wallet, History } from 'lucide-react';
import { StatCard, Card, FormField, Button, PageHeader } from '../../components/ui';

export default function Withdraw() {
  const stats = [
    { label: 'Current Withdraw Application', value: '10', lastUpdate: '17-11-2025' },
    { label: 'Total Withdraw Approve', value: '100', lastUpdate: '17-11-2025' },
    { label: 'Total Withdraw Amount', value: '10,000.00 USDT', lastUpdate: '17-11-2025' },
  ];

  const withdrawals = [
    { id: 'ap123455551', amount: '10,000.00 U', wallet: '0xF3A....12345', time: '01-11-2025 13:00', status: 'Approve' },
    { id: 'ap123455552', amount: '5,500.00 U', wallet: '0xA1B....67890', time: '01-12-2025 09:30', status: 'Approve' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Withdrawal Management" description="Overview the Details of Withdraw Information" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Withdraw Application" headerAction={<Wallet size={20} />}>
          <div className="space-y-4">
            <FormField label="Application ID">
              <input type="text" value="ap123455551" readOnly className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none" />
            </FormField>
            <FormField label="Amount Withdraw">
              <input type="text" value="10,000.00 USDT" className="w-full px-3 py-2 rounded-md border bg-background" />
            </FormField>
            <FormField label="Wallet Address">
              <input type="text" value="0xF3A1B2C3D4E5F67890123456789ABCDEF012345" readOnly className="w-full px-3 py-2 rounded-md bg-secondary/50 border-none font-mono text-xs" />
            </FormField>
            <FormField label="Merchant Order Number">
              <input type="text" className="w-full px-3 py-2 rounded-md border bg-background" placeholder="Enter order number" />
            </FormField>
            <FormField label="Reference">
              <input type="text" className="w-full px-3 py-2 rounded-md border bg-background" placeholder="Enter reference" />
            </FormField>

            <div className="pt-4 space-y-4">
              <h3 className="font-medium">Verification</h3>
              <FormField label="Login ID">
                <input type="text" className="w-full px-3 py-2 rounded-md border bg-background" />
              </FormField>
              <FormField label="Password">
                <input type="password" className="w-full px-3 py-2 rounded-md border bg-background" />
              </FormField>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1">Cancel</Button>
              <Button className="flex-1">Confirm</Button>
            </div>
          </div>
        </Card>

        <Card title="Withdrawal History" headerAction={<History size={20} />}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground font-medium">
                <tr>
                  <th className="px-6 py-3">Trans. ID</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-accent/50">
                    <td className="px-6 py-4 font-medium">{w.id}</td>
                    <td className="px-6 py-4">{w.amount}</td>
                    <td className="px-6 py-4">{w.time}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
