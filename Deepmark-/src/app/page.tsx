import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header / Brand */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-sm rotate-[20deg]" />
            <span className="text-xl font-semibold tracking-tight">DeepMark</span>
          </div>
          <span className="text-sm text-[#A1A1AA]">Dashboard</span>
        </header>

        {/* Hero Metrics — verified from mockup image 2 */}
        <section className="grid grid-cols-4 gap-4 mb-12">
          <div className="bg-[#121212] rounded-lg p-6 border border-[#262626]">
            <h3 className="text-[#A1A1AA] text-sm mb-2">Total Revenue</h3>
            <p className="text-3xl font-semibold">$23,902</p>
            <p className="text-sm text-[#22C55E] mt-1">+12.5% from last month</p>
          </div>
          <div className="bg-[#121212] rounded-lg p-6 border border-[#262626]">
            <h3 className="text-[#A1A1AA] text-sm mb-2">Active Users</h3>
            <p className="text-3xl font-semibold">16,815</p>
            <p className="text-sm text-[#22C55E] mt-1">+8.1% from last month</p>
          </div>
          <div className="bg-[#121212] rounded-lg p-6 border border-[#262626]">
            <h3 className="text-[#A1A1AA] text-sm mb-2">New Users</h3>
            <p className="text-3xl font-semibold">1,457</p>
            <p className="text-sm text-[#EF4444] mt-1">-2.4% from last month</p>
          </div>
          <div className="bg-[#121212] rounded-lg p-6 border border-[#262626]">
            <h3 className="text-[#A1A1AA] text-sm mb-2">Total Members</h3>
            <p className="text-3xl font-semibold">2,023</p>
            <p className="text-sm text-[#22C55E] mt-1">+9.4% from last month</p>
          </div>
        </section>

        {/* Chart + Content Preview — mockup layout */}
        <section className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-[#121212] rounded-lg p-6 border border-[#262626]">
            <h3 className="text-sm font-medium mb-4">Revenue Overview</h3>
            <div className="h-48 bg-[#0D0D0D] rounded border border-[#171717] flex items-end gap-3 px-4 pb-2">
              <div className="w-12 bg-[#121212] h-[60%] rounded-t-sm" />
              <div className="w-12 bg-[#121212] h-[80%] rounded-t-sm" />
              <div className="w-12 bg-[#171717] h-[35%] rounded-t-sm" />
              <div className="w-12 bg-[#121212] h-[55%] rounded-t-sm" />
              <div className="w-12 bg-[#262626] h-[75%] rounded-t-sm" />
              <div className="w-12 bg-[#121212] h-[45%] rounded-t-sm" />
            </div>
          </div>
          <div className="bg-[#121212] rounded-lg p-6 border border-[#262626]">
            <h3 className="text-sm font-medium mb-2">Community Growth</h3>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full border-[6px] border-[#262626] border-t-[#22C55E] flex items-center justify-center">
                <span className="text-2xl font-bold">45%</span>
              </div>
              <p className="text-sm text-[#A1A1AA]">+9.2% from last month</p>
            </div>
          </div>
        </section>

        {/* Upcoming Content Table — verified per mockup */}
        <section className="mt-12 bg-[#121212] rounded-lg border border-[#262626] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Content</h2>
            <a href="#" className="text-sm text-[#A1A1AA] hover:text-white">View all content &rarr;</a>
          </div>
          <table className="w-full text-sm">
            <thead className="text-[#A1A1AA] border-b border-[#262626]">
              <tr>
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Platform</th>
                <th className="text-left py-2">Publish Date</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Owner</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#171717]">
                <td className="py-3">The quiet transition from code to marketing</td>
                <td>LinkedIn</td>
                <td>2 Sep 2026</td>
                <td><span className="bg-[#171717] text-[#A1A1AA] px-2 py-0.5 rounded text-xs">Scheduled</span></td>
                <td>DM / You</td>
              </tr>
              <tr className="border-b border-[#171717]">
                <td className="py-3">Why early traffic doesn't solve positioning</td>
                <td>X (Twitter)</td>
                <td>4 Sep 2026</td>
                <td><span className="bg-[#171717] text-[#A1A1AA] px-2 py-0.5 rounded text-xs">In Progress</span></td>
                <td>DM / You</td>
              </tr>
              <tr>
                <td className="py-3">DeepMark Product Update</td>
                <td>YouTube</td>
                <td>6 Sep 2026</td>
                <td><span className="bg-[#171717] text-[#A1A1AA] px-2 py-0.5 rounded text-xs">Draft</span></td>
                <td>DM / You</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
